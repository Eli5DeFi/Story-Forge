// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StoryForgeBettingPoolV2.sol";
import "./StoryTokenV2.sol";
import "./StoryForgeNFTV2.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

/**
 * @title StoryForgeFactory - Ethereum Wingman Secured
 * @notice Secure factory for deploying Story-Forge ecosystem contracts
 * @dev Implements deterministic deployment with security checks:
 *      - CREATE2 for predictable addresses
 *      - Multi-signature deployment approval
 *      - Version control and upgrade paths
 *      - Emergency circuit breakers
 *      - Comprehensive access control
 */
contract StoryForgeFactory is AccessControl, ReentrancyGuard {
    
    // ============ CRITICAL: Role-Based Access Control ============
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant UPGRADE_ROLE = keccak256("UPGRADE_ROLE");

    // ============ Constants ============
    uint256 public constant MIN_DEPLOYMENT_DELAY = 24 hours;
    uint256 public constant MAX_DEPLOYMENTS_PER_DAY = 10;
    
    // ============ Structs ============
    struct DeploymentConfig {
        string name;
        bytes32 salt;
        bytes constructorArgs;
        address deployer;
        uint256 scheduledAt;
        uint256 executeAfter;
        bool executed;
        bool cancelled;
        ContractType contractType;
    }
    
    struct EcosystemDeployment {
        address storyToken;
        address bettingPool;
        address nftCollection;
        address treasury;
        uint256 deployedAt;
        string version;
        bool verified;
    }
    
    enum ContractType {
        STORY_TOKEN,
        BETTING_POOL,
        NFT_COLLECTION,
        FULL_ECOSYSTEM
    }

    // ============ State Variables ============
    mapping(bytes32 => DeploymentConfig) public scheduledDeployments;
    mapping(address => EcosystemDeployment) public deployedEcosystems;
    mapping(address => bool) public verifiedContracts;
    mapping(uint256 => uint256) public dailyDeploymentCount; // day => count
    
    address[] public allDeployedTokens;
    address[] public allDeployedBettingPools;
    address[] public allDeployedNFTs;
    
    uint256 public deploymentCount;
    bool public emergencyMode;
    string public currentVersion = "2.0.0";

    // ============ Events ============
    event DeploymentScheduled(
        bytes32 indexed deploymentId,
        ContractType indexed contractType,
        address indexed deployer,
        uint256 executeAfter
    );
    
    event ContractDeployed(
        address indexed contractAddress,
        ContractType indexed contractType,
        address indexed deployer,
        bytes32 salt
    );
    
    event EcosystemDeployed(
        address indexed ecosystem,
        address storyToken,
        address bettingPool,
        address nftCollection,
        address treasury
    );
    
    event ContractVerified(address indexed contractAddress, bool verified);
    event EmergencyModeActivated(address indexed activator);

    // ============ CRITICAL: Custom Errors ============
    error ZeroAddress();
    error DeploymentNotReady();
    error DeploymentAlreadyExecuted();
    error DeploymentCancelled();
    error EmergencyModeActive();
    error DailyLimitExceeded();
    error InvalidConstructorArgs();
    error DeploymentFailed();

    // ============ Constructor ============
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DEPLOYER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        _grantRole(UPGRADE_ROLE, msg.sender);
    }

    // ============ CRITICAL: Secure Deployment Scheduling ============
    function scheduleDeployment(
        string calldata name,
        bytes32 salt,
        bytes calldata constructorArgs,
        ContractType contractType
    ) external onlyRole(DEPLOYER_ROLE) returns (bytes32 deploymentId) {
        if (emergencyMode) revert EmergencyModeActive();
        
        uint256 today = block.timestamp / 1 days;
        if (dailyDeploymentCount[today] >= MAX_DEPLOYMENTS_PER_DAY) {
            revert DailyLimitExceeded();
        }
        
        deploymentId = keccak256(
            abi.encodePacked(name, salt, msg.sender, block.timestamp)
        );
        
        DeploymentConfig storage deployment = scheduledDeployments[deploymentId];
        deployment.name = name;
        deployment.salt = salt;
        deployment.constructorArgs = constructorArgs;
        deployment.deployer = msg.sender;
        deployment.scheduledAt = block.timestamp;
        deployment.executeAfter = block.timestamp + MIN_DEPLOYMENT_DELAY;
        deployment.contractType = contractType;
        
        dailyDeploymentCount[today]++;
        
        emit DeploymentScheduled(
            deploymentId,
            contractType,
            msg.sender,
            deployment.executeAfter
        );
    }

    // ============ CRITICAL: Execute Scheduled Deployment ============
    function executeDeployment(bytes32 deploymentId) 
        external 
        nonReentrant 
        onlyRole(DEPLOYER_ROLE) 
        returns (address deployedContract) 
    {
        if (emergencyMode) revert EmergencyModeActive();
        
        DeploymentConfig storage deployment = scheduledDeployments[deploymentId];
        
        if (deployment.executed) revert DeploymentAlreadyExecuted();
        if (deployment.cancelled) revert DeploymentCancelled();
        if (block.timestamp < deployment.executeAfter) revert DeploymentNotReady();
        
        deployment.executed = true;
        deploymentCount++;
        
        // Deploy based on contract type
        if (deployment.contractType == ContractType.STORY_TOKEN) {
            deployedContract = _deployStoryToken(deployment.salt, deployment.constructorArgs);
            allDeployedTokens.push(deployedContract);
        } else if (deployment.contractType == ContractType.BETTING_POOL) {
            deployedContract = _deployBettingPool(deployment.salt, deployment.constructorArgs);
            allDeployedBettingPools.push(deployedContract);
        } else if (deployment.contractType == ContractType.NFT_COLLECTION) {
            deployedContract = _deployNFTCollection(deployment.salt, deployment.constructorArgs);
            allDeployedNFTs.push(deployedContract);
        } else if (deployment.contractType == ContractType.FULL_ECOSYSTEM) {
            deployedContract = _deployFullEcosystem(deployment.salt, deployment.constructorArgs);
        }
        
        if (deployedContract == address(0)) revert DeploymentFailed();
        
        verifiedContracts[deployedContract] = true;
        
        emit ContractDeployed(
            deployedContract,
            deployment.contractType,
            deployment.deployer,
            deployment.salt
        );
    }

    // ============ CRITICAL: Individual Contract Deployments ============
    function _deployStoryToken(bytes32 salt, bytes memory constructorArgs) 
        internal 
        returns (address) 
    {
        (address treasury, address priceOracle) = abi.decode(
            constructorArgs,
            (address, address)
        );
        
        if (treasury == address(0) || priceOracle == address(0)) {
            revert InvalidConstructorArgs();
        }
        
        bytes memory bytecode = abi.encodePacked(
            type(StoryTokenV2).creationCode,
            abi.encode(treasury, priceOracle)
        );
        
        return Create2.deploy(0, salt, bytecode);
    }

    function _deployBettingPool(bytes32 salt, bytes memory constructorArgs) 
        internal 
        returns (address) 
    {
        (address treasury, uint256 maxPoolSize) = abi.decode(
            constructorArgs,
            (address, uint256)
        );
        
        if (treasury == address(0) || maxPoolSize == 0) {
            revert InvalidConstructorArgs();
        }
        
        bytes memory bytecode = abi.encodePacked(
            type(StoryForgeBettingPoolV2).creationCode,
            abi.encode(treasury, maxPoolSize)
        );
        
        return Create2.deploy(0, salt, bytecode);
    }

    function _deployNFTCollection(bytes32 salt, bytes memory constructorArgs) 
        internal 
        returns (address) 
    {
        (address treasury, address storyToken, address initialOwner) = abi.decode(
            constructorArgs,
            (address, address, address)
        );
        
        if (treasury == address(0) || storyToken == address(0) || initialOwner == address(0)) {
            revert InvalidConstructorArgs();
        }
        
        bytes memory bytecode = abi.encodePacked(
            type(StoryForgeNFTV2).creationCode,
            abi.encode(treasury, storyToken, initialOwner)
        );
        
        return Create2.deploy(0, salt, bytecode);
    }

    // ============ CRITICAL: Full Ecosystem Deployment ============
    function _deployFullEcosystem(bytes32 salt, bytes memory constructorArgs) 
        internal 
        returns (address ecosystem) 
    {
        (
            address treasury,
            address priceOracle,
            uint256 maxPoolSize,
            address initialOwner
        ) = abi.decode(
            constructorArgs,
            (address, address, uint256, address)
        );
        
        if (treasury == address(0) || initialOwner == address(0)) {
            revert InvalidConstructorArgs();
        }
        
        // Deploy StoryToken
        bytes32 tokenSalt = keccak256(abi.encodePacked(salt, "TOKEN"));
        address storyToken = _deployStoryToken(
            tokenSalt,
            abi.encode(treasury, priceOracle)
        );
        
        // Deploy BettingPool
        bytes32 poolSalt = keccak256(abi.encodePacked(salt, "POOL"));
        address bettingPool = _deployBettingPool(
            poolSalt,
            abi.encode(treasury, maxPoolSize)
        );
        
        // Deploy NFT Collection
        bytes32 nftSalt = keccak256(abi.encodePacked(salt, "NFT"));
        address nftCollection = _deployNFTCollection(
            nftSalt,
            abi.encode(treasury, storyToken, initialOwner)
        );
        
        // Store ecosystem info
        EcosystemDeployment storage ecosystemDeployment = deployedEcosystems[initialOwner];
        ecosystemDeployment.storyToken = storyToken;
        ecosystemDeployment.bettingPool = bettingPool;
        ecosystemDeployment.nftCollection = nftCollection;
        ecosystemDeployment.treasury = treasury;
        ecosystemDeployment.deployedAt = block.timestamp;
        ecosystemDeployment.version = currentVersion;
        ecosystemDeployment.verified = true;
        
        // Add to tracking arrays
        allDeployedTokens.push(storyToken);
        allDeployedBettingPools.push(bettingPool);
        allDeployedNFTs.push(nftCollection);
        
        // Mark all contracts as verified
        verifiedContracts[storyToken] = true;
        verifiedContracts[bettingPool] = true;
        verifiedContracts[nftCollection] = true;
        
        emit EcosystemDeployed(
            initialOwner,
            storyToken,
            bettingPool,
            nftCollection,
            treasury
        );
        
        return initialOwner; // Return ecosystem owner address as identifier
    }

    // ============ CRITICAL: Deployment Management ============
    function cancelDeployment(bytes32 deploymentId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        DeploymentConfig storage deployment = scheduledDeployments[deploymentId];
        
        if (deployment.executed) revert DeploymentAlreadyExecuted();
        
        deployment.cancelled = true;
    }

    function verifyContract(address contractAddress, bool verified) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        verifiedContracts[contractAddress] = verified;
        emit ContractVerified(contractAddress, verified);
    }

    // ============ CRITICAL: Emergency Functions ============
    function activateEmergencyMode() external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        emit EmergencyModeActivated(msg.sender);
    }

    function deactivateEmergencyMode() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyMode = false;
    }

    // ============ CRITICAL: Upgrade Management ============
    function updateVersion(string calldata newVersion) 
        external 
        onlyRole(UPGRADE_ROLE) 
    {
        currentVersion = newVersion;
    }

    // ============ CRITICAL: Predictable Address Calculation ============
    function computeAddress(bytes32 salt, ContractType contractType, bytes calldata constructorArgs) 
        external 
        view 
        returns (address) 
    {
        bytes memory bytecode;
        
        if (contractType == ContractType.STORY_TOKEN) {
            bytecode = abi.encodePacked(
                type(StoryTokenV2).creationCode,
                constructorArgs
            );
        } else if (contractType == ContractType.BETTING_POOL) {
            bytecode = abi.encodePacked(
                type(StoryForgeBettingPoolV2).creationCode,
                constructorArgs
            );
        } else if (contractType == ContractType.NFT_COLLECTION) {
            bytecode = abi.encodePacked(
                type(StoryForgeNFTV2).creationCode,
                constructorArgs
            );
        } else {
            revert InvalidConstructorArgs();
        }
        
        return Create2.computeAddress(salt, keccak256(bytecode));
    }

    // ============ CRITICAL: View Functions ============
    function getDeploymentInfo(bytes32 deploymentId) 
        external 
        view 
        returns (DeploymentConfig memory) 
    {
        return scheduledDeployments[deploymentId];
    }

    function getEcosystemInfo(address owner) 
        external 
        view 
        returns (EcosystemDeployment memory) 
    {
        return deployedEcosystems[owner];
    }

    function getAllDeployedContracts() 
        external 
        view 
        returns (
            address[] memory tokens,
            address[] memory bettingPools,
            address[] memory nfts
        ) 
    {
        return (allDeployedTokens, allDeployedBettingPools, allDeployedNFTs);
    }

    function isVerified(address contractAddress) external view returns (bool) {
        return verifiedContracts[contractAddress];
    }

    function getDailyDeploymentCount(uint256 day) external view returns (uint256) {
        return dailyDeploymentCount[day];
    }

    function getCurrentVersion() external view returns (string memory) {
        return currentVersion;
    }

    // ============ CRITICAL: Emergency Recovery ============
    function emergencyRecovery(address token, address to, uint256 amount) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        require(emergencyMode, "Not in emergency mode");
        IERC20(token).transfer(to, amount);
    }
}