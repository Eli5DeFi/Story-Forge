'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Share2,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStory, useChapter, usePrefetchChapter } from '@/hooks/useStory';
import { formatDistanceToNow } from 'date-fns';
import { BettingPanel } from '@/components/betting/BettingPanel';
import { ChapterContent } from '@/components/story/ChapterContent';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;
  const chapterNumber = parseInt(params.chapter as string, 10);

  const { data: story } = useStory(storyId);
  const { data: chapter, isLoading, error } = useChapter(storyId, chapterNumber);
  const prefetchChapter = usePrefetchChapter();

  // Prefetch adjacent chapters
  const handlePrefetch = (num: number) => {
    if (num > 0 && story && num <= story.currentChapter) {
      prefetchChapter(storyId, num);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-card" />
          <div className="h-6 w-1/2 rounded bg-card" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 rounded bg-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Chapter not found</h1>
        <p className="mt-2 text-muted-foreground">
          This chapter doesn&apos;t exist or is still being generated.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/stories/${storyId}`}>Back to Story</Link>
        </Button>
      </div>
    );
  }

  const hasPrevious = chapterNumber > 1;
  const hasNext = story && chapterNumber < story.currentChapter;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href={`/stories/${storyId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{story?.title || 'Back to Story'}</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Chapter Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-primary font-medium">
              Chapter {chapter.chapterNumber}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(chapter.publishedAt), { addSuffix: true })}
            </span>
            {chapter.ipfsHash && (
              <>
                <span>•</span>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${chapter.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3" />
                  IPFS
                </a>
              </>
            )}
          </div>
          <h1 className="mt-3 font-fantasy text-3xl font-bold md:text-4xl">
            {chapter.title}
          </h1>
        </div>

        {/* Chapter Content */}
        <ChapterContent content={chapter.content} />

        {/* Chapter Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="outline"
            disabled={!hasPrevious}
            onClick={() => router.push(`/stories/${storyId}/read/${chapterNumber - 1}`)}
            onMouseEnter={() => handlePrefetch(chapterNumber - 1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Link
            href={`/stories/${storyId}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            <BookOpen className="mr-1 inline h-4 w-4" />
            All Chapters
          </Link>

          <Button
            variant="outline"
            disabled={!hasNext}
            onClick={() => router.push(`/stories/${storyId}/read/${chapterNumber + 1}`)}
            onMouseEnter={() => handlePrefetch(chapterNumber + 1)}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Betting Panel */}
        {(chapter.status === 'BETTING_OPEN' || chapter.status === 'BETTING_CLOSED') && (
          <div className="mt-12">
            <BettingPanel chapter={chapter} />
          </div>
        )}

        {/* AI Reasoning (for resolved chapters) */}
        {chapter.status === 'RESOLVED' && chapter.aiReasoning && (
          <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-primary">
              <BookOpen className="h-5 w-5" />
              AI&apos;s Narrative Decision
            </h3>
            <p className="mt-3 text-muted-foreground">{chapter.aiReasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
