'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Filter,
  Grid3X3,
  LayoutGrid,
  ExternalLink,
  Heart,
  Eye,
  Clock,
  Coins,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { CyberCard, CyberCardContent } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { GlitchText } from '@/components/ui/glitch-text';
import { useStories } from '@/hooks/useStory';
import { useStoryNFTs, useNFTStats } from '@/hooks/useNFTs';
import type { Character, Item, Location, Monster } from '@/types/story';

type EntityType = 'character' | 'item' | 'location' | 'monster';

interface FlatEntity {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  entityType: EntityType;
  rarity?: string;
  type?: string;
  firstAppearance: number;
  nftTokenId?: number;
}

const TYPES = ['All', 'Character', 'Item', 'Location', 'Monster'];
const RARITIES = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];

function flattenEntities(data: {
  characters: Character[];
  items: Item[];
  locations: Location[];
  monsters: Monster[];
} | undefined): FlatEntity[] {
  if (!data) return [];
  const entities: FlatEntity[] = [];

  for (const c of data.characters) {
    entities.push({
      id: c.id,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      entityType: 'character',
      firstAppearance: c.firstAppearance,
      nftTokenId: c.nftTokenId,
    });
  }
  for (const i of data.items) {
    entities.push({
      id: i.id,
      name: i.name,
      description: i.description,
      imageUrl: i.imageUrl,
      entityType: 'item',
      rarity: i.rarity,
      type: i.type,
      firstAppearance: i.firstAppearance,
      nftTokenId: i.nftTokenId,
    });
  }
  for (const l of data.locations) {
    entities.push({
      id: l.id,
      name: l.name,
      description: l.description,
      imageUrl: l.imageUrl,
      entityType: 'location',
      type: l.type,
      firstAppearance: l.firstAppearance,
    });
  }
  for (const m of data.monsters) {
    entities.push({
      id: m.id,
      name: m.name,
      description: m.description,
      imageUrl: m.imageUrl,
      entityType: 'monster',
      firstAppearance: m.firstAppearance,
      nftTokenId: m.nftTokenId,
    });
  }
  return entities;
}

