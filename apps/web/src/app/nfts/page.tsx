'use client';

import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { CyberCard, CyberCardContent } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { GlitchText } from '@/components/ui/glitch-text';

// Mock NFT data
const NFTS = [
  {
    id: '1',
    name: 'Zara Kaine - Genesis',
    story: 'The Quantum Heist',
    chapter: 1,
    type: 'Character',
    rarity: 'Legendary',
    image: null,
    price: 0.5,
    lastSale: 0.45,
    likes: 234,
    views: 1205,
    owner: '0x1234...5678',
    mintedAt: '2 days ago',
  },
  {
    id: '2',
    name: 'Neo Tokyo Skyline',
    story: 'The Quantum Heist',
    chapter: 3,
    type: 'Scene',
    rarity: 'Epic',
    image: null,
    price: 0.25,
    lastSale: 0.22,
    likes: 156,
    views: 892,
    owner: '0xabcd...efgh',
    mintedAt: '1 week ago',
  },
  {
    id: '3',
    name: 'The Architects Mask',
    story: 'Neon Shadows',
    chapter: 8,
    type: 'Item',
    rarity: 'Mythic',
    image: null,
    price: 1.2,
    lastSale: 0.95,
    likes: 412,
    views: 2341,
    owner: '0x9876...5432',
    mintedAt: '3 days ago',
  },
  {
    id: '4',
    name: 'Stellar Core Fragment',
    story: 'Stellar Requiem',
    chapter: 5,
    type: 'Artifact',
    rarity: 'Mythic',
    image: null,
    price: 2.5,
    lastSale: 2.1,
    likes: 567,
    views: 3456,
    owner: '0xfedc...ba98',
    mintedAt: '5 hours ago',
  },
  {
    id: '5',
    name: 'Marcus Chen - Reborn',
    story: 'The Quantum Heist',
    chapter: 6,
    type: 'Character',
    rarity: 'Epic',
    image: null,
    price: 0.35,
    lastSale: 0.30,
    likes: 189,
    views: 756,
    owner: '0x2468...1357',
    mintedAt: '4 days ago',
  },
  {
    id: '6',
    name: 'The Betrayal',
    story: 'The Quantum Heist',
    chapter: 7,
    type: 'Moment',
    rarity: 'Legendary',
    image: null,
    price: 0.8,
    lastSale: null,
    likes: 78,
    views: 234,
    owner: 'Unclaimed',
    mintedAt: 'Just now',
  },
  {
    id: '7',
    name: 'Void Station Alpha',
    story: 'Stellar Requiem',
    chapter: 2,
    type: 'Scene',
    rarity: 'Rare',
    image: null,
    price: 0.15,
    lastSale: 0.12,
    likes: 98,
    views: 445,
    owner: '0x1357...2468',
    mintedAt: '2 weeks ago',
  },
  {
    id: '8',
    name: 'Neural Blade',
    story: 'Neon Shadows',
    chapter: 4,
    type: 'Item',
    rarity: 'Epic',
    image: null,
    price: 0.4,
    lastSale: 0.38,
    likes: 203,
    views: 1023,
    owner: '0xaaaa...bbbb',
    mintedAt: '6 days ago',
  },
];

const COLLECTIONS = [
  { id: 'all', name: 'All NFTs', count: 156 },
  { id: 'quantum', name: 'The Quantum Heist', count: 48 },
  { id: 'neon', name: 'Neon Shadows', count: 36 },
  { id: 'stellar', name: 'Stellar Requiem', count: 42 },
  { id: 'echoes', name: 'Echoes of Tomorrow', count: 30 },
];

const TYPES = ['All', 'Character', 'Scene', 'Item', 'Moment', 'Artifact'];
const RARITIES = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];

export default function NFTsPage() {
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  const getRarityColor = (rarity: string) => {
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

  const getRarityBg = (rarity: string) => {
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
        return 'bg-gradient-to-br from-gray-500/30 to-gray-600/30';
    }
  };

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
              <p className="text-sm text-muted-foreground">Total NFTs</p>
              <p className="text-xl font-bold">156</p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-purple/20 p-2">
              <Coins className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Floor Price</p>
              <p className="text-xl font-bold">0.12 ETH</p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volume (24h)</p>
              <p className="text-xl font-bold">12.5 ETH</p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Heart className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Owners</p>
              <p className="text-xl font-bold">89</p>
            </div>
          </div>
        </CyberCard>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {COLLECTIONS.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                selectedCollection === collection.id
                  ? 'bg-neon-blue text-void-950'
                  : 'bg-void-900 text-muted-foreground hover:bg-void-800'
              }`}
            >
              {collection.name} ({collection.count})
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

      {/* NFT Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        {NFTS.map((nft) => (
          <CyberCard 
            key={nft.id} 
            variant="glass" 
            className="group overflow-hidden transition-all hover:border-neon-blue/50"
          >
            {/* Image */}
            <div className={`relative aspect-square ${getRarityBg(nft.rarity)}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-white/20" />
              </div>
              {/* Rarity Badge */}
              <div className="absolute left-2 top-2">
                <span className={`rounded border px-2 py-0.5 text-xs font-medium ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </span>
              </div>
              {/* Quick Actions */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-full bg-void-950/80 p-1.5 text-white hover:bg-void-900">
                  <Heart className="h-4 w-4" />
                </button>
                <button className="rounded-full bg-void-950/80 p-1.5 text-white hover:bg-void-900">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              {/* Type Badge */}
              <div className="absolute bottom-2 left-2">
                <span className="rounded bg-void-950/80 px-2 py-0.5 text-xs text-white">
                  {nft.type}
                </span>
              </div>
            </div>

            {/* Details */}
            <CyberCardContent className="p-3">
              <h3 className="font-semibold text-sm truncate">{nft.name}</h3>
              <p className="text-xs text-neon-blue truncate">{nft.story} • Ch.{nft.chapter}</p>
              
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-bold text-neon-blue">{nft.price} ETH</p>
                </div>
                {nft.lastSale && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Last</p>
                    <p className="text-sm text-muted-foreground">{nft.lastSale} ETH</p>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {nft.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {nft.views}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {nft.mintedAt}
                </span>
              </div>

              <CyberButton size="sm" className="mt-3 w-full">
                {nft.owner === 'Unclaimed' ? 'Mint Now' : 'Buy'}
              </CyberButton>
            </CyberCardContent>
          </CyberCard>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <CyberButton variant="outline">
          Load More NFTs
        </CyberButton>
      </div>
    </div>
  );
}
