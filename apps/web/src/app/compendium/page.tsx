'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  MapPin,
  Swords,
  BookOpen,
  Sparkles,
  ChevronRight,
  Filter,
  Skull,
  Crown,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { GlitchText } from '@/components/ui/glitch-text';
import { useStories } from '@/hooks/useStory';
import { useCharacters, useLocations, useItems, useMonsters } from '@/hooks/useCompendium';
import type { Character, Item, Location, Monster } from '@/types/story';

export default function CompendiumPage() {
  const [activeCategory, setActiveCategory] = useState('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState('');

  // Load stories for the dropdown
  const { data: storiesData } = useStories();
  const stories = storiesData?.stories ?? [];

  // Load compendium data for selected story
  const { data: characters, isLoading: charsLoading, error: charsError, refetch: refetchChars } = useCharacters(selectedStory);
  const { data: locations, isLoading: locsLoading } = useLocations(selectedStory);
  const { data: items, isLoading: itemsLoading } = useItems(selectedStory);
  const { data: monsters, isLoading: monstersLoading } = useMonsters(selectedStory);

  const isLoading = charsLoading || locsLoading || itemsLoading || monstersLoading;

  // Flatten character traits from {personality?, abilities?} to string[]
  function flattenTraits(traits?: Character['traits']): string[] {
    if (!traits) return [];
    return [...(traits.personality ?? []), ...(traits.abilities ?? [])];
  }

  // Category counts from actual data
  const categories = useMemo(() => [
    { id: 'characters', label: 'Characters', icon: Users, count: characters?.length ?? 0 },
    { id: 'locations', label: 'Locations', icon: MapPin, count: locations?.length ?? 0 },
    { id: 'items', label: 'Items & Artifacts', icon: Sparkles, count: items?.length ?? 0 },
    { id: 'monsters', label: 'Monsters', icon: Skull, count: monsters?.length ?? 0 },
  ], [characters, locations, items, monsters]);

  // Filter by search query
  const filteredCharacters = useMemo(() =>
    (characters ?? []).filter((c) =>
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [characters, searchQuery],
  );

  const filteredLocations = useMemo(() =>
    (locations ?? []).filter((l) =>
      !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [locations, searchQuery],
  );

  const filteredItems = useMemo(() =>
    (items ?? []).filter((i) =>
      !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [items, searchQuery],
  );

  const filteredMonsters = useMemo(() =>
    (monsters ?? []).filter((m) =>
      !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [monsters, searchQuery],
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'alive':
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'deceased':
        return 'text-red-400 bg-red-400/20';
      case 'unknown':
        return 'text-amber-400 bg-amber-400/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Mythic':
        return 'text-amber-400 border-amber-400/50 bg-amber-400/10';
      case 'Legendary':
        return 'text-neon-purple border-neon-purple/50 bg-neon-purple/10';
      case 'Epic':
        return 'text-neon-blue border-neon-blue/50 bg-neon-blue/10';
      case 'Rare':
        return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
      default:
        return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <GlitchText
          text="Story Compendium"
          className="font-fantasy text-4xl font-bold text-neon-blue"
        />
        <p className="mt-2 text-muted-foreground">
          Explore the lore, characters, and worlds across all stories
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search the compendium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neon-blue/30 bg-void-950/50 py-2 pl-10 pr-4 text-sm focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue"
          />
        </div>
        <select
          value={selectedStory}
          onChange={(e) => setSelectedStory(e.target.value)}
          className="rounded-lg border border-neon-blue/30 bg-void-950/50 px-4 py-2 text-sm focus:border-neon-blue focus:outline-none"
        >
          <option value="">Select a story...</option>
          {stories.map((story) => (
            <option key={story.id} value={story.id}>
              {story.title}
            </option>
          ))}
        </select>
      </div>

      {/* No story selected */}
      {!selectedStory && (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Select a Story</h3>
          <p className="mt-2 text-muted-foreground">
            Choose a story from the dropdown above to browse its compendium.
          </p>
        </div>
      )}

      {selectedStory && (
        <>
          {/* Category Tabs */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    activeCategory === category.id
                      ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                      : 'border-neon-blue/20 bg-void-950/50 text-muted-foreground hover:border-neon-blue/50'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <p className="mt-2 font-semibold">{category.label}</p>
                  <p className="text-sm opacity-70">
                    {isLoading ? '...' : `${category.count} entries`}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CyberCard key={i} variant="glass" className="overflow-hidden">
                  <div className="h-24 animate-pulse bg-void-800" />
                  <CyberCardContent className="p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-void-800" />
                    <div className="mt-2 h-4 w-full animate-pulse rounded bg-void-800" />
                    <div className="mt-3 flex gap-2">
                      <div className="h-5 w-14 animate-pulse rounded bg-void-800" />
                      <div className="h-5 w-14 animate-pulse rounded bg-void-800" />
                    </div>
                  </CyberCardContent>
                </CyberCard>
              ))}
            </div>
          )}

          {/* Error State */}
          {charsError && (
            <div className="py-20 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-4 text-lg font-semibold">Failed to load compendium</h3>
              <p className="mt-2 text-muted-foreground">{(charsError as Error).message}</p>
              <CyberButton className="mt-4" onClick={() => refetchChars()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </CyberButton>
            </div>
          )}

          {/* Characters Grid */}
          {!isLoading && activeCategory === 'characters' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCharacters.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">No characters found</p>
                </div>
              ) : (
                filteredCharacters.map((character) => (
                  <CyberCard key={character.id} variant="glass" className="overflow-hidden">
                    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-neon-blue/20 to-neon-purple/20">
                      {character.imageUrl ? (
                        <img src={character.imageUrl} alt={character.name} className="h-full w-full object-cover" />
                      ) : (
                        <Users className="h-12 w-12 text-neon-blue/50" />
                      )}
                    </div>
                    <CyberCardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{character.name}</h3>
                          <p className="text-sm text-neon-blue">Ch. {character.firstAppearance}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(character.status)}`}>
                          {character.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {character.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {flattenTraits(character.traits).map((trait) => (
                          <span
                            key={trait}
                            className="rounded border border-neon-blue/30 bg-neon-blue/10 px-2 py-0.5 text-xs text-neon-blue"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        <Link
                          href={`/stories/${selectedStory}/compendium/characters/${character.id}`}
                          className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
                        >
                          View Details <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </CyberCardContent>
                  </CyberCard>
                ))
              )}
            </div>
          )}

          {/* Locations Grid */}
          {!isLoading && activeCategory === 'locations' && (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredLocations.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">No locations found</p>
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <CyberCard key={location.id} variant="glass" className="overflow-hidden">
                    <div className="flex h-32 items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                      {location.imageUrl ? (
                        <img src={location.imageUrl} alt={location.name} className="h-full w-full object-cover" />
                      ) : (
                        <MapPin className="h-12 w-12 text-neon-purple/50" />
                      )}
                    </div>
                    <CyberCardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{location.name}</h3>
                          <p className="text-sm text-neon-purple">{location.region || `Ch. ${location.firstAppearance}`}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {location.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="rounded border border-neon-purple/30 bg-neon-purple/10 px-2 py-0.5 text-xs text-neon-purple">
                          {location.type}
                        </span>
                        <Link
                          href={`/stories/${selectedStory}/compendium/locations/${location.id}`}
                          className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
                        >
                          Explore <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </CyberCardContent>
                  </CyberCard>
                ))
              )}
            </div>
          )}

          {/* Items Grid */}
          {!isLoading && activeCategory === 'items' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">No items found</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <CyberCard key={item.id} variant="glass" className="overflow-hidden">
                    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-amber-500/20 to-neon-purple/20">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Sparkles className="h-10 w-10 text-amber-400/50" />
                      )}
                    </div>
                    <CyberCardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{item.name}</h3>
                        <span className={`rounded border px-2 py-0.5 text-xs ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>
                      <p className="text-xs text-neon-blue">Ch. {item.firstAppearance}</p>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-3">
                        <span className="rounded bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                          {item.type}
                        </span>
                      </div>
                    </CyberCardContent>
                  </CyberCard>
                ))
              )}
            </div>
          )}

          {/* Monsters Grid */}
          {!isLoading && activeCategory === 'monsters' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMonsters.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <Skull className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-muted-foreground">No monsters found</p>
                </div>
              ) : (
                filteredMonsters.map((monster) => (
                  <CyberCard key={monster.id} variant="glass" className="overflow-hidden">
                    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-red-500/20 to-purple-500/20">
                      {monster.imageUrl ? (
                        <img src={monster.imageUrl} alt={monster.name} className="h-full w-full object-cover" />
                      ) : (
                        <Skull className="h-12 w-12 text-red-400/50" />
                      )}
                    </div>
                    <CyberCardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{monster.name}</h3>
                          <p className="text-sm text-red-400">{monster.species || 'Unknown species'}</p>
                        </div>
                        {monster.isBoss && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                            BOSS
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {monster.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {monster.abilities.slice(0, 3).map((ability) => (
                          <span
                            key={ability}
                            className="rounded border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs text-red-400"
                          >
                            {ability}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Threat: {monster.threatLevel}/10</span>
                        <span>Ch. {monster.firstAppearance}</span>
                      </div>
                    </CyberCardContent>
                  </CyberCard>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
