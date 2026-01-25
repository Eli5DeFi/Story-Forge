'use client';

import { useState } from 'react';
import {
  Sparkles,
  Filter,
  Grid3X3,
  LayoutGrid,
  Clock,
  ExternalLink,
  Heart,
  Share2,
  Wallet,
  TrendingUp,
  Award,
  Gem,
} from 'lucide-react';
import { CyberCard } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { GlitchText } from '@/components/ui/glitch-text';

// Mock NFT data
const MOCK_NFTS = [
  {
    id: 'nft-001',
    name: 'Lyra\'s Awakening',
    collection: 'Echoes of Eternity',
    chapter: 1,
    type: 'Moment',
    rarity: 'Legendary',
    description: 'The pivotal moment when Lyra first discovers her ability to rewrite memories.',
    owner: '0x7a3...f29d',
    mintedAt: '2024-01-15',
    edition: '1 of 1',
    price: 2.5,
    lastSale: 1.8,
    likes: 342,
    views: 1205,
    attributes: [
      { trait: 'Scene', value: 'Memory Awakening' },
      { trait: 'Character', value: 'Lyra Shadowmend' },
      { trait: 'Emotion', value: 'Revelation' },
      { trait: 'Magic Type', value: 'Memory' },
    ],
  },
  {
    id: 'nft-002',
    name: 'The Grimoire Speaks',
    collection: 'The Last Grimoire',
    chapter: 1,
    type: 'Moment',
    rarity: 'Epic',
    description: 'Marcus opens the forbidden grimoire and hears its whispers for the first time.',
    owner: '0x3b8...a12c',
    mintedAt: '2024-01-18',
    edition: '1 of 3',
    price: 1.2,
    lastSale: 0.9,
    likes: 218,
    views: 876,
    attributes: [
      { trait: 'Scene', value: 'First Contact' },
      { trait: 'Character', value: 'Marcus Thorne' },
      { trait: 'Emotion', value: 'Fear & Wonder' },
      { trait: 'Magic Type', value: 'Dark' },
    ],
  },
  {
    id: 'nft-003',
    name: 'Neural Dive',
    collection: 'Neon Dynasty',
    chapter: 2,
    type: 'Moment',
    rarity: 'Rare',
    description: 'Zara jacks into the corporate mainframe, risking everything for the truth.',
    owner: '0x9f2...e45b',
    mintedAt: '2024-01-20',
    edition: '1 of 10',
    price: 0.5,
    lastSale: 0.35,
    likes: 156,
    views: 543,
    attributes: [
      { trait: 'Scene', value: 'Corporate Hack' },
      { trait: 'Character', value: 'Zara-7 Nexus' },
      { trait: 'Emotion', value: 'Determination' },
      { trait: 'Tech Level', value: 'Military' },
    ],
  },
  {
    id: 'nft-004',
    name: 'Memory Wraith Encounter',
    collection: 'Echoes of Eternity',
    chapter: 1,
    type: 'Creature',
    rarity: 'Epic',
    description: 'The first Memory Wraith emerges from the corrupted memories of the fallen city.',
    owner: '0x2c7...b98a',
    mintedAt: '2024-01-22',
    edition: '1 of 5',
    price: 0.8,
    lastSale: 0.6,
    likes: 189,
    views: 654,
    attributes: [
      { trait: 'Creature', value: 'Memory Wraith' },
      { trait: 'Danger Level', value: 'High' },
      { trait: 'Origin', value: 'Corrupted Memories' },
      { trait: 'Element', value: 'Shadow' },
    ],
  },
  {
    id: 'nft-005',
    name: 'The Forgotten Library',
    collection: 'The Last Grimoire',
    chapter: 2,
    type: 'Location',
    rarity: 'Legendary',
    description: 'A rare glimpse of the interdimensional library where forbidden knowledge sleeps.',
    owner: '0x5d1...c73f',
    mintedAt: '2024-01-25',
    edition: '1 of 1',
    price: 3.2,
    lastSale: null,
    likes: 421,
    views: 1567,
    attributes: [
      { trait: 'Location', value: 'Forgotten Library' },
      { trait: 'Dimension', value: 'Between' },
      { trait: 'Danger', value: 'Extreme' },
      { trait: 'Knowledge', value: 'Forbidden' },
    ],
  },
  {
    id: 'nft-006',
    name: 'Kael\'s Last Stand',
    collection: 'Echoes of Eternity',
    chapter: 1,
    type: 'Moment',
    rarity: 'Rare',
    description: 'The guardian Kael protects Lyra from the Memory Keepers who hunt them.',
    owner: '0x8e4...d21e',
    mintedAt: '2024-01-26',
    edition: '1 of 7',
    price: 0.45,
    lastSale: 0.3,
    likes: 134,
    views: 421,
    attributes: [
      { trait: 'Scene', value: 'Battle' },
      { trait: 'Character', value: 'Kael Ironforge' },
      { trait: 'Emotion', value: 'Sacrifice' },
      { trait: 'Combat Style', value: 'Defense' },
    ],
  },
];

const rarityColors: Record<string, string> = {
  Common: 'from-gray-500 to-gray-600',
  Uncommon: 'from-green-500 to-green-600',
  Rare: 'from-neon-blue to-blue-600',
  Epic: 'from-neon-purple to-purple-600',
  Legendary: 'from-gold-500 to-amber-600',
};

const rarityBorderColors: Record<string, string> = {
  Common: 'border-gray-500/30',
  Uncommon: 'border-green-500/30',
  Rare: 'border-neon-blue/30',
  Epic: 'border-neon-purple/30',
  Legendary: 'border-gold-500/30',
};

