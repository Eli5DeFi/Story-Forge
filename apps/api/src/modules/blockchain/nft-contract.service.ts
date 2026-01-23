import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from 'viem';
import { BlockchainService } from './blockchain.service';

// Entity types matching the smart contract enum
export enum EntityType {
  CHARACTER = 0,
  ITEM = 1,
  LOCATION = 2,
  MONSTER = 3,
}

// ABI for StoryForgeNFT contract
const NFT_ABI = [
  // View functions
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'tokensOfOwner',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getEntityMetadata',
    outputs: [
      { name: 'entityType', type: 'uint8' },
      { name: 'storyId', type: 'string' },
      { name: 'entityName', type: 'string' },
      { name: 'firstAppearanceChapter', type: 'uint256' },
      { name: 'mintedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'storyId', type: 'string' },
      { name: 'entityName', type: 'string' },
    ],
    name: 'isEntityMinted',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'storyId', type: 'string' },
      { name: 'entityName', type: 'string' },
    ],
    name: 'getEntityTokenId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'storyId', type: 'string' }],
    name: 'getStoryEntityCounts',
    outputs: [
      { name: 'characters', type: 'uint256' },
      { name: 'items', type: 'uint256' },
      { name: 'locations', type: 'uint256' },
      { name: 'monsters', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalMinted',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'entityType', type: 'uint8' },
      { name: 'storyId', type: 'string' },
      { name: 'entityName', type: 'string' },
      { name: 'firstAppearance', type: 'uint256' },
      { name: 'uri', type: 'string' },
    ],
    name: 'mintEntity',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'entityTypes', type: 'uint8[]' },
      { name: 'storyIds', type: 'string[]' },
      { name: 'entityNames', type: 'string[]' },
      { name: 'firstAppearances', type: 'uint256[]' },
      { name: 'uris', type: 'string[]' },
    ],
    name: 'batchMintEntities',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'entityType', type: 'uint8' },
      { indexed: false, name: 'storyId', type: 'string' },
      { indexed: false, name: 'entityName', type: 'string' },
      { indexed: true, name: 'mintedTo', type: 'address' },
      { indexed: false, name: 'firstAppearanceChapter', type: 'uint256' },
    ],
    name: 'EntityMinted',
    type: 'event',
  },
] as const;

export interface EntityMetadata {
  entityType: EntityType;
  storyId: string;
  entityName: string;
  firstAppearanceChapter: number;
  mintedAt: Date;
}

export interface StoryEntityCounts {
  characters: number;
  items: number;
  locations: number;
  monsters: number;
}

export interface MintRequest {
  to: Address;
  entityType: EntityType;
  storyId: string;
  entityName: string;
  firstAppearance: number;
  metadataUri: string;
}

@Injectable()
export class NFTContractService {
  private readonly logger = new Logger(NFTContractService.name);
  private readonly contractAddress: Address;

  constructor(
    private blockchainService: BlockchainService,
    private configService: ConfigService,
  ) {
    this.contractAddress = this.configService.get('NFT_ADDRESS') as Address;
  }

  // ============ Read Functions ============

