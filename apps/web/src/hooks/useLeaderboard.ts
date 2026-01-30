'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  byEarnings: (limit?: number) => [...leaderboardKeys.all, 'earnings', limit] as const,
  byWinRate: (limit?: number) => [...leaderboardKeys.all, 'winRate', limit] as const,
};

export function useLeaderboard(limit?: number) {
  return useQuery({
    queryKey: leaderboardKeys.byEarnings(limit),
    queryFn: () => api.getLeaderboard(limit),
  });
}

export function useLeaderboardByWinRate(limit?: number) {
  return useQuery({
    queryKey: leaderboardKeys.byWinRate(limit),
    queryFn: () => api.getLeaderboardByWinRate(limit),
  });
}
