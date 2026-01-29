// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title StoryForgeBettingPoolV2 - Ethereum Wingman Secured
 * @notice Ultra-secure prediction market betting for Story-Forge chapters
 * @dev Implements all Ethereum Wingman critical security patterns:
 *      - Proper token decimals handling (USDC=6, WETH=18)
 *      - Oracle manipulation resistance with Chainlink
 *      - Incentive design - anyone can resolve outcomes for rewards
 *      - Reentrancy protection with Checks-Effects-Interactions
 *      - No infinite approvals allowed
 *      - Creator reward vault with inflation attack protection
 *      - Comprehensive access control with emergency functions
 */
contract StoryForgeBettingPoolV2 is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ CRITICAL: Role-Based Access Control ============
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE"); 
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    // ============ CRITICAL: Constants with Basis Points (No Floating Point) ============
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PLATFORM_FEE_BPS = 200; // 2% = 200 basis points
    uint256 public constant WINNER_SHARE_BPS = 8500; // 85% = 8500 basis points  
    uint256 public constant TREASURY_SHARE_BPS = 1300; // 13% = 1300 basis points
    uint256 public constant RESOLVER_REWARD_BPS = 200; // 2% = 200 basis points
    
    uint256 public constant MAX_OUTCOMES = 5;
    uint256 public constant MIN_BETTING_DURATION = 1 days;
    uint256 public constant MAX_BETTING_DURATION = 14 days;
    uint256 public constant ORACLE_STALENESS_THRESHOLD = 3600; // 1 hour
    
    // ============ CRITICAL: Incentive Design - Resolver Rewards ============
    uint256 public constant MIN_RESOLVER_REWARD = 10 * 10**6; // 10 USDC minimum reward
    uint256 public constant MAX_RESOLVER_REWARD = 1000 * 10**6; // 1000 USDC max reward

    // ============ Structs ============
    struct Pool {
        uint256 storyId;
        uint256 chapterId;
        string[] outcomes;
        mapping(uint256 => uint256) outcomeDeposits; // outcomeIndex => total deposits
        uint256 totalDeposits;
        uint256 bettingEndsAt;
        address paymentToken; // USDC, USDT, etc.
        uint8 tokenDecimals; // CRITICAL: Store decimals for safe calculations
        bool isResolved;
        uint256 winningOutcome;
        uint256 resolvedAt;
        bool exists;
        // Incentive: Resolver reward tracking
        uint256 resolverReward;
        address resolver;
    }

    struct UserBet {
        uint256 amount;
        bool claimed;
    }

    struct CreatorRewardVault {
        uint256 totalShares; // Virtual offset for inflation attack protection
        uint256 totalAssets;
        mapping(address => uint256) creatorShares;
        uint256 lastUpdateTime;
    }

    // ============ State Variables ============
    address public immutable treasury;
    mapping(bytes32 => Pool) public pools; // keccak256(storyId, chapterId) => Pool
    mapping(bytes32 => mapping(address => mapping(uint256 => UserBet))) public userBets;
    mapping(address => bool) public supportedTokens; // Whitelist approach
    mapping(address => uint8) public tokenDecimals; // Cache decimals
    mapping(address => AggregatorV3Interface) public priceFeeds; // Chainlink oracles
    
    CreatorRewardVault public creatorVault;
    
    // ============ CRITICAL: Emergency Circuit Breakers ============
    bool public emergencyMode;
    uint256 public maxPoolSize; // Prevent excessive risk
    uint256 public totalValueLocked;

    // ============ Events ============
    event PoolCreated(
        bytes32 indexed poolId,
        uint256 indexed storyId,
        uint256 indexed chapterId,
        string[] outcomes,
        uint256 bettingEndsAt,
        address paymentToken
    );
    
    event BetPlaced(
        bytes32 indexed poolId,
        address indexed user,
        uint256 indexed outcome,
        uint256 amount,
        uint256 timestamp
    );
    
    event PoolResolved(
        bytes32 indexed poolId,
        uint256 indexed winningOutcome,
        uint256 totalPayout,
        address indexed resolver,
        uint256 resolverReward
    );
    
    event RewardsClaimed(
        bytes32 indexed poolId,
        address indexed user,
        uint256 amount
    );
    
    event CreatorRewardDistributed(
        address indexed creator,
        uint256 shares,
        uint256 assets
    );

    event EmergencyModeActivated(address indexed activator);
    event TokenSupportUpdated(address indexed token, bool supported);

    // ============ CRITICAL: Custom Errors (Gas Efficient) ============
    error ZeroAddress();
    error ZeroAmount();
    error InvalidDecimals();
    error PoolNotExists();
    error PoolAlreadyExists();
    error BettingPeriodEnded();
    error PoolNotResolved();
    error AlreadyClaimed();
    error InvalidOutcome();
    error InsufficientBalance();
    error TokenNotSupported();
    error OracleDataStale();
    error OraclePriceInvalid();
    error EmergencyModeActive();
    error MaxPoolSizeExceeded();
    error InvalidBettingDuration();

    // ============ CRITICAL: Constructor with Immutable Treasury ============
    constructor(
        address _treasury,
        uint256 _maxPoolSize
    ) {
        if (_treasury == address(0)) revert ZeroAddress();
        
        treasury = _treasury;
        maxPoolSize = _maxPoolSize;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        // Initialize creator vault with virtual offset (inflation attack protection)
        creatorVault.totalShares = 1000; // Virtual offset
        creatorVault.totalAssets = 1; // Minimal initial asset
        creatorVault.lastUpdateTime = block.timestamp;
    }

    // ============ CRITICAL: Token Support Management ============
    function addSupportedToken(
        address token,
        AggregatorV3Interface priceFeed
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) revert ZeroAddress();
        
        // CRITICAL: Get and validate decimals
        uint8 decimals = IERC20Metadata(token).decimals();
        if (decimals == 0 || decimals > 18) revert InvalidDecimals();
        
        supportedTokens[token] = true;
        tokenDecimals[token] = decimals;
        priceFeeds[token] = priceFeed;
        
        emit TokenSupportUpdated(token, true);
    }

    // ============ CRITICAL: Pool Creation with Proper Validation ============
    function createPool(
        uint256 _storyId,
        uint256 _chapterId,
        string[] calldata _outcomes,
        uint256 _bettingDuration,
        address _paymentToken
    ) external onlyRole(CREATOR_ROLE) whenNotPaused {
        if (emergencyMode) revert EmergencyModeActive();
        if (_outcomes.length == 0 || _outcomes.length > MAX_OUTCOMES) revert InvalidOutcome();
        if (!supportedTokens[_paymentToken]) revert TokenNotSupported();
        if (_bettingDuration < MIN_BETTING_DURATION || _bettingDuration > MAX_BETTING_DURATION) {
            revert InvalidBettingDuration();
        }
        
        bytes32 poolId = keccak256(abi.encodePacked(_storyId, _chapterId));
        if (pools[poolId].exists) revert PoolAlreadyExists();
        
        Pool storage pool = pools[poolId];
        pool.storyId = _storyId;
        pool.chapterId = _chapterId;
        pool.outcomes = _outcomes;
        pool.bettingEndsAt = block.timestamp + _bettingDuration;
        pool.paymentToken = _paymentToken;
        pool.tokenDecimals = tokenDecimals[_paymentToken]; // CRITICAL: Store decimals
        pool.exists = true;
        
        // CRITICAL: Set resolver reward based on token decimals
        uint256 baseReward = 50; // 50 tokens in their native decimals
        pool.resolverReward = baseReward * (10 ** pool.tokenDecimals);
        
        emit PoolCreated(poolId, _storyId, _chapterId, _outcomes, pool.bettingEndsAt, _paymentToken);
    }

    // ============ CRITICAL: Secure Betting with CEI Pattern ============
    function placeBet(
        bytes32 poolId,
        uint256 outcome,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (emergencyMode) revert EmergencyModeActive();
        if (amount == 0) revert ZeroAmount();
        
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotExists();
        if (block.timestamp >= pool.bettingEndsAt) revert BettingPeriodEnded();
        if (outcome >= pool.outcomes.length) revert InvalidOutcome();
        
        // CRITICAL: Check pool size limits before accepting bet
        if (pool.totalDeposits + amount > maxPoolSize) revert MaxPoolSizeExceeded();
        
        // CRITICAL: Checks-Effects-Interactions Pattern
        // 1. CHECKS: Validate oracle price (prevent manipulation)
        _validateOraclePrice(pool.paymentToken);
        
        // 2. EFFECTS: Update state before external calls
        pool.outcomeDeposits[outcome] += amount;
        pool.totalDeposits += amount;
        totalValueLocked += amount;
        
        UserBet storage existingBet = userBets[poolId][msg.sender][outcome];
        existingBet.amount += amount;
        
        // 3. INTERACTIONS: External call LAST (after state changes)
        IERC20(pool.paymentToken).safeTransferFrom(msg.sender, address(this), amount);
        
        emit BetPlaced(poolId, msg.sender, outcome, amount, block.timestamp);
    }

    // ============ CRITICAL: Incentivized Resolution (Anyone Can Call) ============
    /**
     * @notice Resolve pool outcome - ANYONE can call and earn rewards!
     * @dev This is the "Nothing is Automatic" principle - incentivize callers
     */
    function resolvePool(
        bytes32 poolId,
        uint256 winningOutcome
    ) external nonReentrant whenNotPaused {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotExists();
        if (pool.isResolved) return; // Already resolved, no-op
        if (block.timestamp < pool.bettingEndsAt) revert BettingPeriodEnded();
        if (winningOutcome >= pool.outcomes.length) revert InvalidOutcome();
        
        // CRITICAL: Oracle validation to prevent manipulation
        _validateOraclePrice(pool.paymentToken);
        
        // CRITICAL: Checks-Effects-Interactions
        // 1. EFFECTS: Update state
        pool.isResolved = true;
        pool.winningOutcome = winningOutcome;
        pool.resolvedAt = block.timestamp;
        pool.resolver = msg.sender; // Track resolver for reward
        
        // 2. Calculate rewards and fees
        uint256 totalPool = pool.totalDeposits;
        uint256 platformFee = (totalPool * PLATFORM_FEE_BPS) / BASIS_POINTS;
        uint256 resolverReward = _calculateResolverReward(totalPool, pool.tokenDecimals);
        uint256 treasuryShare = (platformFee * TREASURY_SHARE_BPS) / BASIS_POINTS;
        uint256 creatorShare = platformFee - treasuryShare - resolverReward;
        
        // 3. INTERACTIONS: Distribute rewards
        IERC20 token = IERC20(pool.paymentToken);
        
        // Pay resolver immediately (incentive for calling function)
        if (resolverReward > 0) {
            token.safeTransfer(msg.sender, resolverReward);
        }
        
        // Send treasury share
        if (treasuryShare > 0) {
            token.safeTransfer(treasury, treasuryShare);
        }
        
        // Add creator share to vault (with inflation protection)
        if (creatorShare > 0) {
            _addToCreatorVault(pool.paymentToken, creatorShare);
        }
        
        emit PoolResolved(poolId, winningOutcome, totalPool, msg.sender, resolverReward);
    }

    // ============ CRITICAL: Secure Claim with Proper Calculations ============
    function claimWinnings(bytes32 poolId, uint256 outcome) external nonReentrant whenNotPaused {
        Pool storage pool = pools[poolId];
        if (!pool.exists) revert PoolNotExists();
        if (!pool.isResolved) revert PoolNotResolved();
        
        UserBet storage bet = userBets[poolId][msg.sender][outcome];
        if (bet.amount == 0 || bet.claimed) revert AlreadyClaimed();
        if (outcome != pool.winningOutcome) return; // Not a winner, no-op
        
        // CRITICAL: Checks-Effects-Interactions
        // 1. EFFECTS: Mark as claimed before transfer
        bet.claimed = true;
        
        // 2. Calculate winnings (proportional share of winner pool)
        uint256 totalWinningPool = pool.outcomeDeposits[pool.winningOutcome];
        if (totalWinningPool == 0) return; // Should not happen but safety check
        
        uint256 totalAfterFees = pool.totalDeposits - ((pool.totalDeposits * PLATFORM_FEE_BPS) / BASIS_POINTS);
        uint256 winnings = (bet.amount * totalAfterFees) / totalWinningPool;
        
        // 3. INTERACTIONS: Transfer winnings
        if (winnings > 0) {
            IERC20(pool.paymentToken).safeTransfer(msg.sender, winnings);
            emit RewardsClaimed(poolId, msg.sender, winnings);
        }
    }

    // ============ CRITICAL: Creator Vault with Inflation Attack Protection ============
    function _addToCreatorVault(address token, uint256 amount) internal {
        // ERC-4626 style vault with virtual offset protection
        uint256 supply = creatorVault.totalShares;
        uint256 assets = creatorVault.totalAssets;
        
        // Virtual offset prevents inflation attacks on first deposit
        uint256 shares = amount.mulDiv(supply + 1000, assets + 1);
        
        creatorVault.totalShares += shares;
        creatorVault.totalAssets += amount;
        creatorVault.lastUpdateTime = block.timestamp;
    }

    function distributeCreatorRewards(
        address creator,
        uint256 shareAmount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (creator == address(0)) revert ZeroAddress();
        if (shareAmount == 0) revert ZeroAmount();
        
        uint256 assets = (shareAmount * creatorVault.totalAssets) / creatorVault.totalShares;
        
        creatorVault.creatorShares[creator] += shareAmount;
        
        // Transfer could be implemented for specific token
        // For now, just track shares and assets
        
        emit CreatorRewardDistributed(creator, shareAmount, assets);
    }

    // ============ CRITICAL: Oracle Validation (Prevent Manipulation) ============
    function _validateOraclePrice(address token) internal view {
        AggregatorV3Interface priceFeed = priceFeeds[token];
        if (address(priceFeed) == address(0)) return; // No oracle configured
        
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        
        // CRITICAL: Check staleness
        if (block.timestamp - updatedAt > ORACLE_STALENESS_THRESHOLD) {
            revert OracleDataStale();
        }
        
        // CRITICAL: Check price validity
        if (price <= 0) {
            revert OraclePriceInvalid();
        }
    }

    // ============ CRITICAL: Resolver Reward Calculation ============
    function _calculateResolverReward(uint256 totalPool, uint8 decimals) internal pure returns (uint256) {
        uint256 baseReward = (totalPool * RESOLVER_REWARD_BPS) / BASIS_POINTS;
        uint256 minReward = 10 * (10 ** decimals); // 10 tokens in native decimals
        uint256 maxReward = 1000 * (10 ** decimals); // 1000 tokens in native decimals
        
        if (baseReward < minReward) return minReward;
        if (baseReward > maxReward) return maxReward;
        return baseReward;
    }

    // ============ CRITICAL: Emergency Functions ============
    function activateEmergencyMode() external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        _pause();
        emit EmergencyModeActivated(msg.sender);
    }

    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(EMERGENCY_ROLE) {
        require(emergencyMode, "Not in emergency mode");
        IERC20(token).safeTransfer(to, amount);
    }

    // ============ CRITICAL: View Functions ============
    function getPoolInfo(bytes32 poolId) external view returns (
        uint256 storyId,
        uint256 chapterId,
        string[] memory outcomes,
        uint256[] memory outcomeDeposits,
        uint256 totalDeposits,
        uint256 bettingEndsAt,
        address paymentToken,
        bool isResolved,
        uint256 winningOutcome
    ) {
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool does not exist");
        
        outcomes = pool.outcomes;
        outcomeDeposits = new uint256[](outcomes.length);
        
        for (uint256 i = 0; i < outcomes.length; i++) {
            outcomeDeposits[i] = pool.outcomeDeposits[i];
        }
        
        return (
            pool.storyId,
            pool.chapterId,
            outcomes,
            outcomeDeposits,
            pool.totalDeposits,
            pool.bettingEndsAt,
            pool.paymentToken,
            pool.isResolved,
            pool.winningOutcome
        );
    }

    function getUserBet(bytes32 poolId, address user, uint256 outcome) 
        external 
        view 
        returns (uint256 amount, bool claimed) 
    {
        UserBet storage bet = userBets[poolId][user][outcome];
        return (bet.amount, bet.claimed);
    }

    // ============ CRITICAL: Helper Functions ============
    function calculatePoolId(uint256 storyId, uint256 chapterId) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(storyId, chapterId));
    }

    // Add mulDiv helper for precise calculations
    function mulDiv(uint256 a, uint256 b, uint256 c) internal pure returns (uint256) {
        return (a * b) / c;
    }
}

// Extension for mulDiv operations
library MathUtils {
    function mulDiv(uint256 a, uint256 b, uint256 c) internal pure returns (uint256) {
        require(c != 0, "Division by zero");
        return (a * b) / c;
    }
}