  async getTokenURI(tokenId: number): Promise<string | null> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      });

      return result as string;
    } catch (error) {
      this.logger.error(`Failed to get token URI for ${tokenId}`, error);
      return null;
    }
  }

  async getEntityMetadata(tokenId: number): Promise<EntityMetadata | null> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'getEntityMetadata',
        args: [BigInt(tokenId)],
      });

      const [entityType, storyId, entityName, firstAppearanceChapter, mintedAt] =
        result as [number, string, string, bigint, bigint];

      return {
        entityType: entityType as EntityType,
        storyId,
        entityName,
        firstAppearanceChapter: Number(firstAppearanceChapter),
        mintedAt: new Date(Number(mintedAt) * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to get entity metadata for ${tokenId}`, error);
      return null;
    }
  }

  async isEntityMinted(storyId: string, entityName: string): Promise<boolean> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'isEntityMinted',
        args: [storyId, entityName],
      });

      return result as boolean;
    } catch (error) {
      this.logger.error(`Failed to check if entity is minted`, error);
      return false;
    }
  }

  async getEntityTokenId(storyId: string, entityName: string): Promise<number | null> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'getEntityTokenId',
        args: [storyId, entityName],
      });

      const tokenId = Number(result);
      return tokenId > 0 ? tokenId : null;
    } catch (error) {
      this.logger.error(`Failed to get entity token ID`, error);
      return null;
    }
  }

  async getStoryEntityCounts(storyId: string): Promise<StoryEntityCounts> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'getStoryEntityCounts',
        args: [storyId],
      });

      const [characters, items, locations, monsters] = result as [
        bigint,
        bigint,
        bigint,
        bigint,
      ];

      return {
        characters: Number(characters),
        items: Number(items),
        locations: Number(locations),
        monsters: Number(monsters),
      };
    } catch (error) {
      this.logger.error(`Failed to get story entity counts`, error);
      return { characters: 0, items: 0, locations: 0, monsters: 0 };
    }
  }

  async getTotalMinted(): Promise<number> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'totalMinted',
      });

      return Number(result);
    } catch (error) {
      this.logger.error(`Failed to get total minted`, error);
      return 0;
    }
  }

  async getTokensOfOwner(owner: Address): Promise<number[]> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'tokensOfOwner',
        args: [owner],
      });

      return (result as bigint[]).map((id) => Number(id));
    } catch (error) {
      this.logger.error(`Failed to get tokens of owner`, error);
      return [];
    }
  }

  async getOwnerOf(tokenId: number): Promise<Address | null> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });

      return result as Address;
    } catch (error) {
      this.logger.error(`Failed to get owner of ${tokenId}`, error);
      return null;
    }
  }

  // ============ Write Functions ============

  async mintEntity(request: MintRequest): Promise<{ hash: string; tokenId: number } | null> {
    try {
      const walletClient = this.blockchainService.getWalletClient();
      if (!walletClient) {
        throw new Error('Wallet client not initialized');
      }

      // Check if already minted
      const alreadyMinted = await this.isEntityMinted(request.storyId, request.entityName);
      if (alreadyMinted) {
        const existingTokenId = await this.getEntityTokenId(
          request.storyId,
          request.entityName,
        );
        this.logger.log(
          `Entity ${request.entityName} already minted as token ${existingTokenId}`,
        );
        return { hash: '0x', tokenId: existingTokenId! };
      }

      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'mintEntity',
        args: [
          request.to,
          request.entityType,
          request.storyId,
          request.entityName,
          BigInt(request.firstAppearance),
          request.metadataUri,
        ],
      });

      this.logger.log(`Mint tx submitted: ${hash}`);

      await this.blockchainService.waitForTransaction(hash);

      // Get the token ID
      const tokenId = await this.getEntityTokenId(request.storyId, request.entityName);

      return {
        hash,
        tokenId: tokenId!,
      };
    } catch (error) {
      this.logger.error(`Failed to mint entity ${request.entityName}`, error);
      return null;
    }
  }

  async batchMintEntities(
    requests: MintRequest[],
  ): Promise<{ hash: string; tokenIds: number[] } | null> {
    try {
      const walletClient = this.blockchainService.getWalletClient();
      if (!walletClient) {
        throw new Error('Wallet client not initialized');
      }

      // All must go to the same address for batch
      const to = requests[0].to;
      const entityTypes = requests.map((r) => r.entityType);
      const storyIds = requests.map((r) => r.storyId);
      const entityNames = requests.map((r) => r.entityName);
      const firstAppearances = requests.map((r) => BigInt(r.firstAppearance));
      const uris = requests.map((r) => r.metadataUri);

      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: NFT_ABI,
        functionName: 'batchMintEntities',
        args: [to, entityTypes, storyIds, entityNames, firstAppearances, uris],
      });

      this.logger.log(`Batch mint tx submitted: ${hash}`);

      await this.blockchainService.waitForTransaction(hash);

      // Get all token IDs
      const tokenIds = await Promise.all(
        requests.map(async (r) => {
          const id = await this.getEntityTokenId(r.storyId, r.entityName);
          return id || 0;
        }),
      );

      return {
        hash,
        tokenIds,
      };
    } catch (error) {
      this.logger.error(`Failed to batch mint entities`, error);
      return null;
    }
  }

  // ============ Helper Functions ============

  getContractAddress(): Address {
    return this.contractAddress;
  }

  /**
   * Convert string entity type to enum
   */
  static parseEntityType(type: string): EntityType {
    switch (type.toUpperCase()) {
      case 'CHARACTER':
        return EntityType.CHARACTER;
      case 'ITEM':
        return EntityType.ITEM;
      case 'LOCATION':
        return EntityType.LOCATION;
      case 'MONSTER':
        return EntityType.MONSTER;
      default:
        return EntityType.CHARACTER;
    }
  }
}
