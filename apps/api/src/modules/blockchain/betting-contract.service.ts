import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, parseUnits, formatUnits } from 'viem';
import { BlockchainService } from './blockchain.service';

// ABI for StoryForgeBettingPool contract
const BETTING_POOL_ABI = [
  // View functions
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'getPoolInfo',
    outputs: [
      { name: 'chapterId', type: 'uint256' },
      { name: 'totalDeposits', type: 'uint256' },
      { name: 'carryoverAmount', type: 'uint256' },
      { name: 'bettingEndsAt', type: 'uint256' },
      { name: 'tokenAddress', type: 'address' },
      { name: 'isResolved', type: 'bool' },
      { name: 'winningOutcome', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'outcomeId', type: 'uint256' },
    ],
    name: 'getOutcomeDeposits',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'outcomeId', type: 'uint256' },
    ],
    name: 'getOutcomeVoterCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'poolId', type: 'uint256' },
      { name: 'outcomeId', type: 'uint256' },
    ],
    name: 'getUserBet',
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'claimed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'outcomeId', type: 'uint256' },
      { name: 'betAmount', type: 'uint256' },
    ],
    name: 'calculatePotentialWinnings',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolCounter',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions (Oracle)
  {
    inputs: [
      { name: 'chapterId', type: 'uint256' },
      { name: 'bettingDuration', type: 'uint256' },
      { name: 'tokenAddress', type: 'address' },
      { name: 'carryoverFromPool', type: 'uint256' },
    ],
    name: 'createPool',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'winningOutcome', type: 'uint256' },
    ],
    name: 'resolvePool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'poolId', type: 'uint256' },
      { indexed: true, name: 'chapterId', type: 'uint256' },
      { indexed: false, name: 'bettingEndsAt', type: 'uint256' },
      { indexed: false, name: 'tokenAddress', type: 'address' },
    ],
    name: 'PoolCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'poolId', type: 'uint256' },
      { indexed: false, name: 'outcomeId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'feeDeducted', type: 'uint256' },
    ],
    name: 'BetPlaced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'poolId', type: 'uint256' },
      { indexed: false, name: 'winningOutcome', type: 'uint256' },
    ],
    name: 'OutcomeResolved',
    type: 'event',
  },
] as const;

export interface PoolInfo {
  chapterId: bigint;
  totalDeposits: bigint;
  carryoverAmount: bigint;
  bettingEndsAt: bigint;
  tokenAddress: Address;
  isResolved: boolean;
  winningOutcome: bigint;
}

export interface FormattedPoolInfo {
  chapterId: string;
  totalDeposits: string;
  carryoverAmount: string;
  bettingEndsAt: Date;
  tokenAddress: string;
  isResolved: boolean;
  winningOutcome: number;
}

@Injectable()
export class BettingContractService {
  private readonly logger = new Logger(BettingContractService.name);
  private readonly contractAddress: Address;
  private readonly usdcAddress: Address;
  private readonly usdtAddress: Address;

  constructor(
    private blockchainService: BlockchainService,
    private configService: ConfigService,
  ) {
    this.contractAddress = this.configService.get('BETTING_POOL_ADDRESS') as Address;
    this.usdcAddress = this.configService.get('USDC_ADDRESS') as Address;
    this.usdtAddress = this.configService.get('USDT_ADDRESS') as Address;
  }

  // ============ Read Functions ============