export default function NFTsPage() {
  const [selectedStory, setSelectedStory] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  // Load stories for collection selector
  const { data: storiesData } = useStories();
  const stories = storiesData?.stories ?? [];

  // Load NFT entities for selected story
  const { data: nftData, isLoading: nftsLoading, error: nftsError, refetch: refetchNFTs } = useStoryNFTs(selectedStory);
  const { data: nftStats, isLoading: statsLoading } = useNFTStats(selectedStory);

  const entities = useMemo(() => flattenEntities(nftData), [nftData]);

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      const typeMatch = selectedType === 'All' || e.entityType.toLowerCase() === selectedType.toLowerCase();
      const rarityMatch = selectedRarity === 'All' || (e.rarity && e.rarity === selectedRarity);
      return typeMatch && rarityMatch;
    });
  }, [entities, selectedType, selectedRarity]);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Mythic':
        return 'from-amber-500 to-orange-500 text-amber-400 border-amber-400/50';
      case 'Legendary':
        return 'from-purple-500 to-pink-500 text-purple-400 border-purple-400/50';
      case 'Epic':
        return 'from-blue-500 to-cyan-500 text-blue-400 border-blue-400/50';
      case 'Rare':
        return 'from-green-500 to-emerald-500 text-green-400 border-green-400/50';
      default:
        return 'from-gray-500 to-gray-600 text-gray-400 border-gray-400/50';
    }
  };

  const getRarityBg = (rarity?: string) => {
    switch (rarity) {
      case 'Mythic':
        return 'bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-red-500/30';
      case 'Legendary':
        return 'bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-purple-500/30';
      case 'Epic':
        return 'bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-blue-500/30';
      case 'Rare':
        return 'bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-green-500/30';
      default:
        return 'bg-gradient-to-br from-neon-blue/30 via-neon-purple/20 to-neon-blue/30';
    }
  };

  const entityTypeLabel = (t: EntityType) => t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <GlitchText
          text="NFT Gallery"
          className="font-fantasy text-4xl font-bold text-neon-blue"
        />
        <p className="mt-2 text-muted-foreground">
          Collect unique moments, characters, and artifacts from your favorite stories
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-blue/20 p-2">
              <Sparkles className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entities</p>
              <p className="text-xl font-bold">
                {statsLoading || !selectedStory ? '--' : (nftStats?.totalEntities ?? entities.length)}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-purple/20 p-2">
              <Coins className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Minted</p>
              <p className="text-xl font-bold">
                {statsLoading || !selectedStory ? '--' : (nftStats?.totalMinted ?? 0)}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="text-xl font-bold">
                {statsLoading || !selectedStory ? '--' : (nftStats?.entityCounts?.characters ?? 0)}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Items</p>
              <p className="text-xl font-bold">
                {statsLoading || !selectedStory ? '--' : (nftStats?.entityCounts?.items ?? 0)}
              </p>
            </div>
          </div>
        </CyberCard>
      </div>

      {/* Collection Selector */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStory('')}
            className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
              !selectedStory
                ? 'bg-neon-blue text-void-950'
                : 'bg-void-900 text-muted-foreground hover:bg-void-800'
            }`}
          >
            Select a Story
          </button>
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                selectedStory === story.id
                  ? 'bg-neon-blue text-void-950'
                  : 'bg-void-900 text-muted-foreground hover:bg-void-800'
              }`}
            >
              {story.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded p-2 ${viewMode === 'grid' ? 'bg-neon-blue/20 text-neon-blue' : 'text-muted-foreground'}`}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('large')}
            className={`rounded p-2 ${viewMode === 'large' ? 'bg-neon-blue/20 text-neon-blue' : 'text-muted-foreground'}`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Type and Rarity Filters */}
      {selectedStory && (
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded border border-neon-blue/30 bg-void-950 px-2 py-1 text-sm"
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rarity:</span>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="rounded border border-neon-blue/30 bg-void-950 px-2 py-1 text-sm"
            >
              {RARITIES.map((rarity) => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* No story selected */}
      {!selectedStory && (
        <div className="py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Select a Story</h3>
          <p className="mt-2 text-muted-foreground">
            Choose a story above to browse its mintable entities.
          </p>
        </div>
      )}

      {/* Error State */}
      {nftsError && (
        <div className="py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-semibold">Failed to load NFTs</h3>
          <p className="mt-2 text-muted-foreground">{(nftsError as Error).message}</p>
          <CyberButton className="mt-4" onClick={() => refetchNFTs()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </CyberButton>
        </div>
      )}

      {/* Loading State */}
      {selectedStory && nftsLoading && (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CyberCard key={i} variant="glass" className="overflow-hidden">
              <div className="aspect-square animate-pulse bg-void-800" />
              <CyberCardContent className="p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-void-800" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-void-800" />
              </CyberCardContent>
            </CyberCard>
          ))}
        </div>
      )}

      {/* NFT Grid */}
      {selectedStory && !nftsLoading && !nftsError && (
        <>
          {filteredEntities.length === 0 ? (
            <div className="py-20 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No entities found</h3>
              <p className="mt-2 text-muted-foreground">
                No mintable entities match your filters.
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
              {filteredEntities.map((entity) => (
                <CyberCard
                  key={entity.id}
                  variant="glass"
                  className="group overflow-hidden transition-all hover:border-neon-blue/50"
                >
                  {/* Image */}
                  <div className={`relative aspect-square ${getRarityBg(entity.rarity)}`}>
                    {entity.imageUrl ? (
                      <img src={entity.imageUrl} alt={entity.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-white/20" />
                      </div>
                    )}
                    {/* Rarity Badge */}
                    {entity.rarity && (
                      <div className="absolute left-2 top-2">
                        <span className={`rounded border px-2 py-0.5 text-xs font-medium ${getRarityColor(entity.rarity)}`}>
                          {entity.rarity}
                        </span>
                      </div>
                    )}
                    {/* Type Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="rounded bg-void-950/80 px-2 py-0.5 text-xs text-white">
                        {entityTypeLabel(entity.entityType)}
                      </span>
                    </div>
                    {/* Minted indicator */}
                    {entity.nftTokenId != null && (
                      <div className="absolute right-2 top-2">
                        <span className="rounded-full bg-green-500/80 px-2 py-0.5 text-xs text-white">
                          Minted
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <CyberCardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate">{entity.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Ch. {entity.firstAppearance}
                      {entity.type ? ` • ${entity.type}` : ''}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {entity.description}
                    </p>

                    <CyberButton size="sm" className="mt-3 w-full">
                      {entity.nftTokenId != null ? 'View NFT' : 'Mint'}
                    </CyberButton>
                  </CyberCardContent>
                </CyberCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
