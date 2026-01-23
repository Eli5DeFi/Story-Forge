'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import * as api from '@/lib/api';
import type { Outcome, Bet, UserStats } from '@/types/story';

// Query keys
export const bettingKeys = {
  all: ['betting'] as const,
  outcomes: (chapterId: string) => [...bettingKeys.all, 'outcomes', chapterId] as const,
  userBets: (walletAddress: string) => [...bettingKeys.all, 'user', walletAddress] as const,
  userStats: (walletAddress: string) => [...bettingKeys.userBets(walletAddress), 'stats'] as const,
};

export function useOutcomes(chapterId: string) {
  return useQuery({
    queryKey: bettingKeys.outcomes(chapterId),
    queryFn: () => api.getOutcomes(chapterId),
    enabled: !!chapterId,
    refetchInterval: 30000, // Refresh every 30 seconds for live pool updates
  });
}

export function useUserBets(accessToken?: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: bettingKeys.userBets(address || ''),
    queryFn: () => api.getUserBets(address!, accessToken!),
    enabled: !!address && !!accessToken,
  });
}

export function useUserStats(accessToken?: string) {
  const { address } = useAccount();

  return useQuery({
    queryKey: bettingKeys.userStats(address || ''),
    queryFn: () => api.getUserStats(address!, accessToken!),
    enabled: !!address && !!accessToken,
  });
}

export function usePlaceBet(accessToken?: string) {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      outcomeId,
      amount,
      token,
    }: {
      outcomeId: string;
      amount: string;
      token: 'USDC' | 'USDT';
    }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return api.placeBet(outcomeId, amount, token, accessToken);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (address) {
        queryClient.invalidateQueries({ queryKey: bettingKeys.userBets(address) });
        queryClient.invalidateQueries({ queryKey: bettingKeys.userStats(address) });
      }
      // Also refresh outcomes to show updated pool
      queryClient.invalidateQueries({ queryKey: bettingKeys.all });
    },
  });
}

// Helper hook to calculate potential winnings
export function useCalculatePotentialWinnings(
  outcome: Outcome | undefined,
  betAmount: string,
) {
  if (!outcome?.bettingPool || !betAmount || parseFloat(betAmount) <= 0) {
    return { potentialWinnings: '0', share: 0 };
  }

  const pool = outcome.bettingPool;
  const totalPool = parseFloat(pool.totalAmount);
  const myBet = parseFloat(betAmount);
  const myTotalBet = myBet; // In real app, add existing bets

  // Calculate share if this outcome wins
  // 85% goes to winners, minus 2% fee
  const netPool = totalPool * 0.85 * 0.98;
  const myNewTotal = myTotalBet + myBet;
  const poolAfterMyBet = totalPool + myBet;
  const share = myNewTotal / poolAfterMyBet;
  const potentialWinnings = (netPool + myBet * 0.85 * 0.98).toFixed(2);

  return {
    potentialWinnings,
    share: share * 100,
  };
}
