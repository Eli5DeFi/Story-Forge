'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Sword,
  MapPin,
  Skull,
  Scroll,
  Search,
  Star,
  Shield,
  Zap,
  Heart,
  Crown,
  Sparkles,
} from 'lucide-react';
import { CyberCard, CyberCardHeader, CyberCardContent } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { GlitchText } from '@/components/ui/glitch-text';
import { CyberProgress } from '@/components/ui/data-panel';

// Mock compendium data
const CHARACTERS = [
  {
    id: 'lyra-shadowmend',
    name: 'Lyra Shadowmend',
    title: 'The Memory Thief',
    story: 'Echoes of Eternity',
    type: 'Protagonist',
    rarity: 'Legendary',
    description: 'A young woman with the forbidden ability to rewrite memories. Driven by her love for her dying sister, she walks a dangerous path between salvation and destruction.',
    stats: { power: 85, wisdom: 92, charisma: 78, luck: 65 },
    traits: ['Memory Manipulation', 'Shadow Step', 'Empathic Link'],
    image: null,
  },
  {
    id: 'kael-ironforge',
    name: 'Kael Ironforge',
    title: 'The Reluctant Guardian',
    story: 'Echoes of Eternity',
    type: 'Ally',
    rarity: 'Epic',
    description: 'A former Memory Keeper who abandoned his order after witnessing their corruption. Now serves as Lyra\'s protector and mentor.',
    stats: { power: 88, wisdom: 75, charisma: 60, luck: 45 },
    traits: ['Memory Shield', 'Combat Mastery', 'Ancient Knowledge'],
    image: null,
  },
  {
    id: 'marcus-thorne',
    name: 'Marcus Thorne',
    title: 'The Failed Apprentice',
    story: 'The Last Grimoire',
    type: 'Protagonist',
    rarity: 'Epic',
    description: 'Cast out from the Mage Academy for his unorthodox methods, Marcus seeks the forbidden grimoire to prove his worth—and perhaps save a dying world.',
    stats: { power: 70, wisdom: 88, charisma: 55, luck: 78 },
    traits: ['Wild Magic', 'Grimoire Bond', 'Resilient Spirit'],
    image: null,
  },
  {
    id: 'zara-nexus',
    name: 'Zara-7 "Nexus"',
    title: 'The Ghost in the Machine',
    story: 'Neon Dynasty',
    type: 'Protagonist',
    rarity: 'Legendary',
    description: 'A street-level hacker who accidentally absorbed the consciousness of a dead megacorp CEO. Now hunted by corporations and criminals alike.',
    stats: { power: 65, wisdom: 95, charisma: 72, luck: 88 },
    traits: ['Neural Hacking', 'Dual Consciousness', 'System Infiltration'],
    image: null,
  },
];

const ITEMS = [
  {
    id: 'memory-shard',
    name: 'Shard of Forgotten Dreams',
    type: 'Artifact',
    rarity: 'Legendary',
    story: 'Echoes of Eternity',
    description: 'A crystallized fragment of pure memory, capable of storing entire lifetimes within its facets.',
    effects: ['Stores up to 100 years of memories', 'Can be used to restore lost memories', 'Dangerous if shattered'],
  },
  {
    id: 'grimoire-shadows',
    name: 'The Grimoire of Shadows',
    type: 'Spellbook',
    rarity: 'Legendary',
    story: 'The Last Grimoire',
    description: 'The last true spellbook, containing magic thought lost to the ages. Its pages are said to be alive.',
    effects: ['Contains 777 forbidden spells', 'Bonds with its wielder', 'Whispers secrets of the void'],
  },
  {
    id: 'neural-spike',
    name: 'Black ICE Breaker',
    type: 'Tech',
    rarity: 'Epic',
    story: 'Neon Dynasty',
    description: 'Military-grade hacking hardware capable of penetrating even the most secure corporate networks.',
    effects: ['+50% hack success rate', 'Bypasses tier-3 firewalls', 'Single use before detection'],
  },
];

const LOCATIONS = [
  {
    id: 'memory-vault',
    name: 'The Memory Vault',
    type: 'Sacred Site',
    story: 'Echoes of Eternity',
    description: 'An ancient repository where the Memory Keepers store the most precious and dangerous memories of humanity.',
    features: ['Infinite storage chambers', 'Temporal stasis fields', 'Guarded by memory golems'],
  },
  {
    id: 'forgotten-library',
    name: 'The Forgotten Library',
    type: 'Ruins',
    story: 'The Last Grimoire',
    description: 'A vast underground library that exists between dimensions, containing knowledge erased from reality itself.',
    features: ['Non-Euclidean architecture', 'Living books', 'Time flows differently'],
  },
  {
    id: 'undercity',
    name: 'Neo-Tokyo Undercity',
    type: 'Urban Zone',
    story: 'Neon Dynasty',
    description: 'The lawless underground beneath the gleaming corporate towers, where hackers, rebels, and the desperate survive.',
    features: ['Black markets', 'Rogue AI territories', 'Corporate dead zones'],
  },
];

const MONSTERS = [
  {
    id: 'memory-wraith',
    name: 'Memory Wraith',
    type: 'Spectral',
    rarity: 'Rare',
    story: 'Echoes of Eternity',
    description: 'Beings formed from corrupted or abandoned memories, they feed on the recollections of the living.',
    stats: { danger: 75, speed: 90, cunning: 60 },
  },
  {
    id: 'void-sentinel',
    name: 'Void Sentinel',
    type: 'Construct',
    rarity: 'Epic',
    story: 'The Last Grimoire',
    description: 'Ancient guardians created to protect forbidden knowledge. They exist partially outside of reality.',
    stats: { danger: 95, speed: 40, cunning: 85 },
  },
];

