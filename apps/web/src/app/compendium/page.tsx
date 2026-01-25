'use client';

import { useState } from 'react';
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
  Heart
} from 'lucide-react';
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { GlitchText } from '@/components/ui/glitch-text';

// Mock compendium data
const CHARACTERS = [
  {
    id: '1',
    name: 'Zara Kaine',
    story: 'The Quantum Heist',
    role: 'Protagonist',
    description: 'A brilliant hacker with a troubled past, seeking redemption through one last job.',
    traits: ['Cunning', 'Loyal', 'Haunted'],
    image: null,
    status: 'alive',
  },
  {
    id: '2',
    name: 'Marcus Chen',
    story: 'The Quantum Heist',
    role: 'Ally',
    description: 'Former military operative turned mercenary. Now 40% cybernetic after the explosion.',
    traits: ['Strong', 'Protective', 'Cynical'],
    image: null,
    status: 'alive',
  },
  {
    id: '3',
    name: 'The Architect',
    story: 'Neon Shadows',
    role: 'Antagonist',
    description: 'Mysterious figure controlling the city from the shadows. True identity unknown.',
    traits: ['Calculating', 'Ruthless', 'Enigmatic'],
    image: null,
    status: 'unknown',
  },
  {
    id: '4',
    name: 'Nova Eclipse',
    story: 'Stellar Requiem',
    role: 'Protagonist',
    description: 'Last survivor of the Eclipse colony, wielding forbidden stellar technology.',
    traits: ['Determined', 'Lonely', 'Powerful'],
    image: null,
    status: 'alive',
  },
  {
    id: '5',
    name: 'Director Vale',
    story: 'The Quantum Heist',
    role: 'Antagonist',
    description: 'Head of Nexus Corporation. Will stop at nothing to protect corporate secrets.',
    traits: ['Ambitious', 'Cold', 'Intelligent'],
    image: null,
    status: 'alive',
  },
  {
    id: '6',
    name: 'Iris-7',
    story: 'Echoes of Tomorrow',
    role: 'Ally',
    description: 'An ancient AI awakened from centuries of dormancy, seeking purpose.',
    traits: ['Curious', 'Logical', 'Evolving'],
    image: null,
    status: 'active',
  },
];

const LOCATIONS = [
  {
    id: '1',
    name: 'Neo Tokyo Underground',
    story: 'The Quantum Heist',
    type: 'City',
    description: 'A sprawling network of tunnels beneath the megacity, home to hackers and outcasts.',
    danger: 'medium',
  },
  {
    id: '2',
    name: 'The Spire',
    story: 'Neon Shadows',
    type: 'Building',
    description: 'Kilometer-tall corporate headquarters dominating the city skyline.',
    danger: 'high',
  },
  {
    id: '3',
    name: 'Void Station Alpha',
    story: 'Stellar Requiem',
    type: 'Space Station',
    description: 'Abandoned research station at the edge of known space. Something awakened there.',
    danger: 'extreme',
  },
  {
    id: '4',
    name: 'Memory Gardens',
    story: 'Echoes of Tomorrow',
    type: 'Virtual',
    description: 'Digital realm where consciousness can be stored and memories relived.',
    danger: 'low',
  },
];

const ITEMS = [
  {
    id: '1',
    name: 'Quantum Decoder',
    story: 'The Quantum Heist',
    type: 'Tech',
    description: 'Device capable of cracking any encryption by existing in multiple quantum states.',
    rarity: 'Legendary',
  },
  {
    id: '2',
    name: 'Neural Blade',
    story: 'Neon Shadows',
    type: 'Weapon',
    description: 'Monomolecular edge weapon that interfaces directly with user neural systems.',
    rarity: 'Epic',
  },
  {
    id: '3',
    name: 'Stellar Core Fragment',
    story: 'Stellar Requiem',
    type: 'Artifact',
    description: 'Piece of compressed star matter. Source of immense and unstable power.',
    rarity: 'Mythic',
  },
  {
    id: '4',
    name: 'Memory Shard',
    story: 'Echoes of Tomorrow',
    type: 'Artifact',
    description: 'Crystallized fragment of ancient AI consciousness.',
    rarity: 'Rare',
  },
];

