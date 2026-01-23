// Contract addresses and ABIs for Story-Forge

import { Address } from 'viem';

// Contract addresses from environment
export const CONTRACT_ADDRESSES = {
  bettingPool: (process.env.NEXT_PUBLIC_BETTING_POOL_ADDRESS || '0x0') as Address,
  nft: (process.env.NEXT_PUBLIC_NFT_ADDRESS || '0x0') as Address,
  treasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x0') as Address,
  usdc: (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e') as Address,
  usdt: (process.env.NEXT_PUBLIC_USDT_ADDRESS || '0x0') as Address,
};

// Betting Pool ABI
export const BETTING_POOL_ABI = [
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
    inputs: [{ name: 'token', type: 'address' }],
    name: 'acceptedTokens',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'outcomeId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'placeBet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'poolId', type: 'uint256' }],
    name: 'claimAllWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// NFT ABI
export const NFT_ABI = [
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
] as const;

// ERC20 ABI for token approvals
export const ERC20_ABI = [
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
