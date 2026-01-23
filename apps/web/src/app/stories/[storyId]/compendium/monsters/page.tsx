'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skull, Search, Filter, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStory } from '@/hooks/useStory';
import { useMonsters } from '@/hooks/useCompendium';
import type { Monster } from '@/types/story';

export default function MonstersPage() {
  const params = useParams();
  const storyId = params.storyId as string;
  const [search, setSearch] = useState('');
  const [threatFilter, setThreatFilter] = useState<string>('all');

  const { data: story } = useStory(storyId);
  const { data: monsters, isLoading } = useMonsters(storyId);

  const filteredMonsters = monsters?.filter((monster) => {
    const matchesSearch = monster.name.toLowerCase().includes(search.toLowerCase());
    const matchesThreat =
      threatFilter === 'all' ||
      (threatFilter === 'boss' && monster.isBoss) ||
      (threatFilter === 'high' && monster.threatLevel >= 7) ||
      (threatFilter === 'medium' && monster.threatLevel >= 4 && monster.threatLevel < 7) ||
      (threatFilter === 'low' && monster.threatLevel < 4);
    return matchesSearch && matchesThreat;
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
        <span className="text-foreground">Monsters</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-fantasy text-4xl font-bold">
            <Skull className="h-10 w-10 text-red-500" />
            Monsters
          </h1>
          <p className="mt-2 text-muted-foreground">
            {monsters?.length || 0} creatures lurking in the shadows
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
            placeholder="Search monsters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Threat Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['all', 'boss', 'high', 'medium', 'low'].map((threat) => (
            <Button
              key={threat}
              variant={threatFilter === threat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setThreatFilter(threat)}
            >
              {threat.charAt(0).toUpperCase() + threat.slice(1)}
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

      {/* Monsters Grid */}
      {filteredMonsters && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMonsters.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} storyId={storyId} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredMonsters?.length === 0 && (
        <div className="py-20 text-center">
          <Skull className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No monsters found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

function MonsterCard({
  monster,
  storyId,
}: {
  monster: Monster;
  storyId: string;
}) {
  const threatColors: Record<string, string> = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    boss: 'text-red-500',
  };

  const getThreatLevel = (level: number, isBoss: boolean) => {
    if (isBoss) return 'boss';
    if (level >= 7) return 'high';
    if (level >= 4) return 'medium';
    return 'low';
  };

  const threat = getThreatLevel(monster.threatLevel, monster.isBoss);

  return (
    <Link
      href={`/stories/${storyId}/compendium/monsters/${monster.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-red-500/50 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-red-900/30 to-orange-900/30">
        {monster.imageUrl ? (
          <img
            src={monster.imageUrl}
            alt={monster.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Skull className="h-20 w-20 text-muted-foreground/30" />
          </div>
        )}

        {/* Boss Badge */}
        {monster.isBoss && (
          <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            <AlertTriangle className="h-3 w-3" />
            BOSS
          </div>
        )}

        {/* Threat Level */}
        <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-2 py-1">
          <span className={`text-sm font-bold ${threatColors[threat]}`}>
            Threat: {monster.threatLevel}/10
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-fantasy text-xl font-bold group-hover:text-red-400">
          {monster.name}
        </h3>

        {monster.species && (
          <p className="mt-1 text-sm text-muted-foreground">{monster.species}</p>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {monster.description}
        </p>

        {/* Abilities */}
        {monster.abilities && monster.abilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {monster.abilities.slice(0, 3).map((ability, i) => (
              <span
                key={i}
                className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400"
              >
                {ability}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>First appeared: Ch. {monster.firstAppearance}</span>
          {monster.nftTokenId && (
            <span className="flex items-center gap-1 text-primary">
              <Sparkles className="h-3 w-3" />
              NFT #{monster.nftTokenId}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
