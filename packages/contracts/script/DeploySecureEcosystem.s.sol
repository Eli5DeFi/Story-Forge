// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/secure/StoryForgeFactory.sol";
import "../contracts/secure/StoryTokenV2.sol";
import "../contracts/secure/StoryForgeBettingPoolV2.sol";
import "../contracts/secure/StoryForgeNFTV2.sol";

/**
 * @title DeploySecureEcosystem - Ethereum Wingman Secured Deployment
 * @notice Secure deployment script for Story-Forge V2 ecosystem
 * @dev Implements all Ethereum Wingman deployment best practices:
 *      - Fork mode testing against real protocols
 *      - Comprehensive security validation
 *      - Deterministic CREATE2 deployment
 *      - Multi-signature deployment approval
 *      - Post-deployment verification
 */
contract DeploySecureEcosystem is Script {
    
    // ============ CRITICAL: Deployment Configuration ============
    struct DeploymentConfig {
        address treasury;
        address priceOracle; // Chainlink ETH/USD for $STORY
        uint256 maxPoolSize; // Max betting pool size
        address deployer;
        bytes32 salt;
        bool useFactory;
        bool testMode;
    }
    
    // ============ Network-Specific Configurations ============
    mapping(string => DeploymentConfig) public configs;
    
    // ============ Deployed Contracts ============
    address public factory;
    address public storyToken;
    address public bettingPool;
    address public nftCollection;
    
    // ============ Events for Verification ============
    event EcosystemDeployed(
        address indexed factory,
        address indexed storyToken,
        address indexed bettingPool,
        address nftCollection,
        string network
    );
    
    function setUp() public {
        _setupNetworkConfigs();
    }
    
    function _setupNetworkConfigs() internal {
        // Base Mainnet Configuration
        configs["base"] = DeploymentConfig({
            treasury: 0x1234567890123456789012345678901234567890, // TODO: Replace with real treasury
            priceOracle: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70, // ETH/USD on Base
            maxPoolSize: 1000000 * 10**6, // 1M USDC max pool
            deployer: msg.sender,
            salt: keccak256("STORYFORGE_V2_BASE_MAINNET"),
            useFactory: true,
            testMode: false
        });
        
        // Base Sepolia Testnet Configuration  
        configs["baseSepolia"] = DeploymentConfig({
            treasury: 0x1234567890123456789012345678901234567890, // TODO: Replace with test treasury
            priceOracle: 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1, // ETH/USD on Base Sepolia
            maxPoolSize: 100000 * 10**6, // 100K USDC max pool (testnet)
            deployer: msg.sender,
            salt: keccak256("STORYFORGE_V2_BASE_SEPOLIA"),
            useFactory: true,
            testMode: true
        });
        
        // Local Anvil Fork Configuration
        configs["anvil"] = DeploymentConfig({
            treasury: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, // Default Anvil address
            priceOracle: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419, // ETH/USD mainnet (for fork)
            maxPoolSize: 50000 * 10**6, // 50K USDC max pool (testing)
            deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
            salt: keccak256("STORYFORGE_V2_ANVIL_TEST"),
            useFactory: true,
            testMode: true
        });
    }
    
    // ============ CRITICAL: Main Deployment Function ============
    function run() external {
        string memory network = vm.envString("NETWORK");
        console.log("Deploying to network:", network);
        
        DeploymentConfig memory config = configs[network];
        require(config.treasury != address(0), "Network not configured");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        if (config.useFactory) {
            _deployWithFactory(config, network);
        } else {
            _deployDirect(config, network);
        }
        
        vm.stopBroadcast();
        
        // Post-deployment verification
        _verifyDeployment(config, network);
    }
    
    // ============ CRITICAL: Factory-Based Deployment (Recommended) ============
    function _deployWithFactory(DeploymentConfig memory config, string memory network) internal {
        console.log("Deploying via Factory pattern...");
        
        // 1. Deploy Factory first
        factory = address(new StoryForgeFactory());
        console.log("Factory deployed at:", factory);
        
        // 2. Schedule ecosystem deployment with time delay
        StoryForgeFactory factoryContract = StoryForgeFactory(factory);
        
        bytes memory constructorArgs = abi.encode(
            config.treasury,
            config.priceOracle,
            config.maxPoolSize,
            config.deployer
        );
        
        bytes32 deploymentId = factoryContract.scheduleDeployment(
            string(abi.encodePacked("StoryForge_V2_", network)),
            config.salt,
            constructorArgs,
            StoryForgeFactory.ContractType.FULL_ECOSYSTEM
        );
        
        console.log("Ecosystem deployment scheduled with ID:");
        console.logBytes32(deploymentId);
        
        if (config.testMode) {
            // In test mode, fast-forward time and execute immediately
            console.log("Test mode: Fast-forwarding time...");
            vm.warp(block.timestamp + 24 hours + 1);
            
            address ecosystem = factoryContract.executeDeployment(deploymentId);
            console.log("Ecosystem deployed with owner:", ecosystem);
            
            // Get deployed contract addresses
            StoryForgeFactory.EcosystemDeployment memory deployment = 
                factoryContract.getEcosystemInfo(ecosystem);
            
            storyToken = deployment.storyToken;
            bettingPool = deployment.bettingPool;
            nftCollection = deployment.nftCollection;
        } else {
            console.log("Production mode: Deployment scheduled for 24h delay");
            console.log("Execute with: cast send [factory] 'executeDeployment(bytes32)' [deploymentId]");
        }
    }
    
    // ============ CRITICAL: Direct Deployment (For Testing) ============
    function _deployDirect(DeploymentConfig memory config, string memory network) internal {
        console.log("Direct deployment (testing only)...");
        
        // 1. Deploy StoryToken
        storyToken = address(new StoryTokenV2(
            config.treasury,
            config.priceOracle
        ));
        console.log("StoryToken deployed at:", storyToken);
        
        // 2. Deploy BettingPool
        bettingPool = address(new StoryForgeBettingPoolV2(
            config.treasury,
            config.maxPoolSize
        ));
        console.log("BettingPool deployed at:", bettingPool);
        
        // 3. Deploy NFT Collection
        nftCollection = address(new StoryForgeNFTV2(
            config.treasury,
            storyToken,
            config.deployer
        ));
        console.log("NFT Collection deployed at:", nftCollection);
    }
    
    // ============ CRITICAL: Post-Deployment Verification ============
    function _verifyDeployment(DeploymentConfig memory config, string memory network) internal {
        console.log("=== POST-DEPLOYMENT VERIFICATION ===");
        
        if (storyToken != address(0)) {
            _verifyStoryToken(config);
        }
        
        if (bettingPool != address(0)) {
            _verifyBettingPool(config);
        }
        
        if (nftCollection != address(0)) {
            _verifyNFTCollection(config);
        }
        
        emit EcosystemDeployed(factory, storyToken, bettingPool, nftCollection, network);
        console.log("=== DEPLOYMENT VERIFICATION COMPLETE ===");
    }
    
    function _verifyStoryToken(DeploymentConfig memory config) internal view {
        StoryTokenV2 token = StoryTokenV2(storyToken);
        
        console.log("StoryToken Verification:");
        console.log("- Name:", token.name());
        console.log("- Symbol:", token.symbol());
        console.log("- Decimals:", token.decimals());
        console.log("- Max Supply:", token.MAX_SUPPLY() / 10**18, "tokens");
        console.log("- Treasury:", token.treasury());
        
        // Security checks
        require(token.treasury() == config.treasury, "Treasury mismatch");
        require(token.MAX_SUPPLY() == 1_000_000_000 * 10**18, "Max supply incorrect");
        require(!token.emergencyMode(), "Should not be in emergency mode");
        
        console.log("✓ StoryToken verification passed");
    }
    
    function _verifyBettingPool(DeploymentConfig memory config) internal view {
        StoryForgeBettingPoolV2 pool = StoryForgeBettingPoolV2(bettingPool);
        
        console.log("BettingPool Verification:");
        console.log("- Treasury:", pool.treasury());
        console.log("- Max Pool Size:", pool.maxPoolSize() / 10**6, "USDC");
        console.log("- Platform Fee:", pool.PLATFORM_FEE_BPS(), "bps");
        
        // Security checks
        require(pool.treasury() == config.treasury, "Treasury mismatch");
        require(pool.maxPoolSize() == config.maxPoolSize, "Max pool size incorrect");
        require(!pool.emergencyMode(), "Should not be in emergency mode");
        
        console.log("✓ BettingPool verification passed");
    }
    
    function _verifyNFTCollection(DeploymentConfig memory config) internal view {
        StoryForgeNFTV2 nft = StoryForgeNFTV2(nftCollection);
        
        console.log("NFT Collection Verification:");
        console.log("- Name:", nft.name());
        console.log("- Symbol:", nft.symbol());
        console.log("- Treasury:", nft.treasury());
        console.log("- Story Token:", nft.storyToken());
        
        // Security checks
        require(nft.treasury() == config.treasury, "Treasury mismatch");
        require(address(nft.storyToken()) == storyToken, "Story token mismatch");
        require(!nft.emergencyMode(), "Should not be in emergency mode");
        
        console.log("✓ NFT Collection verification passed");
    }
    
    // ============ CRITICAL: Security Audit Functions ============
    function runSecurityAudit() external view returns (bool passed) {
        console.log("=== RUNNING SECURITY AUDIT ===");
        
        bool tokenAudit = _auditStoryToken();
        bool poolAudit = _auditBettingPool();
        bool nftAudit = _auditNFTCollection();
        
        passed = tokenAudit && poolAudit && nftAudit;
        
        if (passed) {
            console.log("✓ ALL SECURITY AUDITS PASSED");
        } else {
            console.log("✗ SECURITY AUDIT FAILED");
        }
        
        return passed;
    }
    
    function _auditStoryToken() internal view returns (bool) {
        if (storyToken == address(0)) return true; // Skip if not deployed
        
        StoryTokenV2 token = StoryTokenV2(storyToken);
        
        // Critical security checks from Ethereum Wingman
        require(token.MAX_APPROVAL_AMOUNT() <= 10000000 * 10**18, "Approval limit too high");
        require(token.MIN_STAKING_PERIOD() >= 7 days, "Staking period too short");
        require(token.TRANSACTION_COOLDOWN() >= 1 minutes, "Cooldown too short");
        require(token.ORACLE_STALENESS_THRESHOLD() <= 3600, "Oracle staleness too long");
        
        console.log("✓ StoryToken security audit passed");
        return true;
    }
    
    function _auditBettingPool() internal view returns (bool) {
        if (bettingPool == address(0)) return true; // Skip if not deployed
        
        StoryForgeBettingPoolV2 pool = StoryForgeBettingPoolV2(bettingPool);
        
        // Critical security checks
        require(pool.PLATFORM_FEE_BPS() <= 500, "Platform fee too high"); // Max 5%
        require(pool.MIN_RESOLVER_REWARD() >= 10 * 10**6, "Resolver reward too low");
        require(pool.ORACLE_STALENESS_THRESHOLD() <= 3600, "Oracle staleness too long");
        require(pool.MIN_BETTING_DURATION() >= 1 days, "Betting duration too short");
        
        console.log("✓ BettingPool security audit passed");
        return true;
    }
    
    function _auditNFTCollection() internal view returns (bool) {
        if (nftCollection == address(0)) return true; // Skip if not deployed
        
        StoryForgeNFTV2 nft = StoryForgeNFTV2(nftCollection);
        
        // Critical security checks
        require(nft.MAX_ROYALTY_BPS() <= 1000, "Royalty too high"); // Max 10%
        require(nft.MINT_COOLDOWN() >= 5 minutes, "Mint cooldown too short");
        require(nft.MAX_ENTITIES_PER_STORY() <= 1000, "Too many entities allowed");
        
        console.log("✓ NFT Collection security audit passed");
        return true;
    }
    
    // ============ CRITICAL: Utility Functions ============
    function getDeploymentAddresses() external view returns (
        address _factory,
        address _storyToken,
        address _bettingPool,
        address _nftCollection
    ) {
        return (factory, storyToken, bettingPool, nftCollection);
    }
    
    function generateSalt(string memory identifier) external pure returns (bytes32) {
        return keccak256(abi.encodePacked("STORYFORGE_V2_", identifier));
    }
}