'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Network, Users } from 'lucide-react';
import { useStory } from '@/hooks/useStory';
import { useCharacters, useCharacterRelations } from '@/hooks/useCompendium';
import { RelationshipDiagram } from '@/components/compendium/RelationshipDiagram';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RelationshipsPage() {
  const params = useParams();
  const storyId = params.storyId as string;
  const router = useRouter();

  const { data: story } = useStory(storyId);
  const { data: characters, isLoading: charactersLoading } = useCharacters(storyId);
  const [allRelationships, setAllRelationships] = useState<any[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(true);

  // Fetch relationships for all characters
  useEffect(() => {
    if (!characters || characters.length === 0) {
      setLoadingRelations(false);
      return;
    }

    const fetchAllRelations = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const relationPromises = characters.map(async (char: any) => {
          const response = await fetch(
            `${API_BASE}/stories/${storyId}/compendium/characters/${char.id}/relations`
          );
          if (response.ok) {
            return response.json();
          }
          return [];
        });

        const results = await Promise.all(relationPromises);

        // Flatten and deduplicate relationships
        const seenIds = new Set<string>();
        const uniqueRelations = results.flat().filter((rel: any) => {
          if (seenIds.has(rel.id)) return false;
          seenIds.add(rel.id);
          return true;
        });

        setAllRelationships(uniqueRelations);
      } catch (error) {
        console.error('Failed to fetch relationships:', error);
      } finally {
        setLoadingRelations(false);
      }
    };

    fetchAllRelations();
  }, [characters, storyId]);

  const handleCharacterClick = (characterId: string) => {
    router.push(`/stories/${storyId}/compendium/characters/${characterId}`);
  };

  const isLoading = charactersLoading || loadingRelations;

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
        <span className="text-foreground">Relationships</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-fantasy text-3xl font-bold">
          <Network className="h-8 w-8 text-primary" />
          Character Relationships
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore the connections between characters in {story?.title || 'this story'}.
          Click on a character to view their details.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 flex gap-6">
        <div className="rounded-lg border border-border bg-card px-4 py-2">
          <span className="text-sm text-muted-foreground">Characters</span>
          <span className="ml-2 font-bold text-primary">
            {characters?.length || 0}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2">
          <span className="text-sm text-muted-foreground">Relationships</span>
          <span className="ml-2 font-bold text-primary">
            {allRelationships.length}
          </span>
        </div>
      </div>

      {/* Diagram */}
      {isLoading ? (
        <div className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-card">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Loading relationships...</p>
          </div>
        </div>
      ) : (
        <RelationshipDiagram
          characters={characters || []}
          relationships={allRelationships.map((rel: any) => ({
            id: rel.id,
            characterAId: rel.characterAId,
            characterBId: rel.characterBId,
            relationship: rel.relationship,
            strength: rel.strength || 1,
          }))}
          onCharacterClick={handleCharacterClick}
        />
      )}

      {/* Character List */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Users className="h-5 w-5 text-primary" />
          All Characters
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {characters?.map((char: any) => (
            <Link
              key={char.id}
              href={`/stories/${storyId}/compendium/characters/${char.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50"
            >
              {char.imageUrl ? (
                <img
                  src={char.imageUrl}
                  alt={char.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{char.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {char.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
