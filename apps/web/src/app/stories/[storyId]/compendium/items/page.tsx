'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Sword, Sparkles, BookOpen, ExternalLink, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStory } from '@/hooks/useStory';
import { useItems } from '@/hooks/useCompendium';

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-500 bg-gray-500/10 text-gray-400',
  uncommon: 'border-green-500 bg-green-500/10 text-green-400',
  rare: 'border-blue-500 bg-blue-500/10 text-blue-400',
  epic: 'border-purple-500 bg-purple-500/10 text-purple-400',
  legendary: 'border-amber-500 bg-amber-500/10 text-amber-400',
};

export default function ItemsPage() {
  const params = useParams();
  const storyId = params.storyId as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);

  const { data: story } = useStory(storyId);
  const { data: items, isLoading } = useItems(storyId);

  const filteredItems = items?.filter((item: any) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = !rarityFilter || item.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

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
        <span className="text-foreground">Items</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-fantasy text-3xl font-bold">
          <Sword className="h-8 w-8 text-primary" />
          Items & Artifacts
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover the magical items, weapons, and artifacts from {story?.title || 'this story'}.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Rarity Filter */}
        <div className="flex gap-2">
          <Button
            variant={rarityFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRarityFilter(null)}
          >
            All
          </Button>
          {rarities.map((rarity) => (
            <Button
              key={rarity}
              variant={rarityFilter === rarity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRarityFilter(rarity)}
              className="capitalize"
            >
              {rarity}
            </Button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item: any) => (
            <ItemCard key={item.id} item={item} storyId={storyId} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Sword className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Items Found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchQuery || rarityFilter
              ? 'Try adjusting your filters.'
              : 'Items will appear here as the story progresses.'}
          </p>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, storyId }: { item: any; storyId: string }) {
  const rarityClass = RARITY_COLORS[item.rarity?.toLowerCase()] || RARITY_COLORS.common;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-amber-900/20 to-orange-900/20">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sword className="h-20 w-20 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            {item.rarity && (
              <span
                className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs capitalize ${rarityClass}`}
              >
                {item.rarity}
              </span>
            )}
          </div>
          {item.nftTokenId && (
            <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              NFT
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Chapter {item.firstAppearance}
          </div>
          {item.nftIpfsUri && (
            <a
              href={item.nftIpfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary"
            >
              IPFS
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Mint Button */}
        {!item.nftTokenId && (
          <Button size="sm" className="mt-3 w-full" variant="outline">
            <Sparkles className="mr-2 h-3 w-3" />
            Mint as NFT
          </Button>
        )}
      </div>
    </div>
  );
}
