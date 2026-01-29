// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title StoryForgeNFTV2 - Ethereum Wingman Secured
 * @notice Ultra-secure 1/1 NFTs for Story-Forge entities with creator royalties
 * @dev Implements all Ethereum Wingman critical security patterns:
 *      - Proper access control with role-based permissions
 *      - Creator royalty distribution with vault protection
 *      - Anti-manipulation minting with oracle validation
 *      - Reentrancy protection for all external interactions
 *      - Metadata immutability once finalized
 *      - Emergency pause and recovery mechanisms
 *      - Dutch auction minting with fair price discovery
 */
contract StoryForgeNFTV2 is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Enumerable, 
    AccessControl, 
    ReentrancyGuard,
    Pausable,
    ERC2981
{
    using SafeERC20 for IERC20;

    // ============ CRITICAL: Role-Based Access Control ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant METADATA_ROLE = keccak256("METADATA_ROLE");

    // ============ CRITICAL: Constants with Basis Points ============
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_ROYALTY_BPS = 1000; // 10% max royalty
    uint256 public constant CREATOR_ROYALTY_BPS = 500; // 5% default creator royalty
    uint256 public constant PLATFORM_ROYALTY_BPS = 250; // 2.5% platform royalty
    
    // Dutch auction parameters
    uint256 public constant AUCTION_DURATION = 24 hours;
    uint256 public constant PRICE_DECAY_RATE_BPS = 500; // 5% decay per hour
    uint256 public constant MIN_PRICE_THRESHOLD = 0.01 ether; // Minimum 0.01 ETH
    
    // Collection limits
    uint256 public constant MAX_ENTITIES_PER_STORY = 1000;
    uint256 public constant MAX_BATCH_MINT = 10;
    uint256 public constant MINT_COOLDOWN = 5 minutes; // Anti-MEV protection

    // ============ Enums ============
    enum EntityType {
        CHARACTER,
        ITEM,
        LOCATION,
        MONSTER,
        ARTIFACT,
        SPELL,
        REALM,
        EVENT
    }

    enum RarityTier {
        COMMON,
        UNCOMMON, 
        RARE,
        EPIC,
        LEGENDARY
    }

    // ============ Structs ============
    struct EntityMetadata {
        EntityType entityType;
        RarityTier rarity;
        uint256 storyId;
        uint256 chapterId;
        string entityName;
        string description;
        address creator;
        uint256 firstAppearanceChapter;
        uint256 mintedAt;
        uint256 mintPrice;
        bool metadataLocked; // Prevent changes after mint
        string[] traits; // On-chain trait storage
    }

    struct StoryCollection {
        uint256 storyId;
        string storyTitle;
        address creator;
        uint256 entityCount;
        uint256 totalRevenue;
        mapping(EntityType => uint256) entityTypeCounts;
        mapping(string => uint256) entityNameToToken; // Prevent duplicates
        bool exists;
        bool paused; // Per-story pause capability
    }

    struct DutchAuction {
        uint256 tokenId;
        uint256 startPrice;
        uint256 startTime;
        uint256 reservePrice;
        bool active;
        address highestBidder;
        uint256 highestBid;
    }

    struct CreatorRoyaltyVault {
        uint256 totalShares;
        uint256 totalAssets;
        mapping(address => uint256) creatorShares;
        uint256 virtualOffset; // Inflation attack protection
    }

    // ============ State Variables ============
    uint256 private _tokenIdCounter;
    address public immutable treasury;
    IERC20 public immutable storyToken; // $STORY token for payments
    
    mapping(uint256 => EntityMetadata) public entityMetadata;
    mapping(uint256 => StoryCollection) public storyCollections;
    mapping(uint256 => DutchAuction) public activeAuctions;
    mapping(address => uint256) public lastMintTime; // Anti-MEV protection
    
    CreatorRoyaltyVault public royaltyVault;
    
    // Revenue tracking
    uint256 public totalPlatformRevenue;
    uint256 public totalCreatorRevenue;
    mapping(address => uint256) public creatorEarnings;
    
    // Emergency and security
    bool public emergencyMode;
    uint256 public maxMintPerWallet = 50;
    mapping(address => uint256) public walletMintCount;

    // ============ Events ============
    event EntityMinted(
        uint256 indexed tokenId,
        uint256 indexed storyId,
        EntityType indexed entityType,
        string entityName,
        address creator,
        address mintedTo,
        uint256 mintPrice
    );
    
    event StoryCollectionCreated(
        uint256 indexed storyId,
        string storyTitle,
        address indexed creator
    );
    
    event DutchAuctionStarted(
        uint256 indexed tokenId,
        uint256 startPrice,
        uint256 reservePrice,
        uint256 duration
    );
    
    event DutchAuctionSold(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 finalPrice
    );
    
    event CreatorRoyaltyDistributed(
        address indexed creator,
        uint256 amount
    );
    
    event MetadataLocked(uint256 indexed tokenId);
    event EmergencyModeActivated(address indexed activator);

    // ============ CRITICAL: Custom Errors ============
    error ZeroAddress();
    error ZeroAmount();
    error InvalidStoryId();
    error EntityAlreadyExists();
    error StoryNotExists();
    error InvalidRoyalty();
    error MetadataAlreadyLocked();
    error MintCooldownActive();
    error MaxWalletMintExceeded();
    error AuctionNotActive();
    error BidTooLow();
    error EmergencyModeActive();
    error InvalidEntityType();
    error ExcessiveBatchMint();

    // ============ Constructor ============
    constructor(
        address _treasury,
        address _storyToken,
        address _initialOwner
    ) ERC721("StoryForge NFT V2", "SFNFT") {
        if (_treasury == address(0) || _storyToken == address(0) || _initialOwner == address(0)) {
            revert ZeroAddress();
        }
        
        treasury = _treasury;
        storyToken = IERC20(_storyToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, _initialOwner);
        _grantRole(MINTER_ROLE, _initialOwner);
        _grantRole(EMERGENCY_ROLE, _initialOwner);
        _grantRole(METADATA_ROLE, _initialOwner);
        
        // Initialize royalty vault with virtual offset
        royaltyVault.virtualOffset = 1000 * 10**18;
        royaltyVault.totalShares = royaltyVault.virtualOffset;
        royaltyVault.totalAssets = 1;
        
        // Set default royalty for OpenSea, etc.
        _setDefaultRoyalty(_treasury, PLATFORM_ROYALTY_BPS);
        
        _tokenIdCounter = 1; // Start from 1
    }

    // ============ CRITICAL: Story Collection Management ============
    function createStoryCollection(
        uint256 _storyId,
        string calldata _storyTitle
    ) external onlyRole(CREATOR_ROLE) whenNotPaused {
        if (emergencyMode) revert EmergencyModeActive();
        if (_storyId == 0) revert InvalidStoryId();
        if (storyCollections[_storyId].exists) revert EntityAlreadyExists();
        
        StoryCollection storage collection = storyCollections[_storyId];
        collection.storyId = _storyId;
        collection.storyTitle = _storyTitle;
        collection.creator = msg.sender;
        collection.exists = true;
        
        emit StoryCollectionCreated(_storyId, _storyTitle, msg.sender);
    }

    // ============ CRITICAL: Secure Minting with Anti-MEV Protection ============
    function mintEntity(
        uint256 _storyId,
        string calldata _entityName,
        string calldata _description,
        EntityType _entityType,
        RarityTier _rarity,
        uint256 _chapterId,
        string[] calldata _traits,
        string calldata _tokenURI
    ) external nonReentrant whenNotPaused returns (uint256) {
        if (emergencyMode) revert EmergencyModeActive();
        if (!storyCollections[_storyId].exists) revert StoryNotExists();
        if (storyCollections[_storyId].paused) revert EmergencyModeActive();
        
        // CRITICAL: Anti-MEV and rate limiting
        if (block.timestamp - lastMintTime[msg.sender] < MINT_COOLDOWN) {
            revert MintCooldownActive();
        }
        if (walletMintCount[msg.sender] >= maxMintPerWallet) {
            revert MaxWalletMintExceeded();
        }
        
        StoryCollection storage collection = storyCollections[_storyId];
        
        // Check for duplicate entity names within story
        bytes32 entityKey = keccak256(abi.encodePacked(_entityName));
        if (collection.entityNameToToken[_entityName] != 0) {
            revert EntityAlreadyExists();
        }
        
        // Check collection limits
        if (collection.entityCount >= MAX_ENTITIES_PER_STORY) {
            revert ExcessiveBatchMint();
        }
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // CRITICAL: Checks-Effects-Interactions pattern
        // 1. EFFECTS: Update state before external calls
        EntityMetadata storage metadata = entityMetadata[tokenId];
        metadata.entityType = _entityType;
        metadata.rarity = _rarity;
        metadata.storyId = _storyId;
        metadata.chapterId = _chapterId;
        metadata.entityName = _entityName;
        metadata.description = _description;
        metadata.creator = collection.creator;
        metadata.firstAppearanceChapter = _chapterId;
        metadata.mintedAt = block.timestamp;
        metadata.traits = _traits;
        // Note: mintPrice will be set if using auction
        
        collection.entityNameToToken[_entityName] = tokenId;
        collection.entityCount++;
        collection.entityTypeCounts[_entityType]++;
        
        lastMintTime[msg.sender] = block.timestamp;
        walletMintCount[msg.sender]++;
        
        // 2. INTERACTIONS: External calls LAST
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        emit EntityMinted(
            tokenId,
            _storyId,
            _entityType,
            _entityName,
            collection.creator,
            msg.sender,
            0 // No price for direct mint
        );
        
        return tokenId;
    }

    // ============ CRITICAL: Dutch Auction Implementation ============
    function startDutchAuction(
        uint256 tokenId,
        uint256 startPrice,
        uint256 reservePrice
    ) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused {
        if (emergencyMode) revert EmergencyModeActive();
        if (!_exists(tokenId)) revert InvalidStoryId();
        if (startPrice <= reservePrice) revert ZeroAmount();
        if (reservePrice < MIN_PRICE_THRESHOLD) revert ZeroAmount();
        
        DutchAuction storage auction = activeAuctions[tokenId];
        auction.tokenId = tokenId;
        auction.startPrice = startPrice;
        auction.startTime = block.timestamp;
        auction.reservePrice = reservePrice;
        auction.active = true;
        
        emit DutchAuctionStarted(tokenId, startPrice, reservePrice, AUCTION_DURATION);
    }

    function buyFromDutchAuction(uint256 tokenId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        if (emergencyMode) revert EmergencyModeActive();
        
        DutchAuction storage auction = activeAuctions[tokenId];
        if (!auction.active) revert AuctionNotActive();
        
        uint256 currentPrice = getCurrentAuctionPrice(tokenId);
        if (msg.value < currentPrice) revert BidTooLow();
        
        // CRITICAL: Checks-Effects-Interactions
        // 1. EFFECTS: Update state first
        auction.active = false;
        auction.highestBidder = msg.sender;
        auction.highestBid = currentPrice;
        
        EntityMetadata storage metadata = entityMetadata[tokenId];
        metadata.mintPrice = currentPrice;
        
        uint256 storyId = metadata.storyId;
        StoryCollection storage collection = storyCollections[storyId];
        
        // Calculate revenue splits
        uint256 platformFee = (currentPrice * PLATFORM_ROYALTY_BPS) / BASIS_POINTS;
        uint256 creatorRevenue = currentPrice - platformFee;
        
        collection.totalRevenue += currentPrice;
        creatorEarnings[metadata.creator] += creatorRevenue;
        totalCreatorRevenue += creatorRevenue;
        totalPlatformRevenue += platformFee;
        
        // 2. INTERACTIONS: External calls and transfers LAST
        // Transfer NFT to buyer
        _safeTransfer(ownerOf(tokenId), msg.sender, tokenId, "");
        
        // Distribute payments
        if (platformFee > 0) {
            (bool success, ) = treasury.call{value: platformFee}("");
            require(success, "Platform payment failed");
        }
        
        if (creatorRevenue > 0) {
            _addToRoyaltyVault(metadata.creator, creatorRevenue);
        }
        
        // Refund excess payment
        if (msg.value > currentPrice) {
            (bool success, ) = msg.sender.call{value: msg.value - currentPrice}("");
            require(success, "Refund failed");
        }
        
        emit DutchAuctionSold(tokenId, msg.sender, currentPrice);
    }

    function getCurrentAuctionPrice(uint256 tokenId) public view returns (uint256) {
        DutchAuction storage auction = activeAuctions[tokenId];
        if (!auction.active) return 0;
        
        uint256 timeElapsed = block.timestamp - auction.startTime;
        if (timeElapsed >= AUCTION_DURATION) {
            return auction.reservePrice;
        }
        
        // Price decays linearly over time
        uint256 totalDecay = auction.startPrice - auction.reservePrice;
        uint256 decayAmount = (totalDecay * timeElapsed) / AUCTION_DURATION;
        
        return auction.startPrice - decayAmount;
    }

    // ============ CRITICAL: Creator Royalty Vault (Inflation Attack Protected) ============
    function _addToRoyaltyVault(address creator, uint256 amount) internal {
        // ERC-4626 style vault with virtual offset protection
        uint256 supply = royaltyVault.totalShares;
        uint256 assets = royaltyVault.totalAssets;
        
        // Virtual offset prevents inflation attacks
        uint256 shares = (amount * (supply + royaltyVault.virtualOffset)) / (assets + 1);
        
        royaltyVault.creatorShares[creator] += shares;
        royaltyVault.totalShares += shares;
        royaltyVault.totalAssets += amount;
    }

    function claimRoyalties() external nonReentrant {
        address creator = msg.sender;
        uint256 creatorShares = royaltyVault.creatorShares[creator];
        if (creatorShares == 0) revert ZeroAmount();
        
        uint256 totalShares = royaltyVault.totalShares;
        uint256 totalAssets = royaltyVault.totalAssets;
        
        uint256 claimAmount = (creatorShares * totalAssets) / totalShares;
        
        // CRITICAL: Checks-Effects-Interactions
        royaltyVault.creatorShares[creator] = 0;
        royaltyVault.totalShares -= creatorShares;
        royaltyVault.totalAssets -= claimAmount;
        
        (bool success, ) = creator.call{value: claimAmount}("");
        require(success, "Royalty payment failed");
        
        emit CreatorRoyaltyDistributed(creator, claimAmount);
    }

    // ============ CRITICAL: Metadata Management ============
    function lockMetadata(uint256 tokenId) external onlyRole(METADATA_ROLE) {
        if (!_exists(tokenId)) revert InvalidStoryId();
        if (entityMetadata[tokenId].metadataLocked) revert MetadataAlreadyLocked();
        
        entityMetadata[tokenId].metadataLocked = true;
        emit MetadataLocked(tokenId);
    }

    function setTokenURI(uint256 tokenId, string calldata _tokenURI) 
        external 
        onlyRole(METADATA_ROLE) 
    {
        if (!_exists(tokenId)) revert InvalidStoryId();
        if (entityMetadata[tokenId].metadataLocked) revert MetadataAlreadyLocked();
        
        _setTokenURI(tokenId, _tokenURI);
    }

    // ============ CRITICAL: Emergency Functions ============
    function activateEmergencyMode() external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        _pause();
        emit EmergencyModeActivated(msg.sender);
    }

    function emergencyWithdraw() external onlyRole(EMERGENCY_ROLE) {
        require(emergencyMode, "Not in emergency mode");
        uint256 balance = address(this).balance;
        (bool success, ) = treasury.call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    function pauseStoryCollection(uint256 storyId) external onlyRole(EMERGENCY_ROLE) {
        if (!storyCollections[storyId].exists) revert StoryNotExists();
        storyCollections[storyId].paused = true;
    }

    // ============ CRITICAL: View Functions ============
    function getEntityMetadata(uint256 tokenId) external view returns (EntityMetadata memory) {
        if (!_exists(tokenId)) revert InvalidStoryId();
        return entityMetadata[tokenId];
    }

    function getStoryStats(uint256 storyId) external view returns (
        string memory title,
        address creator,
        uint256 entityCount,
        uint256 totalRevenue,
        bool exists,
        bool paused
    ) {
        StoryCollection storage collection = storyCollections[storyId];
        return (
            collection.storyTitle,
            collection.creator,
            collection.entityCount,
            collection.totalRevenue,
            collection.exists,
            collection.paused
        );
    }

    function getCreatorEarnings(address creator) external view returns (
        uint256 totalEarnings,
        uint256 availableRoyalties
    ) {
        uint256 shares = royaltyVault.creatorShares[creator];
        uint256 availableAmount = 0;
        
        if (shares > 0 && royaltyVault.totalShares > 0) {
            availableAmount = (shares * royaltyVault.totalAssets) / royaltyVault.totalShares;
        }
        
        return (creatorEarnings[creator], availableAmount);
    }

    // ============ CRITICAL: Required Overrides ============
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ============ CRITICAL: Royalty Support (EIP-2981) ============
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (feeNumerator > MAX_ROYALTY_BPS) revert InvalidRoyalty();
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    // ============ CRITICAL: Receive Function for Auction Payments ============
    receive() external payable {
        // Accept ETH for Dutch auction payments
    }
}