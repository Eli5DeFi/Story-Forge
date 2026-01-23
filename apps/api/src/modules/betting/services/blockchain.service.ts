import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// ABI for BettingPool contract (key functions only)
const BETTING_POOL_ABI = [
  'function createPool(uint256 chapterId, uint256 bettingDuration, address tokenAddress, uint256 carryoverFromPool) external returns (uint256)',
  'function placeBet(uint256 poolId, uint256 outcomeId, uint256 amount) external',
  'function resolvePool(uint256 poolId, uint256 winningOutcome) external',
  'function claimWinnings(uint256 poolId) external',
  'function getPoolInfo(uint256 poolId) external view returns (uint256, uint256, uint256, uint256, address, bool, uint256)',
  'event PoolCreated(uint256 indexed poolId, uint256 indexed chapterId, uint256 bettingEndsAt)',
  'event BetPlaced(address indexed user, uint256 indexed poolId, uint256 outcomeId, uint256 amount, uint256 feeDeducted)',
  'event OutcomeResolved(uint256 indexed poolId, uint256 winningOutcome)',
  'event WinningsClaimed(address indexed user, uint256 indexed poolId, uint256 amount)',
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private bettingPoolContract: ethers.Contract;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('RPC_URL');
    const privateKey = this.configService.get('ORACLE_PRIVATE_KEY');
    const contractAddress = this.configService.get('BETTING_POOL_ADDRESS');

    if (rpcUrl && privateKey && contractAddress) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.bettingPoolContract = new ethers.Contract(
        contractAddress,
        BETTING_POOL_ABI,
        this.wallet,
      );
    } else {
      this.logger.warn('Blockchain service not configured - running in mock mode');
    }
  }

  async createPool(
    chapterId: number,
    bettingDurationSeconds: number,
    tokenAddress: string,
    carryoverFromPool: number = 0,
  ): Promise<{ poolId: string; txHash: string }> {
    if (!this.bettingPoolContract) {
      // Mock mode
      return {
        poolId: Math.random().toString(36).substring(7),
        txHash: '0x' + '0'.repeat(64),
      };
    }

    try {
      const tx = await this.bettingPoolContract.createPool(
        chapterId,
        bettingDurationSeconds,
        tokenAddress,
        carryoverFromPool,
      );
      const receipt = await tx.wait();

      // Parse PoolCreated event
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'PoolCreated',
      );
      const poolId = event?.args?.[0]?.toString() || '0';

      return { poolId, txHash: receipt.hash };
    } catch (error) {
      this.logger.error('Failed to create pool on-chain', error);
      throw error;
    }
  }

  async resolvePool(
    poolId: number,
    winningOutcome: number,
  ): Promise<{ txHash: string }> {
    if (!this.bettingPoolContract) {
      return { txHash: '0x' + '0'.repeat(64) };
    }

    try {
      const tx = await this.bettingPoolContract.resolvePool(poolId, winningOutcome);
      const receipt = await tx.wait();
      return { txHash: receipt.hash };
    } catch (error) {
      this.logger.error('Failed to resolve pool on-chain', error);
      throw error;
    }
  }

  async getPoolInfo(poolId: number): Promise<{
    chapterId: number;
    totalDeposits: string;
    carryoverAmount: string;
    bettingEndsAt: number;
    tokenAddress: string;
    isResolved: boolean;
    winningOutcome: number;
  }> {
    if (!this.bettingPoolContract) {
      return {
        chapterId: 0,
        totalDeposits: '0',
        carryoverAmount: '0',
        bettingEndsAt: Date.now() / 1000 + 259200,
        tokenAddress: '0x0000000000000000000000000000000000000000',
        isResolved: false,
        winningOutcome: 0,
      };
    }

    const info = await this.bettingPoolContract.getPoolInfo(poolId);
    return {
      chapterId: Number(info[0]),
      totalDeposits: info[1].toString(),
      carryoverAmount: info[2].toString(),
      bettingEndsAt: Number(info[3]),
      tokenAddress: info[4],
      isResolved: info[5],
      winningOutcome: Number(info[6]),
    };
  }

  async verifyTransaction(txHash: string): Promise<{
    confirmed: boolean;
    blockNumber?: number;
  }> {
    if (!this.provider) {
      return { confirmed: true };
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return {
        confirmed: receipt !== null && receipt.status === 1,
        blockNumber: receipt?.blockNumber,
      };
    } catch (error) {
      this.logger.error('Failed to verify transaction', error);
      return { confirmed: false };
    }
  }
}
