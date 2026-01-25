'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, TrendingUp, Filter, Sparkles, Sword, Crown } from 'lucide-react';
import { CyberCard, CyberCardHeader, CyberCardContent } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { GlitchText } from '@/components/ui/glitch-text';

// Mock story data
const MOCK_STORIES = [
  {
    id: 'echoes-of-eternity',
    title: 'Echoes of Eternity',
    description: 'In a world where memories can be extracted and traded, a young memory thief discovers she possesses the forbidden ability to rewrite the past itself. As ancient powers awaken and empires crumble, she must choose between saving her dying sister or preserving the fabric of reality.',
    genre: 'Fantasy',
    status: 'ACTIVE',
    currentChapter: 1,
    coverImage: null,
    totalBets: 12500,
    readers: 847,
    _count: {
      chapters: 1,
      characters: 8,
    },
  },
  {
    id: 'neon-dynasty',
    title: 'Neon Dynasty',
    description: 'The megacorporations have achieved immortality through digital consciousness transfer. When a street-level hacker accidentally downloads the memories of a dead CEO, she uncovers a conspiracy that could end humanity as we know it.',
    genre: 'Sci-Fi',
    status: 'ACTIVE',
    currentChapter: 3,
    coverImage: null,
    totalBets: 8200,
    readers: 623,
    _count: {
      chapters: 3,
      characters: 12,
    },
  },
  {
    id: 'the-last-grimoire',
    title: 'The Last Grimoire',
    description: 'Magic is dying. The old gods are forgotten. But in a dusty antique shop, a failed wizard\'s apprentice finds the last true spellbook—and awakens something that should have stayed buried for eternity.',
    genre: 'Fantasy',
    status: 'ACTIVE',
    currentChapter: 2,
    coverImage: null,
    totalBets: 15800,
    readers: 1203,
    _count: {
      chapters: 2,
      characters: 15,
    },
  },
];

const GENRES = ['All', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror'];

export default function StoriesPage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');

  const filteredStories = MOCK_STORIES.filter(story => {
    if (selectedGenre !== 'All' && story.genre !== selectedGenre) return false;
    if (story.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <GlitchText
            text="Story Archives"
            className="font-fantasy text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-cyber-500"
          />
          <p className="mt-4 text-muted-foreground text-lg">
            Explore AI-generated tales and predict their outcomes
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <CyberCard variant="glass" className="text-center py-4">
            <div className="text-2xl font-bold text-neon-blue">{MOCK_STORIES.length}</div>
            <div className="text-xs text-muted-foreground">Active Stories</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <div className="text-2xl font-bold text-gold-500">$36,500</div>
            <div className="text-xs text-muted-foreground">Total Bets</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <div className="text-2xl font-bold text-neon-purple">2,673</div>
            <div className="text-xs text-muted-foreground">Readers</div>
          </CyberCard>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neon-blue" />
            <span className="text-sm text-muted-foreground">Genre:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <CyberButton
                key={genre}
                variant={selectedGenre === genre ? 'neon' : 'ghost'}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </CyberButton>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-1 p-1 rounded-lg bg-void-800/50 border border-neon-blue/20">
            {['ACTIVE', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-neon-blue/20 text-neon-blue shadow-neon-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'ACTIVE' ? 'Active Stories' : 'Completed Stories'}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-neon-blue/50" />
            <h3 className="mt-4 text-lg font-semibold">No stories found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters or check back later for new stories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCard({ story, index }: { story: typeof MOCK_STORIES[0]; index: number }) {
  const genreIcons: Record<string, React.ReactNode> = {
    Fantasy: <Sparkles className="h-4 w-4" />,
    'Sci-Fi': <Sword className="h-4 w-4" />,
    Mystery: <BookOpen className="h-4 w-4" />,
  };

  return (
    <Link href={`/stories/${story.id}`}>
      <CyberCard
        variant="default"
        corners
        className="h-full transition-all hover:shadow-neon-md hover:border-neon-blue/50 group cursor-pointer animate-slide-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Cover Gradient */}
        <div className="aspect-video -mx-6 -mt-6 mb-4 bg-gradient-to-br from-neon-purple/30 via-neon-blue/20 to-cyber-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyber-grid opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-fantasy text-4xl font-bold text-white/20 group-hover:text-white/40 transition-colors">
              {story.title.charAt(0)}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              story.status === 'ACTIVE'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-muted text-muted-foreground'
            }`}>
              {story.status}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 text-xs mb-3">
          <span className="flex items-center gap-1 rounded-full bg-neon-blue/20 px-2 py-1 text-neon-blue border border-neon-blue/30">
            {genreIcons[story.genre]}
            {story.genre}
          </span>
          <span className="rounded-full bg-gold-500/20 px-2 py-1 text-gold-500 border border-gold-500/30">
            Chapter {story.currentChapter}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-fantasy text-xl font-bold text-foreground group-hover:text-neon-blue transition-colors">
          {story.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {story.description}
        </p>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-neon-blue/10 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-neon-blue" />
              <span>{story._count.chapters} ch</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-neon-purple" />
              <span>{story.readers}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gold-500">
            <TrendingUp className="h-3 w-3" />
            <span>${story.totalBets.toLocaleString()}</span>
          </div>
        </div>
      </CyberCard>
    </Link>
  );
}
