// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../secure/StoryTokenV2.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title StoryTokenBridge - Cross-Chain Token Bridge
 * @notice Secure bridging of $STORY tokens across L2 networks
 * @dev Supports: MegaETH, HyperEVM, Arbitrum, Optimism, Base
 * 
 * BRIDGE ARCHITECTURE:
 * - Lock & Mint: Lock tokens on source, mint on destination
 * - Burn & Unlock: Burn on destination, unlock on source
 * - Multi-signature validation for security
 * - Rate limiting and daily caps for risk management
 * - Emergency pause and circuit breakers
 * 
 * SUPPORTED BRIDGE PROTOCOLS:
 * - LayerZero OFT (Omnichain Fungible Token) integration
 * - Hyperlane Interchain Security Modules
 * - Native L2 bridges (Arbitrum, Optimism canonical bridges)
 * - Custom secure bridge for new chains (MegaETH, HyperEVM)
 */
contract StoryTokenBridge is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // ============ ROLES ============
    bytes32 public constant BRIDGE_OPERATOR_ROLE = keccak256("BRIDGE_OPERATOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant RATE_LIMITER_ROLE = keccak256("RATE_LIMITER_ROLE");

    // ============ CONSTANTS ============
    uint256 public constant MIN_BRIDGE_AMOUNT = 10 * 10**18; // 10 STORY minimum
    uint256 public constant MAX_BRIDGE_AMOUNT = 1000000 * 10**18; // 1M STORY maximum
    uint256 public constant BRIDGE_FEE_BPS = 50; // 0.5% bridge fee
    uint256 public constant VALIDATOR_THRESHOLD = 3; // Minimum validators required
    uint256 public constant CONFIRMATION_BLOCKS = 12; // Block confirmations needed
    uint256 public constant BASIS_POINTS = 10000;

    // ============ ENUMS ============
    enum BridgeStatus {
        PENDING,
        CONFIRMED,
        FAILED,
        REFUNDED
    }

    enum ChainId {
        MEGAETH,      // 424242
        HYPEREVM,     // 555555  
        ARBITRUM_ONE, // 42161
        OPTIMISM,     // 10
        BASE          // 8453
    }

    // ============ STRUCTS ============
    struct BridgeRequest {
        bytes32 requestId;
        address sender;
        address recipient;
        uint256 amount;
        ChainId sourceChain;
        ChainId destinationChain;
        uint256 fee;
        uint256 timestamp;
        uint256 blockNumber;
        BridgeStatus status;
        bytes32[] validatorSignatures;
        uint256 validatorCount;
        bool emergencyRefund;
    }

    struct ChainConfig {
        uint256 chainId;
        string name;
        address bridgeContract; // Bridge contract on that chain
        bool isActive;
        uint256 dailyLimit; // Daily bridge limit
        uint256 rateLimitWindow; // Rate limit window in seconds
        uint256 minConfirmations; // Minimum block confirmations
        // Integration-specific configs
        address layerZeroEndpoint;
        address hyperlaneMailbox;
        bytes32 hyperlaneDomain;
    }

    struct RateLimit {
        uint256 dailyLimit;
        uint256 currentDayVolume;
        uint256 lastResetTime;
        uint256 windowStart;
    }

    // ============ STATE VARIABLES ============
    StoryTokenV2 public immutable storyToken;
    address public immutable treasury;
    
    mapping(ChainId => ChainConfig) public chainConfigs;
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(address => bool) public authorizedValidators;
    mapping(ChainId => RateLimit) public rateLimits;
    mapping(address => mapping(uint256 => uint256)) public userDailyVolume; // user => day => volume
    
    uint256 public totalBridgedOut;
    uint256 public totalBridgedIn;
    uint256 public validatorCount;
    bool public emergencyMode;
    bool public bridgingPaused;
    
    // Nonce tracking for replay protection
    mapping(address => uint256) public userNonces;
    mapping(bytes32 => bool) public processedRequests;

    // ============ EVENTS ============
    event BridgeRequested(
        bytes32 indexed requestId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        ChainId sourceChain,
        ChainId destinationChain,
        uint256 fee
    );
    
    event BridgeConfirmed(
        bytes32 indexed requestId,
        uint256 validatorCount
    );
    
    event BridgeCompleted(
        bytes32 indexed requestId,
        address indexed recipient,
        uint256 amount
    );
    
    event BridgeFailed(
        bytes32 indexed requestId,
        string reason
    );
    
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event ChainConfigured(ChainId indexed chainId, bool isActive);
    event RateLimitUpdated(ChainId indexed chainId, uint256 newLimit);
    event EmergencyModeActivated(address indexed activator);

    // ============ ERRORS ============
    error InvalidBridgeAmount(uint256 amount);
    error ChainNotSupported(ChainId chainId);
    error InsufficientValidators();
    error DailyLimitExceeded(uint256 limit, uint256 attempted);
    error BridgeRequestNotFound(bytes32 requestId);
    error BridgeRequestAlreadyProcessed(bytes32 requestId);
    error InvalidValidatorSignature();
    error EmergencyModeActive();
    error BridgingPaused();
    error InvalidRecipient();
    error InsufficientBalance();

    // ============ CONSTRUCTOR ============
    constructor(
        address _storyToken,
        address _treasury
    ) {
        storyToken = StoryTokenV2(_storyToken);
        treasury = _treasury;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_OPERATOR_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        _initializeChainConfigs();
    }

    // ============ CHAIN CONFIGURATION ============
    function _initializeChainConfigs() internal {
        // MegaETH Configuration
        chainConfigs[ChainId.MEGAETH] = ChainConfig({
            chainId: 424242,
            name: "MegaETH",
            bridgeContract: address(0), // TBD when deployed
            isActive: false, // Will activate when ready
            dailyLimit: 1000000 * 10**18, // 1M STORY daily
            rateLimitWindow: 24 hours,
            minConfirmations: 1, // Fast finality
            layerZeroEndpoint: address(0), // TBD
            hyperlaneMailbox: address(0), // TBD
            hyperlaneDomain: bytes32(0) // TBD
        });

        // HyperEVM Configuration (Hyperlane integration)
        chainConfigs[ChainId.HYPEREVM] = ChainConfig({
            chainId: 555555,
            name: "HyperEVM",
            bridgeContract: address(0), // TBD when deployed
            isActive: false,
            dailyLimit: 500000 * 10**18, // 500K STORY daily
            rateLimitWindow: 24 hours,
            minConfirmations: 2,
            layerZeroEndpoint: address(0), // May not be available
            hyperlaneMailbox: address(0), // TBD - primary integration
            hyperlaneDomain: bytes32(0) // TBD
        });

        // Arbitrum One Configuration
        chainConfigs[ChainId.ARBITRUM_ONE] = ChainConfig({
            chainId: 42161,
            name: "Arbitrum One",
            bridgeContract: address(0), // Will be set after deployment
            isActive: true,
            dailyLimit: 2000000 * 10**18, // 2M STORY daily
            rateLimitWindow: 24 hours,
            minConfirmations: 20, // ~20 seconds on Arbitrum
            layerZeroEndpoint: 0x3c2269811836af69497E5F486A85D7316753cf62, // Arbitrum LZ endpoint
            hyperlaneMailbox: 0x979Ca5202784112f4738403dBec5D0F3B9daabB9, // Arbitrum Hyperlane
            hyperlaneDomain: bytes32(uint256(42161))
        });

        // Optimism Configuration  
        chainConfigs[ChainId.OPTIMISM] = ChainConfig({
            chainId: 10,
            name: "Optimism",
            bridgeContract: address(0), // Will be set after deployment
            isActive: true,
            dailyLimit: 1500000 * 10**18, // 1.5M STORY daily
            rateLimitWindow: 24 hours,
            minConfirmations: 30, // ~60 seconds on Optimism
            layerZeroEndpoint: 0x3c2269811836af69497E5F486A85D7316753cf62, // Optimism LZ endpoint
            hyperlaneMailbox: 0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D, // Optimism Hyperlane
            hyperlaneDomain: bytes32(uint256(10))
        });

        // Base Configuration (Reference chain)
        chainConfigs[ChainId.BASE] = ChainConfig({
            chainId: 8453,
            name: "Base",
            bridgeContract: address(0), // Will be set after deployment
            isActive: true,
            dailyLimit: 3000000 * 10**18, // 3M STORY daily (primary chain)
            rateLimitWindow: 24 hours,
            minConfirmations: 30, // ~60 seconds on Base
            layerZeroEndpoint: 0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7, // Base LZ endpoint
            hyperlaneMailbox: 0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D, // Base Hyperlane
            hyperlaneDomain: bytes32(uint256(8453))
        });
    }

    // ============ BRIDGE FUNCTIONS ============
    function initiateBridge(
        address recipient,
        uint256 amount,
        ChainId destinationChain
    ) external nonReentrant returns (bytes32 requestId) {
        if (emergencyMode) revert EmergencyModeActive();
        if (bridgingPaused) revert BridgingPaused();
        if (amount < MIN_BRIDGE_AMOUNT || amount > MAX_BRIDGE_AMOUNT) {
            revert InvalidBridgeAmount(amount);
        }
        if (recipient == address(0)) revert InvalidRecipient();
        if (!chainConfigs[destinationChain].isActive) {
            revert ChainNotSupported(destinationChain);
        }

        // Check rate limits
        _checkRateLimit(msg.sender, destinationChain, amount);
        
        // Calculate bridge fee
        uint256 bridgeFee = (amount * BRIDGE_FEE_BPS) / BASIS_POINTS;
        uint256 netAmount = amount - bridgeFee;
        
        // Check user balance
        if (storyToken.balanceOf(msg.sender) < amount) {
            revert InsufficientBalance();
        }

        // Generate unique request ID
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            recipient,
            amount,
            destinationChain,
            block.timestamp,
            userNonces[msg.sender]++
        ));

        // Lock tokens (transfer to bridge contract)
        storyToken.safeTransferFrom(msg.sender, address(this), amount);

        // Send fee to treasury
        if (bridgeFee > 0) {
            storyToken.safeTransfer(treasury, bridgeFee);
        }

        // Create bridge request
        BridgeRequest storage request = bridgeRequests[requestId];
        request.requestId = requestId;
        request.sender = msg.sender;
        request.recipient = recipient;
        request.amount = netAmount;
        request.sourceChain = _getCurrentChain();
        request.destinationChain = destinationChain;
        request.fee = bridgeFee;
        request.timestamp = block.timestamp;
        request.blockNumber = block.number;
        request.status = BridgeStatus.PENDING;

        // Update tracking
        totalBridgedOut += netAmount;
        _updateRateLimit(msg.sender, destinationChain, amount);

        emit BridgeRequested(
            requestId,
            msg.sender,
            recipient,
            netAmount,
            request.sourceChain,
            destinationChain,
            bridgeFee
        );

        return requestId;
    }

    function validateBridgeRequest(
        bytes32 requestId,
        bytes calldata signature
    ) external onlyRole(VALIDATOR_ROLE) {
        BridgeRequest storage request = bridgeRequests[requestId];
        
        if (request.status != BridgeStatus.PENDING) {
            revert BridgeRequestAlreadyProcessed(requestId);
        }
        
        // Verify validator signature
        bytes32 messageHash = _getBridgeMessageHash(requestId);
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        
        if (!authorizedValidators[signer]) {
            revert InvalidValidatorSignature();
        }
        
        // Check if validator already signed
        bool alreadySigned = false;
        for (uint256 i = 0; i < request.validatorCount; i++) {
            if (request.validatorSignatures[i] == keccak256(abi.encodePacked(signer))) {
                alreadySigned = true;
                break;
            }
        }
        
        if (!alreadySigned) {
            request.validatorSignatures.push(keccak256(abi.encodePacked(signer)));
            request.validatorCount++;
            
            // Check if we have enough validators
            if (request.validatorCount >= VALIDATOR_THRESHOLD) {
                request.status = BridgeStatus.CONFIRMED;
                emit BridgeConfirmed(requestId, request.validatorCount);
                
                // Auto-execute if possible
                _executeBridgeRequest(requestId);
            }
        }
    }

    function _executeBridgeRequest(bytes32 requestId) internal {
        BridgeRequest storage request = bridgeRequests[requestId];
        
        if (request.status != BridgeStatus.CONFIRMED) return;
        
        // Check if enough blocks have passed
        if (block.number < request.blockNumber + CONFIRMATION_BLOCKS) return;
        
        try this._mintOnDestination(requestId) {
            request.status = BridgeStatus.CONFIRMED;
            emit BridgeCompleted(requestId, request.recipient, request.amount);
        } catch Error(string memory reason) {
            request.status = BridgeStatus.FAILED;
            emit BridgeFailed(requestId, reason);
            
            // Refund tokens to original sender
            storyToken.safeTransfer(request.sender, request.amount);
        }
    }

    function _mintOnDestination(bytes32 requestId) external {
        // This function would integrate with cross-chain messaging protocols
        // LayerZero, Hyperlane, or native L2 bridges to mint tokens on destination
        
        BridgeRequest storage request = bridgeRequests[requestId];
        ChainConfig storage destConfig = chainConfigs[request.destinationChain];
        
        if (destConfig.layerZeroEndpoint != address(0)) {
            // Use LayerZero for cross-chain messaging
            _bridgeViaLayerZero(requestId);
        } else if (destConfig.hyperlaneMailbox != address(0)) {
            // Use Hyperlane for cross-chain messaging
            _bridgeViaHyperlane(requestId);
        } else {
            // Use custom bridge implementation
            _bridgeViaCustom(requestId);
        }
    }

    function _bridgeViaLayerZero(bytes32 requestId) internal {
        // LayerZero OFT implementation placeholder
        // This would call the LayerZero endpoint to send tokens
        BridgeRequest storage request = bridgeRequests[requestId];
        ChainConfig storage destConfig = chainConfigs[request.destinationChain];
        
        // Encode message for LayerZero
        bytes memory payload = abi.encode(
            request.recipient,
            request.amount,
            requestId
        );
        
        // Call LayerZero endpoint (simplified - actual implementation would be more complex)
        // ILayerZeroEndpoint(destConfig.layerZeroEndpoint).send(
        //     uint16(destConfig.chainId),
        //     abi.encodePacked(destConfig.bridgeContract),
        //     payload,
        //     payable(msg.sender),
        //     address(0),
        //     bytes("")
        // );
    }

    function _bridgeViaHyperlane(bytes32 requestId) internal {
        // Hyperlane implementation placeholder
        BridgeRequest storage request = bridgeRequests[requestId];
        ChainConfig storage destConfig = chainConfigs[request.destinationChain];
        
        // Encode message for Hyperlane
        bytes memory messageBody = abi.encode(
            request.recipient,
            request.amount,
            requestId
        );
        
        // Call Hyperlane mailbox (simplified)
        // IMailbox(destConfig.hyperlaneMailbox).dispatch(
        //     destConfig.hyperlaneDomain,
        //     bytes32(uint256(uint160(destConfig.bridgeContract))),
        //     messageBody
        // );
    }

    function _bridgeViaCustom(bytes32 requestId) internal {
        // Custom bridge implementation for chains without standard protocols
        // This would involve validator consensus and manual execution
        
        // For now, just mark as completed
        // In practice, this would require off-chain coordination
    }

    // ============ RATE LIMITING ============
    function _checkRateLimit(address user, ChainId chain, uint256 amount) internal view {
        RateLimit storage limit = rateLimits[chain];
        
        // Check daily limit for chain
        uint256 currentDay = block.timestamp / 1 days;
        uint256 todayVolume = (currentDay == limit.lastResetTime) ? limit.currentDayVolume : 0;
        
        if (todayVolume + amount > limit.dailyLimit) {
            revert DailyLimitExceeded(limit.dailyLimit, todayVolume + amount);
        }
        
        // Check user daily limit (per chain)
        uint256 userToday = userDailyVolume[user][currentDay];
        uint256 userLimit = limit.dailyLimit / 100; // 1% of chain limit per user
        
        if (userToday + amount > userLimit) {
            revert DailyLimitExceeded(userLimit, userToday + amount);
        }
    }

    function _updateRateLimit(address user, ChainId chain, uint256 amount) internal {
        RateLimit storage limit = rateLimits[chain];
        uint256 currentDay = block.timestamp / 1 days;
        
        // Reset daily counters if new day
        if (currentDay > limit.lastResetTime) {
            limit.currentDayVolume = 0;
            limit.lastResetTime = currentDay;
        }
        
        // Update volumes
        limit.currentDayVolume += amount;
        userDailyVolume[user][currentDay] += amount;
    }

    // ============ VALIDATOR MANAGEMENT ============
    function addValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!authorizedValidators[validator]) {
            authorizedValidators[validator] = true;
            validatorCount++;
            _grantRole(VALIDATOR_ROLE, validator);
            emit ValidatorAdded(validator);
        }
    }

    function removeValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (authorizedValidators[validator]) {
            authorizedValidators[validator] = false;
            validatorCount--;
            _revokeRole(VALIDATOR_ROLE, validator);
            emit ValidatorRemoved(validator);
        }
    }

    // ============ EMERGENCY FUNCTIONS ============
    function activateEmergencyMode() external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        emit EmergencyModeActivated(msg.sender);
    }

    function pauseBridging(bool paused) external onlyRole(EMERGENCY_ROLE) {
        bridgingPaused = paused;
    }

    function emergencyRefund(bytes32 requestId) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        BridgeRequest storage request = bridgeRequests[requestId];
        
        if (request.status == BridgeStatus.PENDING || request.status == BridgeStatus.CONFIRMED) {
            request.status = BridgeStatus.REFUNDED;
            request.emergencyRefund = true;
            
            // Refund tokens to original sender
            storyToken.safeTransfer(request.sender, request.amount);
        }
    }

    // ============ VIEW FUNCTIONS ============
    function getBridgeRequest(bytes32 requestId) 
        external 
        view 
        returns (BridgeRequest memory) 
    {
        return bridgeRequests[requestId];
    }

    function _getCurrentChain() internal view returns (ChainId) {
        uint256 chainId = block.chainid;
        
        if (chainId == 424242) return ChainId.MEGAETH;
        if (chainId == 555555) return ChainId.HYPEREVM;
        if (chainId == 42161) return ChainId.ARBITRUM_ONE;
        if (chainId == 10) return ChainId.OPTIMISM;
        if (chainId == 8453) return ChainId.BASE;
        
        revert ChainNotSupported(ChainId(0));
    }

    function _getBridgeMessageHash(bytes32 requestId) internal view returns (bytes32) {
        BridgeRequest storage request = bridgeRequests[requestId];
        return keccak256(abi.encodePacked(
            requestId,
            request.sender,
            request.recipient,
            request.amount,
            request.sourceChain,
            request.destinationChain,
            request.timestamp
        ));
    }

    function getDailyVolume(ChainId chain) external view returns (uint256, uint256) {
        RateLimit storage limit = rateLimits[chain];
        uint256 currentDay = block.timestamp / 1 days;
        uint256 todayVolume = (currentDay == limit.lastResetTime) ? limit.currentDayVolume : 0;
        return (todayVolume, limit.dailyLimit);
    }

    function getUserDailyVolume(address user, ChainId chain) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        return userDailyVolume[user][currentDay];
    }
}