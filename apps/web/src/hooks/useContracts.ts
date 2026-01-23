'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits, Address } from 'viem';
import { useState, useEffect } from 'react';
import {
  CONTRACT_ADDRESSES,
  BETTING_POOL_ABI,
  NFT_ABI,
  ERC20_ABI,
} from '@/lib/contracts';

// ============ Betting Pool Hooks ============

export function usePoolInfo(poolId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.bettingPool,
    abi: BETTING_POOL_ABI,
    functionName: 'getPoolInfo',
    args: [BigInt(poolId)],
    query: {
      enabled: poolId > 0,
    },
  });
}

export function useOutcomeDeposits(poolId: number, outcomeId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.bettingPool,
    abi: BETTING_POOL_ABI,
    functionName: 'getOutcomeDeposits',
    args: [BigInt(poolId), BigInt(outcomeId)],
    query: {
      enabled: poolId > 0 && outcomeId > 0,
    },
  });
}

export function useOutcomeVoterCount(poolId: number, outcomeId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.bettingPool,
    abi: BETTING_POOL_ABI,
    functionName: 'getOutcomeVoterCount',
    args: [BigInt(poolId), BigInt(outcomeId)],
    query: {
      enabled: poolId > 0 && outcomeId > 0,
    },
  });
}

export function useUserBet(poolId: number, outcomeId: number) {
  const { address } = useAccount();

  return useReadContract({
    address: CONTRACT_ADDRESSES.bettingPool,
    abi: BETTING_POOL_ABI,
    functionName: 'getUserBet',
    args: [address as Address, BigInt(poolId), BigInt(outcomeId)],
    query: {
      enabled: !!address && poolId > 0 && outcomeId > 0,
    },
  });
}

export function usePotentialWinnings(poolId: number, outcomeId: number, amount: string) {
  const amountBigInt = amount ? parseUnits(amount, 6) : BigInt(0);

  return useReadContract({
    address: CONTRACT_ADDRESSES.bettingPool,
    abi: BETTING_POOL_ABI,
    functionName: 'calculatePotentialWinnings',
    args: [BigInt(poolId), BigInt(outcomeId), amountBigInt],
    query: {
      enabled: poolId > 0 && outcomeId > 0 && amountBigInt > 0,
    },
  });
}

export function usePlaceBetContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placeBet = async (
    poolId: number,
    outcomeId: number,
    amount: string,
  ) => {
    const amountBigInt = parseUnits(amount, 6);

    writeContract({
      address: CONTRACT_ADDRESSES.bettingPool,
      abi: BETTING_POOL_ABI,
      functionName: 'placeBet',
      args: [BigInt(poolId), BigInt(outcomeId), amountBigInt],
    });
  };

  return {
    placeBet,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimWinnings() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = async (poolId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.bettingPool,
      abi: BETTING_POOL_ABI,
      functionName: 'claimAllWinnings',
      args: [BigInt(poolId)],
    });
  };

  return {
    claim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============ Token Hooks ============

export function useTokenBalance(token: 'USDC' | 'USDT') {
  const { address } = useAccount();
  const tokenAddress = token === 'USDC' ? CONTRACT_ADDRESSES.usdc : CONTRACT_ADDRESSES.usdt;

  const { data, ...rest } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data ? formatUnits(data, 6) : '0',
    balanceRaw: data,
    ...rest,
  };
}

export function useTokenAllowance(token: 'USDC' | 'USDT') {
  const { address } = useAccount();
  const tokenAddress = token === 'USDC' ? CONTRACT_ADDRESSES.usdc : CONTRACT_ADDRESSES.usdt;

  const { data, ...rest } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as Address, CONTRACT_ADDRESSES.bettingPool],
    query: {
      enabled: !!address,
    },
  });

  return {
    allowance: data ? formatUnits(data, 6) : '0',
    allowanceRaw: data,
    ...rest,
  };
}

export function useApproveToken(token: 'USDC' | 'USDT') {
  const tokenAddress = token === 'USDC' ? CONTRACT_ADDRESSES.usdc : CONTRACT_ADDRESSES.usdt;
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (amount: string) => {
    const amountBigInt = parseUnits(amount, 6);

    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.bettingPool, amountBigInt],
    });
  };

  const approveMax = async () => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.bettingPool, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
    });
  };

  return {
    approve,
    approveMax,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============ NFT Hooks ============

export function useNFTBalance() {
  const { address } = useAccount();

  const { data, ...rest } = useReadContract({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data ? Number(data) : 0,
    ...rest,
  };
}

export function useUserNFTs() {
  const { address } = useAccount();

  return useReadContract({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'tokensOfOwner',
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });
}

export function useNFTMetadata(tokenId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'getEntityMetadata',
    args: [BigInt(tokenId)],
    query: {
      enabled: tokenId > 0,
    },
  });
}

export function useIsEntityMinted(storyId: string, entityName: string) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'isEntityMinted',
    args: [storyId, entityName],
    query: {
      enabled: !!storyId && !!entityName,
    },
  });
}

export function useStoryEntityCounts(storyId: string) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'getStoryEntityCounts',
    args: [storyId],
    query: {
      enabled: !!storyId,
    },
  });
}

export function useTotalNFTsMinted() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'totalMinted',
  });
}

// ============ Combined Betting Flow Hook ============

export function useBettingFlow() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<'idle' | 'approving' | 'betting' | 'success' | 'error'>('idle');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'USDT'>('USDC');

  const { allowance, refetch: refetchAllowance } = useTokenAllowance(selectedToken);
  const { balance } = useTokenBalance(selectedToken);
  const { approve, isPending: isApproving, isSuccess: approveSuccess, error: approveError } = useApproveToken(selectedToken);
  const { placeBet, isPending: isBetting, isSuccess: betSuccess, error: betError } = usePlaceBetContract();

  // Handle approve success
  useEffect(() => {
    if (approveSuccess && step === 'approving') {
      refetchAllowance();
      setStep('idle');
    }
  }, [approveSuccess, step, refetchAllowance]);

  // Handle bet success
  useEffect(() => {
    if (betSuccess && step === 'betting') {
      setStep('success');
    }
  }, [betSuccess, step]);

  // Handle errors
  useEffect(() => {
    if (approveError || betError) {
      setStep('error');
    }
  }, [approveError, betError]);

  const executeBet = async (poolId: number, outcomeId: number, amount: string) => {
    if (!isConnected) return;

    const amountNum = parseFloat(amount);
    const allowanceNum = parseFloat(allowance);

    // Check if approval is needed
    if (allowanceNum < amountNum) {
      setStep('approving');
      await approve(amount);
      return;
    }

    // Place bet
    setStep('betting');
    await placeBet(poolId, outcomeId, amount);
  };

  const reset = () => {
    setStep('idle');
  };

  return {
    step,
    selectedToken,
    setSelectedToken,
    balance,
    allowance,
    isApproving,
    isBetting,
    executeBet,
    reset,
    error: approveError || betError,
  };
}