  async getPoolInfo(poolId: number): Promise<FormattedPoolInfo | null> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'getPoolInfo',
        args: [BigInt(poolId)],
      });

      const [
        chapterId,
        totalDeposits,
        carryoverAmount,
        bettingEndsAt,
        tokenAddress,
        isResolved,
        winningOutcome,
      ] = result as [bigint, bigint, bigint, bigint, Address, boolean, bigint];

      return {
        chapterId: chapterId.toString(),
        totalDeposits: formatUnits(totalDeposits, 6), // USDC/USDT = 6 decimals
        carryoverAmount: formatUnits(carryoverAmount, 6),
        bettingEndsAt: new Date(Number(bettingEndsAt) * 1000),
        tokenAddress,
        isResolved,
        winningOutcome: Number(winningOutcome),
      };
    } catch (error) {
      this.logger.error(`Failed to get pool info for pool ${poolId}`, error);
      return null;
    }
  }

  async getOutcomeDeposits(poolId: number, outcomeId: number): Promise<string> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'getOutcomeDeposits',
        args: [BigInt(poolId), BigInt(outcomeId)],
      });

      return formatUnits(result as bigint, 6);
    } catch (error) {
      this.logger.error(`Failed to get outcome deposits`, error);
      return '0';
    }
  }

  async getOutcomeVoterCount(poolId: number, outcomeId: number): Promise<number> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'getOutcomeVoterCount',
        args: [BigInt(poolId), BigInt(outcomeId)],
      });

      return Number(result);
    } catch (error) {
      this.logger.error(`Failed to get outcome voter count`, error);
      return 0;
    }
  }

  async getUserBet(
    userAddress: Address,
    poolId: number,
    outcomeId: number,
  ): Promise<{ amount: string; claimed: boolean }> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'getUserBet',
        args: [userAddress, BigInt(poolId), BigInt(outcomeId)],
      });

      const [amount, claimed] = result as [bigint, boolean];
      return {
        amount: formatUnits(amount, 6),
        claimed,
      };
    } catch (error) {
      this.logger.error(`Failed to get user bet`, error);
      return { amount: '0', claimed: false };
    }
  }

  async calculatePotentialWinnings(
    poolId: number,
    outcomeId: number,
    betAmount: string,
  ): Promise<string> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'calculatePotentialWinnings',
        args: [BigInt(poolId), BigInt(outcomeId), parseUnits(betAmount, 6)],
      });

      return formatUnits(result as bigint, 6);
    } catch (error) {
      this.logger.error(`Failed to calculate potential winnings`, error);
      return '0';
    }
  }

  async getPoolCounter(): Promise<number> {
    try {
      const client = this.blockchainService.getPublicClient();
      const result = await client.readContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'poolCounter',
      });

      return Number(result);
    } catch (error) {
      this.logger.error(`Failed to get pool counter`, error);
      return 0;
    }
  }

  // ============ Write Functions (Oracle Only) ============

  async createPool(
    chapterId: number,
    bettingDurationSeconds: number,
    useUsdc: boolean = true,
    carryoverFromPool: number = 0,
  ): Promise<{ hash: string; poolId: number } | null> {
    try {
      const walletClient = this.blockchainService.getWalletClient();
      if (!walletClient) {
        throw new Error('Wallet client not initialized');
      }

      const tokenAddress = useUsdc ? this.usdcAddress : this.usdtAddress;

      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'createPool',
        args: [
          BigInt(chapterId),
          BigInt(bettingDurationSeconds),
          tokenAddress,
          BigInt(carryoverFromPool),
        ],
      });

      this.logger.log(`Pool creation tx submitted: ${hash}`);

      // Wait for transaction and get pool ID from events
      const receipt = await this.blockchainService.waitForTransaction(hash);

      // Parse the PoolCreated event to get the pool ID
      const poolCounter = await this.getPoolCounter();

      return {
        hash,
        poolId: poolCounter,
      };
    } catch (error) {
      this.logger.error(`Failed to create pool`, error);
      return null;
    }
  }

  async resolvePool(
    poolId: number,
    winningOutcome: number,
  ): Promise<{ hash: string } | null> {
    try {
      const walletClient = this.blockchainService.getWalletClient();
      if (!walletClient) {
        throw new Error('Wallet client not initialized');
      }

      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: BETTING_POOL_ABI,
        functionName: 'resolvePool',
        args: [BigInt(poolId), BigInt(winningOutcome)],
      });

      this.logger.log(`Pool resolution tx submitted: ${hash}`);

      await this.blockchainService.waitForTransaction(hash);

      return { hash };
    } catch (error) {
      this.logger.error(`Failed to resolve pool ${poolId}`, error);
      return null;
    }
  }

  // ============ Helper Functions ============

  getContractAddress(): Address {
    return this.contractAddress;
  }

  getUsdcAddress(): Address {
    return this.usdcAddress;
  }

  getUsdtAddress(): Address {
    return this.usdtAddress;
  }

  /**
   * Get all outcome stats for a pool
   */
  async getPoolOutcomeStats(poolId: number, numOutcomes: number = 5) {
    const stats = [];

    for (let i = 1; i <= numOutcomes; i++) {
      const [deposits, voterCount] = await Promise.all([
        this.getOutcomeDeposits(poolId, i),
        this.getOutcomeVoterCount(poolId, i),
      ]);

      stats.push({
        outcomeId: i,
        totalDeposits: deposits,
        voterCount,
      });
    }

    return stats;
  }
}
