'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  ChevronRight,
  Sparkles,
  BookOpen,
  ExternalLink,
  Heart,
  Swords,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStory } from '@/hooks/useStory';
import { useCharacter, useCharacterRelations } from '@/hooks/useCompendium';

export default function CharacterDetailPage() {
  const params = useParams();
  const storyId = params.storyId as string;
  const characterId = params.characterId as string;

  const { data: story } = useStory(storyId);
  const { data: character, isLoading } = useCharacter(storyId, characterId);
  const { data: relations } = useCharacterRelations(storyId, characterId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 rounded-xl bg-card" />
          <div className="mt-6 h-8 w-1/3 rounded bg-card" />
          <div className="mt-4 h-4 w-2/3 rounded bg-card" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Character not found</h1>
        <Button asChild className="mt-6">
          <Link href={`/stories/${storyId}/compendium/characters`}>
            Back to Characters
          </Link>
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    alive: 'bg-green-500/20 text-green-400 border-green-500/30',
    deceased: 'bg-red-500/20 text-red-400 border-red-500/30',
    unknown: 'bg-muted text-muted-foreground border-border',
  };

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
        <Link
          href={`/stories/${storyId}/compendium/characters`}
          className="hover:text-primary"
        >
          Characters
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{character.name}</span>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Image & Basic Info */}
        <div className="lg:col-span-1">
          {/* Character Image */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-square bg-gradient-to-br from-blue-900/30 to-purple-900/30">
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Users className="h-32 w-32 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* NFT Info */}
            {character.nftTokenId && (
              <div className="border-t border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="h-4 w-4" />
                    NFT #{character.nftTokenId}
                  </span>
                  {character.nftIpfsUri && (
                    <a
                      href={character.nftIpfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on IPFS
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs capitalize ${
                    statusColors[character.status] || statusColors.unknown
                  }`}
                >
                  {character.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">First Appearance</span>
                <Link
                  href={`/stories/${storyId}/read/${character.firstAppearance}`}
                  className="flex items-center gap-1 text-sm hover:text-primary"
                >
                  <BookOpen className="h-3 w-3" />
                  Chapter {character.firstAppearance}
                </Link>
              </div>
            </div>
          </div>

          {/* Mint NFT Button */}
          {!character.nftTokenId && (
            <Button className="mt-4 w-full" size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Mint as NFT
            </Button>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          <h1 className="font-fantasy text-4xl font-bold">{character.name}</h1>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {character.description}
            </p>
          </div>

          {/* Traits */}
          {character.traits && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Traits</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {character.traits.personality && (
                  <div className="rounded-lg border border-border bg-card/50 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <Heart className="h-4 w-4 text-pink-500" />
                      Personality
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {character.traits.personality.map((trait, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-pink-500/10 px-2 py-1 text-xs text-pink-400"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {character.traits.abilities && (
                  <div className="rounded-lg border border-border bg-card/50 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <Swords className="h-4 w-4 text-amber-500" />
                      Abilities
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {character.traits.abilities.map((ability, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-400"
                        >
                          {ability}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Relationships */}
          {relations && relations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Relationships</h2>
              <div className="mt-4 space-y-3">
                {relations.map((rel) => {
                  const otherChar =
                    rel.characterA.id === character.id
                      ? rel.characterB
                      : rel.characterA;
                  return (
                    <Link
                      key={rel.id}
                      href={`/stories/${storyId}/compendium/characters/${otherChar.id}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="flex items-center gap-3">
                        {otherChar.imageUrl ? (
                          <img
                            src={otherChar.imageUrl}
                            alt={otherChar.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{otherChar.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {rel.relationship}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
