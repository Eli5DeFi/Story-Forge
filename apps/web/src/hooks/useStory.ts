'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import type { Story, Chapter, StoryStats } from '@/types/story';

// Query keys
export const storyKeys = {
  all: ['stories'] as const,
  lists: () => [...storyKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...storyKeys.lists(), filters] as const,
  details: () => [...storyKeys.all, 'detail'] as const,
  detail: (id: string) => [...storyKeys.details(), id] as const,
  stats: (id: string) => [...storyKeys.detail(id), 'stats'] as const,
  chapters: (storyId: string) => [...storyKeys.detail(storyId), 'chapters'] as const,
  chapter: (storyId: string, chapterNumber: number) =>
    [...storyKeys.chapters(storyId), chapterNumber] as const,
  latestChapter: (storyId: string) => [...storyKeys.chapters(storyId), 'latest'] as const,
};

// Story hooks
export function useStories(params?: {
  status?: string;
  genre?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: storyKeys.list(params || {}),
    queryFn: () => api.getStories(params),
  });
}

export function useStory(storyId: string) {
  return useQuery({
    queryKey: storyKeys.detail(storyId),
    queryFn: () => api.getStory(storyId),
    enabled: !!storyId,
  });
}

export function useStoryStats(storyId: string) {
  return useQuery({
    queryKey: storyKeys.stats(storyId),
    queryFn: () => api.getStoryStats(storyId),
    enabled: !!storyId,
  });
}

// Chapter hooks
export function useChapters(
  storyId: string,
  params?: { limit?: number; offset?: number },
) {
  return useQuery({
    queryKey: storyKeys.chapters(storyId),
    queryFn: () => api.getChapters(storyId, params),
    enabled: !!storyId,
  });
}

export function useChapter(storyId: string, chapterNumber: number) {
  return useQuery({
    queryKey: storyKeys.chapter(storyId, chapterNumber),
    queryFn: () => api.getChapter(storyId, chapterNumber),
    enabled: !!storyId && chapterNumber > 0,
  });
}

export function useLatestChapter(storyId: string) {
  return useQuery({
    queryKey: storyKeys.latestChapter(storyId),
    queryFn: () => api.getLatestChapter(storyId),
    enabled: !!storyId,
  });
}

// Prefetch helpers
export function usePrefetchChapter() {
  const queryClient = useQueryClient();

  return (storyId: string, chapterNumber: number) => {
    queryClient.prefetchQuery({
      queryKey: storyKeys.chapter(storyId, chapterNumber),
      queryFn: () => api.getChapter(storyId, chapterNumber),
    });
  };
}
