// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title StoryForgeNFT
 * @notice 1/1 NFTs for Story-Forge entities (characters, items, locations, monsters)
 * @dev Each entity from the story is minted as a unique NFT
 */
contract StoryForgeNFT is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _tokenIdCounter;

    enum EntityType {
        CHARACTER,
        ITEM,
        LOCATION,
        MONSTER
    }

    struct EntityMetadata {
        EntityType entityType;
        string storyId;
        string entityName;
        uint256 firstAppearanceChapter;
        uint256 mintedAt;
    }

    // Token ID => Entity metadata
    mapping(uint256 => EntityMetadata) public tokenMetadata;

    // Story ID => Entity Name => Token ID (to prevent duplicate mints)
    mapping(string => mapping(string => uint256)) public storyEntityToToken;

    // Entity type counts per story
    mapping(string => mapping(EntityType => uint256)) public entityTypeCounts;

    // ============ Events ============
    event EntityMinted(
        uint256 indexed tokenId,
        EntityType indexed entityType,
        string storyId,
        string entityName,
        address indexed mintedTo,
        uint256 firstAppearanceChapter
    );

    // ============ Errors ============
    error EntityAlreadyMinted(string storyId, string entityName);
    error InvalidEntityType();
    error ZeroAddress();

    constructor() ERC721("Story Forge Entities", "FORGE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Mint a new 1/1 entity NFT
     * @param to Recipient address
     * @param entityType Type of entity (0=CHARACTER, 1=ITEM, 2=LOCATION, 3=MONSTER)
     * @param storyId Story identifier
     * @param entityName Name of the entity
     * @param firstAppearance Chapter of first appearance
     * @param uri IPFS URI for metadata
     */
    function mintEntity(
        address to,
        EntityType entityType,
        string memory storyId,
        string memory entityName,
        uint256 firstAppearance,
        string memory uri
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        if (storyEntityToToken[storyId][entityName] != 0) {
            revert EntityAlreadyMinted(storyId, entityName);
        }

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        tokenMetadata[tokenId] = EntityMetadata({
            entityType: entityType,
            storyId: storyId,
            entityName: entityName,
            firstAppearanceChapter: firstAppearance,
            mintedAt: block.timestamp
        });

        storyEntityToToken[storyId][entityName] = tokenId;
        entityTypeCounts[storyId][entityType]++;

        emit EntityMinted(tokenId, entityType, storyId, entityName, to, firstAppearance);

        return tokenId;
    }

    /**
     * @notice Batch mint multiple entities
     * @param to Recipient address for all NFTs
     * @param entityTypes Array of entity types
     * @param storyIds Array of story IDs
     * @param entityNames Array of entity names
     * @param firstAppearances Array of first appearance chapters
     * @param uris Array of metadata URIs
     */
    function batchMintEntities(
        address to,
        EntityType[] memory entityTypes,
        string[] memory storyIds,
        string[] memory entityNames,
        uint256[] memory firstAppearances,
        string[] memory uris
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(
            entityTypes.length == storyIds.length &&
                storyIds.length == entityNames.length &&
                entityNames.length == firstAppearances.length &&
                firstAppearances.length == uris.length,
            "Array length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](entityTypes.length);

        for (uint256 i = 0; i < entityTypes.length; i++) {
            // Skip already minted entities instead of reverting
            if (storyEntityToToken[storyIds[i]][entityNames[i]] != 0) {
                tokenIds[i] = storyEntityToToken[storyIds[i]][entityNames[i]];
                continue;
            }

            tokenIds[i] = this.mintEntity(
                to,
                entityTypes[i],
                storyIds[i],
                entityNames[i],
                firstAppearances[i],
                uris[i]
            );
        }

        return tokenIds;
    }

    // ============ View Functions ============

    /**
     * @notice Get all token IDs owned by an address
     * @param owner The address to query
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }

        return tokens;
    }

    /**
     * @notice Get entity metadata for a token
     * @param tokenId The token ID
     */
    function getEntityMetadata(uint256 tokenId)
        external
        view
        returns (
            EntityType entityType,
            string memory storyId,
            string memory entityName,
            uint256 firstAppearanceChapter,
            uint256 mintedAt
        )
    {
        EntityMetadata storage metadata = tokenMetadata[tokenId];
        return (
            metadata.entityType,
            metadata.storyId,
            metadata.entityName,
            metadata.firstAppearanceChapter,
            metadata.mintedAt
        );
    }

    /**
     * @notice Check if an entity has been minted
     * @param storyId The story ID
     * @param entityName The entity name
     */
    function isEntityMinted(string memory storyId, string memory entityName)
        external
        view
        returns (bool)
    {
        return storyEntityToToken[storyId][entityName] != 0;
    }

    /**
     * @notice Get token ID for a story entity
     * @param storyId The story ID
     * @param entityName The entity name
     */
    function getEntityTokenId(string memory storyId, string memory entityName)
        external
        view
        returns (uint256)
    {
        return storyEntityToToken[storyId][entityName];
    }

    /**
     * @notice Get counts of each entity type for a story
     * @param storyId The story ID
     */
    function getStoryEntityCounts(string memory storyId)
        external
        view
        returns (
            uint256 characters,
            uint256 items,
            uint256 locations,
            uint256 monsters
        )
    {
        return (
            entityTypeCounts[storyId][EntityType.CHARACTER],
            entityTypeCounts[storyId][EntityType.ITEM],
            entityTypeCounts[storyId][EntityType.LOCATION],
            entityTypeCounts[storyId][EntityType.MONSTER]
        );
    }

    /**
     * @notice Get total supply
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ============ Admin Functions ============

    /**
     * @notice Grant minter role to an address
     * @param minter Address to grant minter role
     */
    function addMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
    }

    /**
     * @notice Revoke minter role from an address
     * @param minter Address to revoke minter role
     */
    function removeMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, minter);
    }

    // ============ Required Overrides ============

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