export default function NFTsPage() {
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  const rarities = ['All', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
  const types = ['All', 'Moment', 'Creature', 'Location', 'Item'];

  const filteredNFTs = MOCK_NFTS.filter(nft => {
    if (selectedRarity !== 'All' && nft.rarity !== selectedRarity) return false;
    if (selectedType !== 'All' && nft.type !== selectedType) return false;
    return true;
  });

  const totalValue = MOCK_NFTS.reduce((sum, nft) => sum + nft.price, 0);

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <GlitchText
            text="Story NFT Gallery"
            className="font-fantasy text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-neon-purple to-neon-blue"
          />
          <p className="mt-4 text-muted-foreground text-lg">
            Collect unique moments, characters, and artifacts from our stories
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <CyberCard variant="glass" className="text-center py-4">
            <Gem className="h-6 w-6 mx-auto mb-2 text-neon-purple" />
            <div className="text-2xl font-bold text-neon-purple">{MOCK_NFTS.length}</div>
            <div className="text-xs text-muted-foreground">Total NFTs</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-gold-500" />
            <div className="text-2xl font-bold text-gold-500">{totalValue.toFixed(1)} ETH</div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Award className="h-6 w-6 mx-auto mb-2 text-neon-blue" />
            <div className="text-2xl font-bold text-neon-blue">2</div>
            <div className="text-xs text-muted-foreground">Legendary Items</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Wallet className="h-6 w-6 mx-auto mb-2 text-cyber-500" />
            <div className="text-2xl font-bold text-cyber-500">47</div>
            <div className="text-xs text-muted-foreground">Unique Holders</div>
          </CyberCard>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neon-blue" />
            <span className="text-sm text-muted-foreground">Rarity:</span>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-void-900/50 border border-neon-blue/30 text-sm focus:outline-none focus:border-neon-blue/60"
            >
              {rarities.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-void-900/50 border border-neon-blue/30 text-sm focus:outline-none focus:border-neon-blue/60"
            >
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neon-blue/20 text-neon-blue'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('large')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'large'
                  ? 'bg-neon-blue/20 text-neon-blue'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* NFT Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredNFTs.map((nft, index) => (
            <CyberCard
              key={nft.id}
              variant="default"
              className={`group cursor-pointer animate-slide-up overflow-hidden ${rarityBorderColors[nft.rarity]}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* NFT Image Placeholder */}
              <div className={`aspect-square -mx-6 -mt-6 mb-4 bg-gradient-to-br ${rarityColors[nft.rarity]} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-cyber-grid opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-16 w-16 text-white/30 group-hover:text-white/50 transition-colors" />
                </div>
                {/* Rarity Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold bg-black/50 backdrop-blur-sm ${
                    nft.rarity === 'Legendary' ? 'text-gold-500' :
                    nft.rarity === 'Epic' ? 'text-neon-purple' :
                    nft.rarity === 'Rare' ? 'text-neon-blue' : 'text-white'
                  }`}>
                    {nft.rarity}
                  </span>
                </div>
                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded text-xs bg-black/50 backdrop-blur-sm text-white">
                    {nft.type}
                  </span>
                </div>
                {/* Actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white hover:text-red-400 transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white hover:text-neon-blue transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div>
                <p className="text-xs text-neon-blue mb-1">{nft.collection}</p>
                <h3 className="font-semibold group-hover:text-neon-blue transition-colors truncate">
                  {nft.name}
                </h3>
                {viewMode === 'large' && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {nft.description}
                  </p>
                )}
              </div>

              {/* Price & Stats */}
              <div className="mt-3 pt-3 border-t border-neon-blue/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-bold text-gold-500">{nft.price} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{nft.edition}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {nft.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {viewMode === 'large' && (
                <>
                  {/* Attributes */}
                  <div className="mt-3 pt-3 border-t border-neon-blue/10">
                    <p className="text-xs text-muted-foreground mb-2">Attributes</p>
                    <div className="grid grid-cols-2 gap-2">
                      {nft.attributes.slice(0, 4).map((attr) => (
                        <div
                          key={attr.trait}
                          className="px-2 py-1 rounded bg-neon-blue/10 border border-neon-blue/20 text-xs"
                        >
                          <p className="text-muted-foreground">{attr.trait}</p>
                          <p className="font-medium truncate">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buy Button */}
                  <div className="mt-4">
                    <CyberButton variant="gold" className="w-full">
                      <Wallet className="h-4 w-4 mr-2" />
                      Buy Now
                    </CyberButton>
                  </div>
                </>
              )}
            </CyberCard>
          ))}
        </div>

        {filteredNFTs.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No NFTs found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* How to Mint Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How NFT Minting Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <CyberCard variant="glass" className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neon-blue/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-neon-blue">1</span>
              </div>
              <h3 className="font-semibold mb-2">Win Predictions</h3>
              <p className="text-sm text-muted-foreground">
                Place bets on story outcomes. Winners get priority minting access for chapter NFTs.
              </p>
            </CyberCard>
            <CyberCard variant="glass" className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neon-purple/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-neon-purple">2</span>
              </div>
              <h3 className="font-semibold mb-2">Mint Moments</h3>
              <p className="text-sm text-muted-foreground">
                Key story moments, characters, and artifacts become mintable NFTs after each chapter.
              </p>
            </CyberCard>
            <CyberCard variant="glass" className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-gold-500">3</span>
              </div>
              <h3 className="font-semibold mb-2">Trade & Collect</h3>
              <p className="text-sm text-muted-foreground">
                Build your collection and trade on secondary markets. Rare items appreciate in value.
              </p>
            </CyberCard>
          </div>
        </div>
      </div>
    </div>
  );
}
