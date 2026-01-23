'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Sword, Map, Skull, Scroll, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStory } from '@/hooks/useStory';
import {
  useCharacters,
  useItems,
  useLocations,
  useMonsters,
  useLoreEntries,
} from '@/hooks/useCompendium';

export default function CompendiumPage() {
  const params = useParams();
  const storyId = params.storyId as string;

  const { data: story } = useStory(storyId);
  const { data: characters } = useCharacters(storyId);
  const { data: items } = useItems(storyId);
  const { data: locations } = useLocations(storyId);
  const { data: monsters } = useMonsters(storyId);
  const { data: lore } = useLoreEntries(storyId);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/stories/${storyId}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          &larr; Back to {story?.title || 'Story'}
        </Link>
        <h1 className="mt-4 font-fantasy text-4xl font-bold">Compendium</h1>
        <p className="mt-2 text-muted-foreground">
          Explore the world, characters, and lore of {story?.title}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Characters */}
        <CompendiumCategory
          title="Characters"
          description="Heroes, villains, and everyone in between"
          icon={<Users className="h-8 w-8" />}
          count={characters?.length || 0}
          href={`/stories/${storyId}/compendium/characters`}
          color="from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          preview={characters?.slice(0, 3).map((c) => c.name)}
        />

        {/* Items */}
        <CompendiumCategory
          title="Items"
          description="Artifacts, weapons, and treasures"
          icon={<Sword className="h-8 w-8" />}
          count={items?.length || 0}
          href={`/stories/${storyId}/compendium/items`}
          color="from-amber-500/20 to-yellow-500/20 border-amber-500/30"
          preview={items?.slice(0, 3).map((i) => i.name)}
        />

        {/* Locations */}
        <CompendiumCategory
          title="Locations"
          description="Places of wonder and mystery"
          icon={<Map className="h-8 w-8" />}
          count={locations?.length || 0}
          href={`/stories/${storyId}/compendium/locations`}
          color="from-green-500/20 to-emerald-500/20 border-green-500/30"
          preview={locations?.slice(0, 3).map((l) => l.name)}
        />

        {/* Monsters */}
        <CompendiumCategory
          title="Monsters"
          description="Creatures that lurk in shadows"
          icon={<Skull className="h-8 w-8" />}
          count={monsters?.length || 0}
          href={`/stories/${storyId}/compendium/monsters`}
          color="from-red-500/20 to-orange-500/20 border-red-500/30"
          preview={monsters?.slice(0, 3).map((m) => m.name)}
        />

        {/* Lore */}
        <CompendiumCategory
          title="Lore"
          description="History, myths, and world-building"
          icon={<Scroll className="h-8 w-8" />}
          count={lore?.length || 0}
          href={`/stories/${storyId}/compendium/lore`}
          color="from-purple-500/20 to-indigo-500/20 border-purple-500/30"
          preview={lore?.slice(0, 3).map((l) => l.title)}
        />

        {/* Relationships */}
        <CompendiumCategory
          title="Relationships"
          description="Connections between characters"
          icon={<BookOpen className="h-8 w-8" />}
          count={0}
          href={`/stories/${storyId}/compendium/relationships`}
          color="from-pink-500/20 to-rose-500/20 border-pink-500/30"
          preview={['View relationship map']}
        />
      </div>

      {/* Recent Additions */}
      <div className="mt-12">
        <h2 className="font-fantasy text-2xl font-bold">Recent Additions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Entities discovered in the latest chapters
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {characters?.slice(0, 4).map((char) => (
            <Link
              key={char.id}
              href={`/stories/${storyId}/compendium/characters/${char.id}`}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50"
            >
              <div className="flex items-center gap-3">
                {char.imageUrl ? (
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium group-hover:text-primary">
                    {char.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Chapter {char.firstAppearance}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CompendiumCategoryProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  href: string;
  color: string;
  preview?: string[];
}

function CompendiumCategory({
  title,
  description,
  icon,
  count,
  href,
  color,
  preview,
}: CompendiumCategoryProps) {
  return (
    <Link
      href={href}
      className={`group overflow-hidden rounded-xl border bg-gradient-to-br p-6 transition-all hover:scale-[1.02] hover:shadow-lg ${color}`}
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-background/50 p-3">{icon}</div>
        <span className="rounded-full bg-background/50 px-2 py-1 text-sm font-medium">
          {count}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-bold group-hover:text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {preview && preview.length > 0 && (
        <div className="mt-4 space-y-1">
          {preview.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
        <span>Explore</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
