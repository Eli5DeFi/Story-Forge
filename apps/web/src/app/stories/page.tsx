'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, TrendingUp, Filter, Sparkles, Coins, Eye } from 'lucide-react';
import { CyberButton } from '@/components/ui/cyber-button';
import { CyberCard, CyberCardContent } from '@/components/ui/cyber-card';
import { GlitchText } from '@/components/ui/glitch-text';

// Mock stories data
const MOCK_STORIES = [
  {
    id: 'quantum-heist',
    title: 'The Quantum Heist',
    description: 'In a world where quantum computing has unlocked the secrets of reality, a team of hackers plans the ultimate heist against Nexus Corporation.',
    genre: 'Sci-Fi',
    status: 'ACTIVE',
    currentChapter: 7,
    coverImage: null,
    totalPool: 39000,
    readers: 1247,
    _count: { chapters: 7, characters: 12 },
    gradient: 'from-cyan-500/30 via-blue-500/20 to-purple-500/30',
  },
  {
    id: 'neon-shadows',
    title: 'Neon Shadows',
    description: 'A detective with a dark past hunts a serial killer through the rain-soaked streets of New Angeles, uncovering a conspiracy that reaches the highest levels.',
    genre: 'Mystery',
    status: 'ACTIVE',
    currentChapter: 12,
    coverImage: null,
    totalPool: 48000,
    readers: 2134,
    _count: { chapters: 12, characters: 18 },
    gradient: 'from-purple-500/30 via-pink-500/20 to-red-500/30',
  },
  {
    id: 'stellar-requiem',
    title: 'Stellar Requiem',
    description: 'The last survivor of a destroyed colony discovers an ancient artifact that could either save humanity or doom it forever.',
    genre: 'Sci-Fi',
    status: 'ACTIVE',
    currentChapter: 8,
    coverImage: null,
    totalPool: 31500,
    readers: 987,
    _count: { chapters: 8, characters: 9 },
    gradient: 'from-amber-500/30 via-orange-500/20 to-red-500/30',
  },
  {
    id: 'echoes-tomorrow',
    title: 'Echoes of Tomorrow',
    description: 'When an ancient AI awakens after centuries of dormancy, it must navigate a world that has forgotten the civilization that created it.',
    genre: 'Sci-Fi',
    status: 'ACTIVE',
    currentChapter: 4,
    coverImage: null,
    totalPool: 22500,
    readers: 654,
    _count: { chapters: 4, characters: 7 },
    gradient: 'from-green-500/30 via-emerald-500/20 to-cyan-500/30',
  },
  {
    id: 'blood-crown',
    title: 'Blood & Crown',
    description: 'In a kingdom torn by civil war, three heirs must fight for a throne that may destroy whoever sits upon it.',
    genre: 'Fantasy',
    status: 'ACTIVE',
    currentChapter: 15,
    coverImage: null,
    totalPool: 67200,
    readers: 3421,
    _count: { chapters: 15, characters: 24 },
    gradient: 'from-red-500/30 via-rose-500/20 to-pink-500/30',
  },
  {
    id: 'void-walker',
    title: 'The Void Walker',
    description: 'A mage discovers they can walk between dimensions, but each journey costs a piece of their humanity.',
    genre: 'Fantasy',
    status: 'COMPLETED',
    currentChapter: 20,
    coverImage: null,
    totalPool: 0,
    readers: 4521,
    _count: { chapters: 20, characters: 15 },
    gradient: 'from-violet-500/30 via-purple-500/20 to-indigo-500/30',
  },
];

const GENRES = ['All', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror'];

export default function StoriesPage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');

  const filteredStories = MOCK_STORIES.filter((story) => {
    const genreMatch = selectedGenre === 'All' || story.genre === selectedGenre;
    const statusMatch = story.status === selectedStatus;
    return genreMatch && statusMatch;
  });

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
              <p className="text-xl font-bold">5</p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-purple/20 p-2">
              <Users className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Readers</p>
              <p className="text-xl font-bold">12,964</p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Coins className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pool</p>
              <p className="text-xl font-bold">$208,200</p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Sparkles className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chapters Today</p>
              <p className="text-xl font-bold">3</p>
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
                {MOCK_STORIES.filter((s) => s.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story) => (
          <Link
            key={story.id}
            href={`/stories/${story.id}`}
            className="group"
          >
            <CyberCard variant="glass" className="overflow-hidden transition-all hover:border-neon-blue/50">
              {/* Cover Image */}
              <div className={`relative aspect-video bg-gradient-to-br ${story.gradient}`}>
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
                {/* Pool Badge */}
                {story.totalPool > 0 && (
                  <div className="absolute right-3 top-3">
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs font-medium text-amber-400">
                      <Coins className="h-3 w-3" />
                      ${story.totalPool.toLocaleString()}
                    </span>
                  </div>
                )}
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
                    <span>{story._count.chapters} chapters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{story._count.characters} characters</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Eye className="h-3 w-3" />
                    <span>{story.readers.toLocaleString()}</span>
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

      {/* Empty State */}
      {filteredStories.length === 0 && (
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
