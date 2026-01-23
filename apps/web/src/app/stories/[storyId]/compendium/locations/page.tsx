'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Map, Sparkles, BookOpen, ExternalLink, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStory } from '@/hooks/useStory';
import { useLocations } from '@/hooks/useCompendium';

const LOCATION_TYPES: Record<string, { icon: string; color: string }> = {
  city: { icon: '🏰', color: 'border-blue-500 bg-blue-500/10' },
  dungeon: { icon: '⚔️', color: 'border-red-500 bg-red-500/10' },
  forest: { icon: '🌲', color: 'border-green-500 bg-green-500/10' },
  mountain: { icon: '⛰️', color: 'border-gray-500 bg-gray-500/10' },
  ocean: { icon: '🌊', color: 'border-cyan-500 bg-cyan-500/10' },
  desert: { icon: '🏜️', color: 'border-amber-500 bg-amber-500/10' },
  village: { icon: '🏘️', color: 'border-yellow-500 bg-yellow-500/10' },
  temple: { icon: '🛕', color: 'border-purple-500 bg-purple-500/10' },
  ruins: { icon: '🏚️', color: 'border-stone-500 bg-stone-500/10' },
  default: { icon: '📍', color: 'border-muted bg-muted/10' },
};

export default function LocationsPage() {
  const params = useParams();
  const storyId = params.storyId as string;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: story } = useStory(storyId);
  const { data: locations, isLoading } = useLocations(storyId);

  const filteredLocations = locations?.filter((location: any) => {
    return (
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
        <span className="text-foreground">Locations</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-fantasy text-3xl font-bold">
          <Map className="h-8 w-8 text-primary" />
          Locations & Places
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore the world of {story?.title || 'this story'} through its locations.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Locations Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : filteredLocations && filteredLocations.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location: any) => (
            <LocationCard key={location.id} location={location} storyId={storyId} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Map className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Locations Found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search.'
              : 'Locations will appear here as the story progresses.'}
          </p>
        </div>
      )}
    </div>
  );
}

function LocationCard({ location, storyId }: { location: any; storyId: string }) {
  const locationType = location.type?.toLowerCase() || 'default';
  const typeInfo = LOCATION_TYPES[locationType] || LOCATION_TYPES.default;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50">
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
        {location.imageUrl ? (
          <img
            src={location.imageUrl}
            alt={location.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl opacity-30">{typeInfo.icon}</span>
          </div>
        )}

        {/* Type Badge */}
        {location.type && (
          <div
            className={`absolute right-2 top-2 rounded-full border px-2 py-1 text-xs capitalize backdrop-blur ${typeInfo.color}`}
          >
            {typeInfo.icon} {location.type}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{location.name}</h3>
          {location.nftTokenId && (
            <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              NFT
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {location.description}
        </p>

        {/* Features */}
        {location.features && location.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {location.features.slice(0, 3).map((feature: string, i: number) => (
              <span
                key={i}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {feature}
              </span>
            ))}
            {location.features.length > 3 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                +{location.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Chapter {location.firstAppearance}
          </div>
          {location.nftIpfsUri && (
            <a
              href={location.nftIpfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
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
        {!location.nftTokenId && (
          <Button size="sm" className="mt-3 w-full" variant="outline">
            <Sparkles className="mr-2 h-3 w-3" />
            Mint as NFT
          </Button>
        )}
      </div>
    </div>
  );
}
