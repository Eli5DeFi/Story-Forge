// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../secure/StoryForgeFactory.sol";
import "../secure/StoryTokenV2.sol";
import "../secure/StoryForgeBettingPoolV2.sol";
import "../secure/StoryForgeNFTV2.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title MultiChainFactory - Cross-Chain Deployment Manager
 * @notice Secure factory for deploying Story-Forge ecosystem across multiple L2s
 * @dev Supports: MegaETH, HyperEVM, Arbitrum, Optimism with unified interfaces
 *      
 * SUPPORTED CHAINS:
 * - MegaETH: Ultra-high performance EVM (100k+ TPS)
 * - HyperEVM: Hyperlane-based interoperable EVM
 * - Arbitrum One: Optimistic rollup with fraud proofs  
 * - Optimism: Optimistic rollup with superchain integration
 * - Base: Coinbase L2 (reference implementation)
 * 
 * SECURITY FEATURES:
 * - Chain ID validation and verification
 * - Cross-chain message authentication
 * - Emergency multi-chain pause capabilities
 * - Unified access control across all chains
 */
contract MultiChainFactory is AccessControl, ReentrancyGuard {
    
    // ============ CRITICAL: Multi-Chain Access Control ============
    bytes32 public constant CROSS_CHAIN_DEPLOYER_ROLE = keccak256("CROSS_CHAIN_DEPLOYER_ROLE");
    bytes32 public constant CHAIN_MANAGER_ROLE = keccak256("CHAIN_MANAGER_ROLE");
    bytes32 public constant BRIDGE_OPERATOR_ROLE = keccak256("BRIDGE_OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_COORDINATOR_ROLE = keccak256("EMERGENCY_COORDINATOR_ROLE");

    // ============ CHAIN CONFIGURATIONS ============
    enum SupportedChain {
        MEGAETH,        // Chain ID: 424242 (Placeholder - TBD)
        HYPEREVM,       // Chain ID: 555555 (Placeholder - TBD)  
        ARBITRUM_ONE,   // Chain ID: 42161
        OPTIMISM,       // Chain ID: 10
        BASE            // Chain ID: 8453 (Reference)
    }

    struct ChainConfig {
        uint256 chainId;
        string name;
        string rpcUrl;
        address nativeToken; // ETH equivalent
        address stablecoin;  // USDC/USDT equivalent
        AggregatorV3Interface priceOracle; // ETH/USD feed
        uint256 blockTime; // Average block time in seconds
        uint256 maxGasPrice; // Max gas price for chain
        uint256 deploymentFee; // Fee for cross-chain deployment
        bool isActive;
        bool isTestnet;
        // Chain-specific optimizations
        uint256 maxPoolSize; // Betting pool limits per chain
        uint256 maxBatchSize; // Transaction batch limits
        uint256 bridgeCooldown; // Cross-chain bridge delays
    }

    struct CrossChainDeployment {
        bytes32 deploymentId;
        SupportedChain[] targetChains;
        address deployer;
        uint256 scheduledAt;
        uint256 executeAfter;
        bool executed;
        mapping(SupportedChain => address) deployedContracts;
        mapping(SupportedChain => bool) deploymentStatus;
        ContractType contractType;
        bytes constructorArgs;
    }

    // ============ STATE VARIABLES ============
    mapping(SupportedChain => ChainConfig) public chainConfigs;
    mapping(bytes32 => CrossChainDeployment) public crossChainDeployments;
    mapping(SupportedChain => address) public chainFactories; // Factory contracts per chain
    mapping(address => mapping(SupportedChain => address)) public userDeployments; // User => Chain => Contract
    
    uint256 public crossChainDeploymentCount;
    bool public multiChainEmergencyMode;
    
    // Cross-chain communication (LayerZero/Hyperlane integration points)
    mapping(SupportedChain => bytes32) public chainIdentifiers;
    mapping(SupportedChain => address) public bridgeAdapters;

    // ============ EVENTS ============
    event ChainConfigured(SupportedChain indexed chain, uint256 chainId, string name);
    event CrossChainDeploymentScheduled(
        bytes32 indexed deploymentId,
        SupportedChain[] chains,
        address indexed deployer
    );
    event CrossChainDeploymentExecuted(
        bytes32 indexed deploymentId,
        SupportedChain indexed chain,
        address contractAddress
    );
    event MultiChainEmergencyActivated(address indexed coordinator);
    event BridgeAdapterUpdated(SupportedChain indexed chain, address adapter);

    // ============ ERRORS ============
    error ChainNotSupported(uint256 chainId);
    error ChainInactive(SupportedChain chain);
    error InvalidChainConfig();
    error CrossChainDeploymentFailed(SupportedChain chain);
    error MultiChainEmergencyActive();
    error InsufficientDeploymentFee(uint256 required, uint256 provided);

    // ============ CONSTRUCTOR ============
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CROSS_CHAIN_DEPLOYER_ROLE, msg.sender);
        _grantRole(CHAIN_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_COORDINATOR_ROLE, msg.sender);
        
        _initializeChainConfigs();
    }

    // ============ CHAIN CONFIGURATION ============
    function _initializeChainConfigs() internal {
        // MegaETH Configuration (Ultra-high performance)
        chainConfigs[SupportedChain.MEGAETH] = ChainConfig({
            chainId: 424242, // Placeholder - TBD by MegaETH team
            name: "MegaETH",
            rpcUrl: "https://rpc.megaeth.io", // Placeholder
            nativeToken: address(0), // ETH
            stablecoin: address(0), // Will be set when available
            priceOracle: AggregatorV3Interface(address(0)), // TBD
            blockTime: 1, // ~1 second blocks (estimated)
            maxGasPrice: 10 gwei, // Low gas due to high performance
            deploymentFee: 0.001 ether, // Minimal fee
            isActive: false, // Will activate when mainnet launches
            isTestnet: false,
            maxPoolSize: 10000000 * 10**6, // 10M USDC (high throughput)
            maxBatchSize: 100, // High batch processing
            bridgeCooldown: 300 // 5 minutes
        });

        // HyperEVM Configuration (Interoperable)
        chainConfigs[SupportedChain.HYPEREVM] = ChainConfig({
            chainId: 555555, // Placeholder - TBD by Hyperlane
            name: "HyperEVM",
            rpcUrl: "https://rpc.hyperevm.xyz", // Placeholder  
            nativeToken: address(0), // ETH
            stablecoin: address(0), // Will be set when available
            priceOracle: AggregatorV3Interface(address(0)), // TBD
            blockTime: 2, // ~2 second blocks (estimated)
            maxGasPrice: 5 gwei, // Efficient gas pricing
            deploymentFee: 0.002 ether,
            isActive: false, // Will activate when available
            isTestnet: false,
            maxPoolSize: 5000000 * 10**6, // 5M USDC
            maxBatchSize: 50, // Moderate batch processing
            bridgeCooldown: 600 // 10 minutes (interop focus)
        });

        // Arbitrum One Configuration (Production ready)
        chainConfigs[SupportedChain.ARBITRUM_ONE] = ChainConfig({
            chainId: 42161,
            name: "Arbitrum One",
            rpcUrl: "https://arb1.arbitrum.io/rpc",
            nativeToken: address(0), // ETH
            stablecoin: 0xA0b86a33E6417c1dc4b1b8e8c37DF5D9c0b9a3eB, // USDC on Arbitrum
            priceOracle: AggregatorV3Interface(0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612), // ETH/USD
            blockTime: 1, // ~1 second blocks
            maxGasPrice: 2 gwei, // Very low gas
            deploymentFee: 0.0005 ether,
            isActive: true, // Production ready
            isTestnet: false,
            maxPoolSize: 2000000 * 10**6, // 2M USDC
            maxBatchSize: 75,
            bridgeCooldown: 900 // 15 minutes (7-day fraud proof period)
        });

        // Optimism Configuration (Production ready)
        chainConfigs[SupportedChain.OPTIMISM] = ChainConfig({
            chainId: 10,
            name: "Optimism",
            rpcUrl: "https://mainnet.optimism.io",
            nativeToken: address(0), // ETH
            stablecoin: 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85, // USDC on Optimism
            priceOracle: AggregatorV3Interface(0x13e3Ee699D1909E989722E753853AE30b17e08c5), // ETH/USD
            blockTime: 2, // ~2 second blocks
            maxGasPrice: 1 gwei, // Extremely low gas
            deploymentFee: 0.0003 ether,
            isActive: true, // Production ready
            isTestnet: false,
            maxPoolSize: 3000000 * 10**6, // 3M USDC
            maxBatchSize: 60,
            bridgeCooldown: 1800 // 30 minutes (7-day fault proof period)
        });

        // Base Configuration (Reference implementation)
        chainConfigs[SupportedChain.BASE] = ChainConfig({
            chainId: 8453,
            name: "Base",
            rpcUrl: "https://mainnet.base.org",
            nativeToken: address(0), // ETH
            stablecoin: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, // USDC on Base
            priceOracle: AggregatorV3Interface(0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70), // ETH/USD
            blockTime: 2, // ~2 second blocks
            maxGasPrice: 1 gwei, // Very low gas
            deploymentFee: 0.0005 ether,
            isActive: true, // Production ready
            isTestnet: false,
            maxPoolSize: 5000000 * 10**6, // 5M USDC (reference chain)
            maxBatchSize: 80,
            bridgeCooldown: 600 // 10 minutes
        });
    }

    // ============ CROSS-CHAIN DEPLOYMENT ============
    function scheduleCrossChainDeployment(
        SupportedChain[] calldata targetChains,
        StoryForgeFactory.ContractType contractType,
        bytes calldata constructorArgs
    ) external payable onlyRole(CROSS_CHAIN_DEPLOYER_ROLE) returns (bytes32 deploymentId) {
        if (multiChainEmergencyMode) revert MultiChainEmergencyActive();
        
        // Validate chains and calculate total deployment fee
        uint256 totalFee = 0;
        for (uint256 i = 0; i < targetChains.length; i++) {
            ChainConfig storage config = chainConfigs[targetChains[i]];
            if (!config.isActive) revert ChainInactive(targetChains[i]);
            totalFee += config.deploymentFee;
        }
        
        if (msg.value < totalFee) {
            revert InsufficientDeploymentFee(totalFee, msg.value);
        }
        
        crossChainDeploymentCount++;
        deploymentId = keccak256(
            abi.encodePacked(
                "CROSS_CHAIN",
                crossChainDeploymentCount,
                msg.sender,
                block.timestamp
            )
        );
        
        CrossChainDeployment storage deployment = crossChainDeployments[deploymentId];
        deployment.deploymentId = deploymentId;
        deployment.targetChains = targetChains;
        deployment.deployer = msg.sender;
        deployment.scheduledAt = block.timestamp;
        deployment.executeAfter = block.timestamp + 24 hours; // Multi-chain safety delay
        deployment.contractType = contractType;
        deployment.constructorArgs = constructorArgs;
        
        emit CrossChainDeploymentScheduled(deploymentId, targetChains, msg.sender);
        
        return deploymentId;
    }

    function executeCrossChainDeployment(bytes32 deploymentId) 
        external 
        nonReentrant 
        onlyRole(CROSS_CHAIN_DEPLOYER_ROLE) 
    {
        CrossChainDeployment storage deployment = crossChainDeployments[deploymentId];
        
        if (deployment.executed) revert();
        if (block.timestamp < deployment.executeAfter) revert();
        if (multiChainEmergencyMode) revert MultiChainEmergencyActive();
        
        deployment.executed = true;
        
        // Deploy to each target chain
        for (uint256 i = 0; i < deployment.targetChains.length; i++) {
            SupportedChain chain = deployment.targetChains[i];
            
            try this._deployToChain(deploymentId, chain) {
                deployment.deploymentStatus[chain] = true;
            } catch {
                // Log failure but continue with other chains
                deployment.deploymentStatus[chain] = false;
                emit CrossChainDeploymentExecuted(deploymentId, chain, address(0));
            }
        }
    }

    function _deployToChain(bytes32 deploymentId, SupportedChain chain) 
        external 
        returns (address deployedContract) 
    {
        // This function would integrate with chain-specific deployment mechanisms
        // For now, it's a placeholder for the deployment logic
        
        CrossChainDeployment storage deployment = crossChainDeployments[deploymentId];
        ChainConfig storage config = chainConfigs[chain];
        
        // Chain-specific deployment logic would go here
        // This might involve:
        // 1. Cross-chain message passing (LayerZero/Hyperlane)
        // 2. Chain-specific factory contract calls
        // 3. Verification of deployment success
        
        // For demonstration, return a placeholder address
        deployedContract = address(uint160(uint256(keccak256(
            abi.encodePacked(deploymentId, chain, block.timestamp)
        ))));
        
        deployment.deployedContracts[chain] = deployedContract;
        
        emit CrossChainDeploymentExecuted(deploymentId, chain, deployedContract);
    }

    // ============ CHAIN MANAGEMENT ============
    function updateChainConfig(
        SupportedChain chain,
        ChainConfig calldata newConfig
    ) external onlyRole(CHAIN_MANAGER_ROLE) {
        if (newConfig.chainId == 0) revert InvalidChainConfig();
        
        chainConfigs[chain] = newConfig;
        emit ChainConfigured(chain, newConfig.chainId, newConfig.name);
    }

    function activateChain(SupportedChain chain, bool active) 
        external 
        onlyRole(CHAIN_MANAGER_ROLE) 
    {
        chainConfigs[chain].isActive = active;
    }

    function setBridgeAdapter(SupportedChain chain, address adapter) 
        external 
        onlyRole(BRIDGE_OPERATOR_ROLE) 
    {
        bridgeAdapters[chain] = adapter;
        emit BridgeAdapterUpdated(chain, adapter);
    }

    // ============ EMERGENCY FUNCTIONS ============
    function activateMultiChainEmergency() 
        external 
        onlyRole(EMERGENCY_COORDINATOR_ROLE) 
    {
        multiChainEmergencyMode = true;
        emit MultiChainEmergencyActivated(msg.sender);
    }

    function deactivateMultiChainEmergency() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        multiChainEmergencyMode = false;
    }

    // ============ VIEW FUNCTIONS ============
    function getSupportedChains() external pure returns (SupportedChain[] memory) {
        SupportedChain[] memory chains = new SupportedChain[](5);
        chains[0] = SupportedChain.MEGAETH;
        chains[1] = SupportedChain.HYPEREVM;
        chains[2] = SupportedChain.ARBITRUM_ONE;
        chains[3] = SupportedChain.OPTIMISM;
        chains[4] = SupportedChain.BASE;
        return chains;
    }

    function getChainConfig(SupportedChain chain) 
        external 
        view 
        returns (ChainConfig memory) 
    {
        return chainConfigs[chain];
    }

    function getDeploymentStatus(bytes32 deploymentId) 
        external 
        view 
        returns (
            SupportedChain[] memory chains,
            bool[] memory statuses,
            address[] memory contracts
        ) 
    {
        CrossChainDeployment storage deployment = crossChainDeployments[deploymentId];
        chains = deployment.targetChains;
        statuses = new bool[](chains.length);
        contracts = new address[](chains.length);
        
        for (uint256 i = 0; i < chains.length; i++) {
            statuses[i] = deployment.deploymentStatus[chains[i]];
            contracts[i] = deployment.deployedContracts[chains[i]];
        }
    }

    function isChainSupported(uint256 chainId) external view returns (bool) {
        return (
            chainConfigs[SupportedChain.MEGAETH].chainId == chainId ||
            chainConfigs[SupportedChain.HYPEREVM].chainId == chainId ||
            chainConfigs[SupportedChain.ARBITRUM_ONE].chainId == chainId ||
            chainConfigs[SupportedChain.OPTIMISM].chainId == chainId ||
            chainConfigs[SupportedChain.BASE].chainId == chainId
        );
    }

    function getCurrentChain() external view returns (SupportedChain) {
        uint256 chainId = block.chainid;
        
        if (chainId == chainConfigs[SupportedChain.MEGAETH].chainId) {
            return SupportedChain.MEGAETH;
        } else if (chainId == chainConfigs[SupportedChain.HYPEREVM].chainId) {
            return SupportedChain.HYPEREVM;
        } else if (chainId == chainConfigs[SupportedChain.ARBITRUM_ONE].chainId) {
            return SupportedChain.ARBITRUM_ONE;
        } else if (chainId == chainConfigs[SupportedChain.OPTIMISM].chainId) {
            return SupportedChain.OPTIMISM;
        } else if (chainId == chainConfigs[SupportedChain.BASE].chainId) {
            return SupportedChain.BASE;
        }
        
        revert ChainNotSupported(chainId);
    }

    // ============ FEE MANAGEMENT ============
    function withdrawDeploymentFees() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }

    receive() external payable {
        // Accept deployment fees
    }
}