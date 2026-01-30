'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, TrendingUp, Filter, Sparkles, Coins, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { CyberButton } from '@/components/ui/cyber-button';
import { CyberCard, CyberCardContent } from '@/components/ui/cyber-card';
import { GlitchText } from '@/components/ui/glitch-text';
import { useStories } from '@/hooks/useStory';
import type { Story } from '@/types/story';

const GENRES = ['All', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror'];

function genreGradient(genre: string): string {
  switch (genre) {
    case 'Sci-Fi':
      return 'from-cyan-500/30 via-blue-500/20 to-purple-500/30';
    case 'Fantasy':
      return 'from-red-500/30 via-rose-500/20 to-pink-500/30';
    case 'Mystery':
      return 'from-purple-500/30 via-pink-500/20 to-red-500/30';
    case 'Romance':
      return 'from-pink-500/30 via-rose-500/20 to-red-500/30';
    case 'Horror':
      return 'from-gray-500/30 via-red-500/20 to-gray-900/30';
    default:
      return 'from-neon-blue/30 via-neon-purple/20 to-neon-blue/30';
  }
}

export default function StoriesPage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');

  const { data, isLoading, error, refetch } = useStories({
    genre: selectedGenre !== 'All' ? selectedGenre : undefined,
  });

  const stories = data?.stories ?? [];

  const filteredStories = useMemo(
    () => stories.filter((story) => story.status === selectedStatus),
    [stories, selectedStatus],
  );

  const activeCount = useMemo(
    () => stories.filter((s) => s.status === 'ACTIVE').length,
    [stories],
  );

  const completedCount = useMemo(
    () => stories.filter((s) => s.status === 'COMPLETED').length,
    [stories],
  );

  const totalChapters = useMemo(
    () => stories.reduce((sum, s) => sum + (s._count?.chapters ?? s.currentChapter ?? 0), 0),
    [stories],
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-semibold">Failed to load stories</h3>
        <p className="mt-2 text-muted-foreground">{(error as Error).message}</p>
        <CyberButton className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </CyberButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <GlitchText
          text="Stories"
          className="font-fantasy text-4xl font-bold text-neon-blue"
        />
        <p className="mt-2 text-muted-foreground">
          Explore AI-generated tales and predict their outcomes
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-blue/20 p-2">
              <BookOpen className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Stories</p>
              <p className="text-xl font-bold">
                {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-void-800" /> : activeCount}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-purple/20 p-2">
              <Users className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Stories</p>
              <p className="text-xl font-bold">
                {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-void-800" /> : (data?.total ?? 0)}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <BookOpen className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Chapters</p>
              <p className="text-xl font-bold">
                {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-void-800" /> : totalChapters}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Sparkles className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold">
                {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-void-800" /> : completedCount}
              </p>
            </div>
          </div>
        </CyberCard>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Genre:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                selectedGenre === genre
                  ? 'bg-neon-blue text-void-950'
                  : 'bg-void-900 text-muted-foreground hover:bg-void-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-8 border-b border-neon-blue/20">
        <div className="flex gap-4">
          {['ACTIVE', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'border-neon-blue text-neon-blue'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'ACTIVE' ? 'Active Stories' : 'Completed Stories'}
              <span className="ml-2 rounded-full bg-neon-blue/20 px-2 py-0.5 text-xs">
                {status === 'ACTIVE' ? activeCount : completedCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CyberCard key={i} variant="glass" className="overflow-hidden">
              <div className="aspect-video animate-pulse bg-void-800" />
              <CyberCardContent className="p-5">
                <div className="h-4 w-16 animate-pulse rounded bg-void-800" />
                <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-void-800" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-void-800" />
                <div className="mt-4 flex gap-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-void-800" />
                  <div className="h-3 w-20 animate-pulse rounded bg-void-800" />
                </div>
              </CyberCardContent>
            </CyberCard>
          ))}
        </div>
      )}

      {/* Stories Grid */}
      {!isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="group"
            >
              <CyberCard variant="glass" className="overflow-hidden transition-all hover:border-neon-blue/50">
                {/* Cover Image */}
                <div className={`relative aspect-video bg-gradient-to-br ${genreGradient(story.genre)}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white/20" />
                  </div>
                  {/* Status Badge */}
                  <div className="absolute left-3 top-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      story.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-muted text-muted-foreground border border-muted'
                    }`}>
                      {story.status}
                    </span>
                  </div>
                  {/* Chapter Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded bg-void-950/80 px-2 py-1 text-xs text-white">
                      Chapter {story.currentChapter}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <CyberCardContent className="p-5">
                  {/* Genre Tag */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded border border-neon-blue/30 bg-neon-blue/10 px-2 py-0.5 text-neon-blue">
                      {story.genre}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3 font-fantasy text-xl font-bold group-hover:text-neon-blue transition-colors">
                    {story.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {story.description}
                  </p>

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{story._count?.chapters ?? story.currentChapter} chapters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{story._count?.characters ?? 0} characters</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex gap-2">
                    <CyberButton size="sm" className="flex-1">
                      Read Now
                    </CyberButton>
                    {story.status === 'ACTIVE' && (
                      <CyberButton size="sm" variant="ghost" className="flex-1">
                        Predict
                      </CyberButton>
                    )}
                  </div>
                </CyberCardContent>
              </CyberCard>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStories.length === 0 && (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No stories found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your filters or check back later for new stories.
          </p>
        </div>
      )}
    </div>
  );
}