type TabType = 'characters' | 'items' | 'locations' | 'monsters';

const rarityColors: Record<string, string> = {
  Common: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
  Uncommon: 'text-green-400 border-green-400/30 bg-green-400/10',
  Rare: 'text-neon-blue border-neon-blue/30 bg-neon-blue/10',
  Epic: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  Legendary: 'text-gold-500 border-gold-500/30 bg-gold-500/10',
};

export default function CompendiumPage() {
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'characters', label: 'Characters', icon: <Users className="h-4 w-4" />, count: CHARACTERS.length },
    { id: 'items', label: 'Items', icon: <Sword className="h-4 w-4" />, count: ITEMS.length },
    { id: 'locations', label: 'Locations', icon: <MapPin className="h-4 w-4" />, count: LOCATIONS.length },
    { id: 'monsters', label: 'Monsters', icon: <Skull className="h-4 w-4" />, count: MONSTERS.length },
  ];

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <GlitchText
            text="World Compendium"
            className="font-fantasy text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-blue to-cyber-500"
          />
          <p className="mt-4 text-muted-foreground text-lg">
            Explore characters, items, locations, and creatures from all stories
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search the compendium..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-void-900/50 border border-neon-blue/30 focus:border-neon-blue/60 focus:outline-none focus:ring-1 focus:ring-neon-blue/30 transition-all"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-1 p-1 rounded-lg bg-void-800/50 border border-neon-blue/20 flex-wrap justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-neon-blue/20 text-neon-blue shadow-neon-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className="text-xs opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="grid gap-6 md:grid-cols-2">
            {CHARACTERS.map((character, index) => (
              <CyberCard
                key={character.id}
                variant="default"
                corners
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center border border-neon-blue/30">
                    <span className="text-3xl font-fantasy font-bold text-white/30">
                      {character.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{character.name}</h3>
                        <p className="text-sm text-neon-blue">{character.title}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${rarityColors[character.rarity]}`}>
                        {character.rarity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {character.description}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      From: <span className="text-neon-purple">{character.story}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-neon-blue/10">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-1 text-red-400 mb-1">
                        <Zap className="h-3 w-3" />
                        <span>PWR</span>
                      </div>
                      <CyberProgress value={character.stats.power} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-neon-blue mb-1">
                        <Scroll className="h-3 w-3" />
                        <span>WIS</span>
                      </div>
                      <CyberProgress value={character.stats.wisdom} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-neon-purple mb-1">
                        <Heart className="h-3 w-3" />
                        <span>CHA</span>
                      </div>
                      <CyberProgress value={character.stats.charisma} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gold-500 mb-1">
                        <Star className="h-3 w-3" />
                        <span>LCK</span>
                      </div>
                      <CyberProgress value={character.stats.luck} />
                    </div>
                  </div>
                </div>

                {/* Traits */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {character.traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-0.5 rounded text-xs bg-cyber-500/20 text-cyber-400 border border-cyber-500/30"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </CyberCard>
            ))}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((item, index) => (
              <CyberCard
                key={item.id}
                variant="default"
                corners
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-500/30 to-neon-purple/30 flex items-center justify-center border border-gold-500/30">
                    <Sword className="h-6 w-6 text-gold-500" />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs border ${rarityColors[item.rarity]}`}>
                    {item.rarity}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-sm text-neon-blue">{item.type}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  From: <span className="text-neon-purple">{item.story}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-neon-blue/10">
                  <p className="text-xs text-muted-foreground mb-2">Effects:</p>
                  <ul className="space-y-1">
                    {item.effects.map((effect, i) => (
                      <li key={i} className="text-xs flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-gold-500" />
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
              </CyberCard>
            ))}
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((location, index) => (
              <CyberCard
                key={location.id}
                variant="default"
                corners
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-blue/30 to-cyber-500/30 flex items-center justify-center border border-neon-blue/30">
                    <MapPin className="h-6 w-6 text-neon-blue" />
                  </div>
                  <span className="px-2 py-1 rounded text-xs border border-neon-purple/30 bg-neon-purple/10 text-neon-purple">
                    {location.type}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{location.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{location.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  From: <span className="text-neon-purple">{location.story}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-neon-blue/10">
                  <p className="text-xs text-muted-foreground mb-2">Notable Features:</p>
                  <ul className="space-y-1">
                    {location.features.map((feature, i) => (
                      <li key={i} className="text-xs flex items-center gap-2">
                        <Star className="h-3 w-3 text-neon-blue" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CyberCard>
            ))}
          </div>
        )}

        {/* Monsters Tab */}
        {activeTab === 'monsters' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MONSTERS.map((monster, index) => (
              <CyberCard
                key={monster.id}
                variant="default"
                corners
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/30 to-neon-purple/30 flex items-center justify-center border border-red-500/30">
                    <Skull className="h-6 w-6 text-red-400" />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs border ${rarityColors[monster.rarity]}`}>
                    {monster.rarity}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{monster.name}</h3>
                <p className="text-sm text-red-400">{monster.type}</p>
                <p className="mt-2 text-sm text-muted-foreground">{monster.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  From: <span className="text-neon-purple">{monster.story}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-neon-blue/10">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-1 text-red-400 mb-1">
                        <Skull className="h-3 w-3" />
                        <span>Danger</span>
                      </div>
                      <CyberProgress value={monster.stats.danger} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-neon-blue mb-1">
                        <Zap className="h-3 w-3" />
                        <span>Speed</span>
                      </div>
                      <CyberProgress value={monster.stats.speed} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-neon-purple mb-1">
                        <Shield className="h-3 w-3" />
                        <span>Cunning</span>
                      </div>
                      <CyberProgress value={monster.stats.cunning} />
                    </div>
                  </div>
                </div>
              </CyberCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
