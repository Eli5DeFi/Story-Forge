import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
  Chain,
  parseEther,
  formatEther,
  Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia, polygon, polygonMumbai } from 'viem/chains';

export type SupportedChain = 'base' | 'baseSepolia' | 'polygon' | 'polygonMumbai';

const CHAINS: Record<SupportedChain, Chain> = {
  base,
  baseSepolia,
  polygon,
  polygonMumbai,
};

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);

  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private oracleAccount: ReturnType<typeof privateKeyToAccount>;

  private readonly chain: Chain;
  private readonly rpcUrl: string;

  constructor(private configService: ConfigService) {
    const chainName = (this.configService.get('CHAIN_NAME') || 'baseSepolia') as SupportedChain;
    this.chain = CHAINS[chainName] || baseSepolia;
    this.rpcUrl = this.configService.get('RPC_URL') || '';
  }

  async onModuleInit() {
    try {
      // Initialize public client for read operations
      this.publicClient = createPublicClient({
        chain: this.chain,
        transport: http(this.rpcUrl || undefined),
      });

      // Initialize wallet client for write operations (oracle)
      const privateKey = this.configService.get('ORACLE_PRIVATE_KEY');
      if (privateKey) {
        this.oracleAccount = privateKeyToAccount(privateKey as `0x${string}`);
        this.walletClient = createWalletClient({
          account: this.oracleAccount,
          chain: this.chain,
          transport: http(this.rpcUrl || undefined),
        });

        this.logger.log(`Oracle wallet initialized: ${this.oracleAccount.address}`);
      } else {
        this.logger.warn('ORACLE_PRIVATE_KEY not configured - write operations disabled');
      }

      // Test connection
      const blockNumber = await this.publicClient.getBlockNumber();
      this.logger.log(`Connected to ${this.chain.name}, block: ${blockNumber}`);
    } catch (error) {
      this.logger.error('Failed to initialize blockchain connection', error);
    }
  }

  getPublicClient(): PublicClient {
    return this.publicClient;
  }

  getWalletClient(): WalletClient | undefined {
    return this.walletClient;
  }

  getOracleAddress(): Address | undefined {
    return this.oracleAccount?.address;
  }

  getChain(): Chain {
    return this.chain;
  }

  async getBlockNumber(): Promise<bigint> {
    return this.publicClient.getBlockNumber();
  }

  async getBalance(address: Address): Promise<string> {
    const balance = await this.publicClient.getBalance({ address });
    return formatEther(balance);
  }

  async estimateGas(params: {
    to: Address;
    data: `0x${string}`;
    value?: bigint;
  }): Promise<bigint> {
    return this.publicClient.estimateGas({
      account: this.oracleAccount,
      ...params,
    });
  }

  async waitForTransaction(hash: `0x${string}`) {
    return this.publicClient.waitForTransactionReceipt({ hash });
  }

  // Token helpers
  async getTokenBalance(
    tokenAddress: Address,
    walletAddress: Address,
  ): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });
    return result as bigint;
  }

  async getTokenDecimals(tokenAddress: Address): Promise<number> {
    const result = await this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });
    return result as number;
  }

  async getTokenSymbol(tokenAddress: Address): Promise<string> {
    const result = await this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'symbol',
    });
    return result as string;
  }
}

// Minimal ERC20 ABI for token operations
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
