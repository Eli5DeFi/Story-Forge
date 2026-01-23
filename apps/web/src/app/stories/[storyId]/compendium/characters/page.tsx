'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Search, Filter, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStory } from '@/hooks/useStory';
import { useCharacters } from '@/hooks/useCompendium';
import type { Character } from '@/types/story';

export default function CharactersPage() {
  const params = useParams();
  const storyId = params.storyId as string;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: story } = useStory(storyId);
  const { data: characters, isLoading } = useCharacters(storyId);

  const filteredCharacters = characters?.filter((char) => {
    const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || char.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/stories/${storyId}`} className="hover:text-primary">
          {story?.title || 'Story'}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/stories/${storyId}/compendium`} className="hover:text-primary">
          Compendium
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Characters</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-fantasy text-4xl font-bold">
            <Users className="h-10 w-10 text-primary" />
            Characters
          </h1>
          <p className="mt-2 text-muted-foreground">
            {characters?.length || 0} characters discovered in the story
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['all', 'alive', 'deceased', 'unknown'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      )}

      {/* Characters Grid */}
      {filteredCharacters && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              storyId={storyId}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCharacters?.length === 0 && (
        <div className="py-20 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No characters found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

function CharacterCard({
  character,
  storyId,
}: {
  character: Character;
  storyId: string;
}) {
  const statusColors: Record<string, string> = {
    alive: 'bg-green-500/20 text-green-400',
    deceased: 'bg-red-500/20 text-red-400',
    unknown: 'bg-muted text-muted-foreground',
  };

  return (
    <Link
      href={`/stories/${storyId}/compendium/characters/${character.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-blue-900/30 to-purple-900/30">
        {character.imageUrl ? (
          <img
            src={character.imageUrl}
            alt={character.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Users className="h-20 w-20 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="font-fantasy text-xl font-bold group-hover:text-primary">
            {character.name}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs capitalize ${
              statusColors[character.status] || statusColors.unknown
            }`}
          >
            {character.status}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {character.description}
        </p>

        {/* Traits */}
        {character.traits?.personality && character.traits.personality.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {character.traits.personality.slice(0, 3).map((trait, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>First appeared: Ch. {character.firstAppearance}</span>
          {character.nftTokenId && (
            <span className="flex items-center gap-1 text-primary">
              <Sparkles className="h-3 w-3" />
              NFT #{character.nftTokenId}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