const CATEGORIES = [
  { id: 'characters', label: 'Characters', icon: Users, count: 48 },
  { id: 'locations', label: 'Locations', icon: MapPin, count: 24 },
  { id: 'items', label: 'Items & Artifacts', icon: Sparkles, count: 36 },
  { id: 'factions', label: 'Factions', icon: Crown, count: 12 },
];

export default function CompendiumPage() {
  const [activeCategory, setActiveCategory] = useState('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getDangerColor = (danger: string) => {
    switch (danger) {
      case 'extreme':
        return 'text-red-400 bg-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/20';
      case 'medium':
        return 'text-amber-400 bg-amber-400/20';
      case 'low':
        return 'text-green-400 bg-green-400/20';
      default:
        return 'text-muted-foreground bg-muted';
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
          <option value="all">All Stories</option>
          <option value="quantum">The Quantum Heist</option>
          <option value="neon">Neon Shadows</option>
          <option value="stellar">Stellar Requiem</option>
          <option value="echoes">Echoes of Tomorrow</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATEGORIES.map((category) => {
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
              <p className="text-sm opacity-70">{category.count} entries</p>
            </button>
          );
        })}
      </div>

      {/* Characters Grid */}
      {activeCategory === 'characters' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CHARACTERS.map((character) => (
            <CyberCard key={character.id} variant="glass" className="overflow-hidden">
              <div className="flex h-24 items-center justify-center bg-gradient-to-br from-neon-blue/20 to-neon-purple/20">
                <Users className="h-12 w-12 text-neon-blue/50" />
              </div>
              <CyberCardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{character.name}</h3>
                    <p className="text-sm text-neon-blue">{character.story}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(character.status)}`}>
                    {character.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {character.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {character.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded border border-neon-blue/30 bg-neon-blue/10 px-2 py-0.5 text-xs text-neon-blue"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{character.role}</span>
                  <Link 
                    href={`/compendium/characters/${character.id}`}
                    className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
                  >
                    View Details <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </CyberCardContent>
            </CyberCard>
          ))}
        </div>
      )}

      {/* Locations Grid */}
      {activeCategory === 'locations' && (
        <div className="grid gap-4 md:grid-cols-2">
          {LOCATIONS.map((location) => (
            <CyberCard key={location.id} variant="glass" className="overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                <MapPin className="h-12 w-12 text-neon-purple/50" />
              </div>
              <CyberCardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <p className="text-sm text-neon-purple">{location.story}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${getDangerColor(location.danger)}`}>
                    {location.danger} danger
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {location.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded border border-neon-purple/30 bg-neon-purple/10 px-2 py-0.5 text-xs text-neon-purple">
                    {location.type}
                  </span>
                  <Link 
                    href={`/compendium/locations/${location.id}`}
                    className="flex items-center gap-1 text-xs text-neon-blue hover:underline"
                  >
                    Explore <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </CyberCardContent>
            </CyberCard>
          ))}
        </div>
      )}

      {/* Items Grid */}
      {activeCategory === 'items' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <CyberCard key={item.id} variant="glass" className="overflow-hidden">
              <div className="flex h-24 items-center justify-center bg-gradient-to-br from-amber-500/20 to-neon-purple/20">
                <Sparkles className="h-10 w-10 text-amber-400/50" />
              </div>
              <CyberCardContent className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className={`rounded border px-2 py-0.5 text-xs ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>
                <p className="text-xs text-neon-blue">{item.story}</p>
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
          ))}
        </div>
      )}

      {/* Factions */}
      {activeCategory === 'factions' && (
        <div className="grid gap-4 md:grid-cols-2">
          <CyberCard variant="glass" className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-500/20 p-3">
                <Crown className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Nexus Corporation</h3>
                <p className="text-sm text-red-400">The Quantum Heist</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Megacorporation controlling 60% of global data infrastructure. Known for ruthless business practices and shadowy experiments.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">Antagonist</span>
              <span className="rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">12 members</span>
            </div>
          </CyberCard>
          <CyberCard variant="glass" className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-neon-blue/20 p-3">
                <Swords className="h-8 w-8 text-neon-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">The Syndicate</h3>
                <p className="text-sm text-neon-blue">Stellar Requiem</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Interstellar criminal organization with fingers in every colony. Honor among thieves is their only code.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-400">Neutral</span>
              <span className="rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">8 members</span>
            </div>
          </CyberCard>
        </div>
      )}
    </div>
  );
}
