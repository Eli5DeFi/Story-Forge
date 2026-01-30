'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';

export const nftKeys = {
  all: ['nfts'] as const,
  storyNFTs: (storyId: string) => [...nftKeys.all, 'story', storyId] as const,
  nftStats: (storyId: string) => [...nftKeys.all, 'stats', storyId] as const,
};

export function useStoryNFTs(storyId: string) {
  return useQuery({
    queryKey: nftKeys.storyNFTs(storyId),
    queryFn: () => api.getStoryNFTs(storyId),
    enabled: !!storyId,
  });
}

export function useNFTStats(storyId: string) {
  return useQuery({
    queryKey: nftKeys.nftStats(storyId),
    queryFn: () => api.getNFTStats(storyId),
    enabled: !!storyId,
  });
}
