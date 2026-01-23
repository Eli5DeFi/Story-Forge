'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Users,
  Map,
  Sword,
  Scroll,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStory, useChapters, useStoryStats } from '@/hooks/useStory';
import { formatDistanceToNow } from 'date-fns';
import type { Chapter } from '@/types/story';

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.storyId as string;

  const { data: story, isLoading: storyLoading } = useStory(storyId);
  const { data: chaptersData, isLoading: chaptersLoading } = useChapters(storyId);
  const { data: stats } = useStoryStats(storyId);

  if (storyLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 rounded-xl bg-card" />
          <div className="mt-6 h-8 w-1/3 rounded bg-card" />
          <div className="mt-4 h-4 w-2/3 rounded bg-card" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="mt-2 text-muted-foreground">
          The story you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/stories">Browse Stories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-blue-900/80 to-indigo-900/80" />
        {story.coverImage && (
          <img
            src={story.coverImage}
            alt={story.title}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="relative px-8 py-16">
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-primary">
              {story.genre}
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                story.status === 'ACTIVE'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {story.status}
            </span>
          </div>
          <h1 className="mt-4 font-fantasy text-4xl font-bold md:text-5xl">
            {story.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {story.description}
          </p>

          {/* Quick Stats */}
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>{story.currentChapter} chapters</span>
            </div>
            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{stats.totalBettors} readers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sword className="h-5 w-5 text-primary" />
                  <span>{stats.totalEntities} entities</span>
                </div>
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" className="glow-gold" asChild>
              <Link href={`/stories/${storyId}/read/${story.currentChapter}`}>
                Read Latest Chapter
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/stories/${storyId}/compendium`}>
                <Scroll className="mr-2 h-5 w-5" />
                Compendium
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Chapters List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-fantasy text-2xl font-bold">Chapters</h2>
            <span className="text-sm text-muted-foreground">
              {chaptersData?.total || 0} total
            </span>
          </div>

          {chaptersLoading ? (
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-card" />
              ))}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {chaptersData?.chapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  storyId={storyId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* World State */}
          {story.worldState && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <Map className="h-5 w-5 text-primary" />
                Current World State
              </h3>
              <div className="mt-4 space-y-3 text-sm">
                {story.worldState.currentLocation && (
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="ml-2">{story.worldState.currentLocation}</span>
                  </div>
                )}
                {story.worldState.timeOfDay && (
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-2">{story.worldState.timeOfDay}</span>
                  </div>
                )}
                {story.worldState.activeQuests &&
                  story.worldState.activeQuests.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Active Quests:</span>
                      <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                        {story.worldState.activeQuests.map((quest, i) => (
                          <li key={i}>{quest}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold">Explore</h3>
            <div className="mt-4 space-y-2">
              <Link
                href={`/stories/${storyId}/compendium/characters`}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Characters
                </span>
                <span className="text-sm text-muted-foreground">
                  {story._count?.characters || 0}
                </span>
              </Link>
              <Link
                href={`/stories/${storyId}/compendium/items`}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <Sword className="h-4 w-4 text-primary" />
                  Items
                </span>
                <span className="text-sm text-muted-foreground">
                  {story._count?.items || 0}
                </span>
              </Link>
              <Link
                href={`/stories/${storyId}/compendium/locations`}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-primary" />
                  Locations
                </span>
                <span className="text-sm text-muted-foreground">
                  {story._count?.locations || 0}
                </span>
              </Link>
              <Link
                href={`/stories/${storyId}/compendium/monsters`}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <Scroll className="h-4 w-4 text-primary" />
                  Monsters
                </span>
                <span className="text-sm text-muted-foreground">
                  {story._count?.monsters || 0}
                </span>
              </Link>
            </div>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">Statistics</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Bets</span>
                  <span className="font-bold text-primary">${stats.totalBets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Chapters</span>
                  <span>{stats.totalChapters}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Bettors</span>
                  <span>{stats.totalBettors}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChapterCard({ chapter, storyId }: { chapter: Chapter; storyId: string }) {
  const statusColors = {
    GENERATING: 'bg-yellow-500/20 text-yellow-400',
    BETTING_OPEN: 'bg-green-500/20 text-green-400',
    BETTING_CLOSED: 'bg-orange-500/20 text-orange-400',
    RESOLVED: 'bg-muted text-muted-foreground',
  };

  return (
    <Link
      href={`/stories/${storyId}/read/${chapter.chapterNumber}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-primary">
              Chapter {chapter.chapterNumber}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                statusColors[chapter.status]
              }`}
            >
              {chapter.status.replace('_', ' ')}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold group-hover:text-primary">
            {chapter.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {chapter.summary}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      {/* Chapter Meta */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(chapter.publishedAt), { addSuffix: true })}
          </span>
        </div>
        {chapter.status === 'BETTING_OPEN' && chapter.bettingEndsAt && (
          <div className="flex items-center gap-1 text-green-400">
            <span>Betting ends</span>
            <span>
              {formatDistanceToNow(new Date(chapter.bettingEndsAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}
        {chapter.ipfsHash && (
          <a
            href={`https://gateway.pinata.cloud/ipfs/${chapter.ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 hover:text-primary"
          >
            <ExternalLink className="h-3 w-3" />
            <span>IPFS</span>
          </a>
        )}
      </div>
    </Link>
  );
}
