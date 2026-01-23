'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStories } from '@/hooks/useStory';
import type { Story } from '@/types/story';

const GENRES = ['All', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror'];

export default function StoriesPage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');

  const { data, isLoading, error } = useStories({
    genre: selectedGenre === 'All' ? undefined : selectedGenre,
    status: selectedStatus,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-fantasy text-4xl font-bold">Stories</h1>
        <p className="mt-2 text-muted-foreground">
          Explore AI-generated tales and predict their outcomes
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Genre:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-8 border-b border-border">
        <div className="flex gap-4">
          {['ACTIVE', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'ACTIVE' ? 'Active Stories' : 'Completed Stories'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load stories. Please try again later.</p>
        </div>
      )}

      {/* Stories Grid */}
      {data && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {data.stories.length === 0 && (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No stories found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or check back later for new stories.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/stories/${story.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    >
      {/* Cover Image */}
      <div className="aspect-video bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50 transition-transform group-hover:scale-105">
        {story.coverImage && (
          <img
            src={story.coverImage}
            alt={story.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Tags */}
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/20 px-2 py-1 text-primary">
            Chapter {story.currentChapter}
          </span>
          <span className="text-muted-foreground">{story.genre}</span>
          <span
            className={`ml-auto rounded-full px-2 py-1 ${
              story.status === 'ACTIVE'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {story.status}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="mt-3 font-fantasy text-xl font-bold group-hover:text-primary">
          {story.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {story.description}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          {story._count && (
            <>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{story._count.chapters} chapters</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{story._count.characters} characters</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
