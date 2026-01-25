'use client';

import { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  TrendingDown,
  Flame,
  Target,
  Coins,
  Users,
  Crown,
  Zap,
  Star,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/cyber-card';
import { GlitchText } from '@/components/ui/glitch-text';

// Mock leaderboard data
const TOP_PREDICTORS = [
  {
    rank: 1,
    change: 0,
    address: '0x7a23...f91b',
    username: 'QuantumOracle',
    avatar: null,
    predictions: 156,
    winRate: 78.2,
    earnings: 12450,
    streak: 8,
    badges: ['🔮', '🏆', '💎'],
  },
  {
    rank: 2,
    change: 2,
    address: '0x3b45...d82c',
    username: 'NeonSeer',
    avatar: null,
    predictions: 203,
    winRate: 72.4,
    earnings: 9820,
    streak: 5,
    badges: ['🎯', '🔥'],
  },
  {
    rank: 3,
    change: -1,
    address: '0x9f12...a73e',
    username: 'StoryWhisperer',
    avatar: null,
    predictions: 98,
    winRate: 75.5,
    earnings: 8340,
    streak: 12,
    badges: ['⚡', '🏆'],
  },
  {
    rank: 4,
    change: 1,
    address: '0x2d78...b45f',
    username: 'CyberProphet',
    avatar: null,
    predictions: 187,
    winRate: 68.9,
    earnings: 7650,
    streak: 3,
    badges: ['🎲'],
  },
  {
    rank: 5,
    change: -2,
    address: '0x6c90...e12d',
    username: 'VoidReader',
    avatar: null,
    predictions: 145,
    winRate: 70.3,
    earnings: 6890,
    streak: 0,
    badges: ['📚'],
  },
  {
    rank: 6,
    change: 3,
    address: '0x1a34...c78g',
    username: 'PlotTwister',
    avatar: null,
    predictions: 234,
    winRate: 64.1,
    earnings: 5420,
    streak: 4,
    badges: ['🌀'],
  },
  {
    rank: 7,
    change: 0,
    address: '0x8e56...f90h',
    username: 'NarrativeNinja',
    avatar: null,
    predictions: 167,
    winRate: 66.5,
    earnings: 4980,
    streak: 2,
    badges: ['🥷'],
  },
  {
    rank: 8,
    change: -1,
    address: '0x4b23...a12i',
    username: 'ChapterChaser',
    avatar: null,
    predictions: 89,
    winRate: 71.9,
    earnings: 4560,
    streak: 6,
    badges: ['📖', '🔥'],
  },
  {
    rank: 9,
    change: 5,
    address: '0x5d67...b34j',
    username: 'FateFinder',
    avatar: null,
    predictions: 112,
    winRate: 67.8,
    earnings: 4120,
    streak: 7,
    badges: ['🎰'],
  },
  {
    rank: 10,
    change: -3,
    address: '0x0f89...c56k',
    username: 'TwilightTrader',
    avatar: null,
    predictions: 178,
    winRate: 62.4,
    earnings: 3890,
    streak: 1,
    badges: ['🌙'],
  },
];

const TOP_COLLECTORS = [
  { rank: 1, username: 'ArtifactKing', nftsOwned: 47, totalValue: 28.5, rarest: 'Mythic' },
  { rank: 2, username: 'DigitalHoarder', nftsOwned: 38, totalValue: 22.3, rarest: 'Legendary' },
  { rank: 3, username: 'CryptoCollector', nftsOwned: 35, totalValue: 19.8, rarest: 'Legendary' },
  { rank: 4, username: 'NFTNinja', nftsOwned: 29, totalValue: 15.2, rarest: 'Epic' },
  { rank: 5, username: 'TokenTitan', nftsOwned: 24, totalValue: 12.7, rarest: 'Epic' },
];

const WEEKLY_STATS = [
  { label: 'Total Predictions', value: '2,847', change: '+12%' },
  { label: 'Total Wagered', value: '$156,200', change: '+8%' },
  { label: 'Unique Predictors', value: '423', change: '+15%' },
  { label: 'Stories Active', value: '12', change: '+2' },
];

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const [category, setCategory] = useState<'predictors' | 'collectors' | 'earners'>('predictors');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-amber-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ChevronUp className="h-4 w-4 text-green-400" />;
    if (change < 0) return <ChevronDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-transparent border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-700/20 via-amber-600/10 to-transparent border-amber-700/30';
      default:
        return 'bg-void-950/50 border-neon-blue/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <GlitchText 
          text="Leaderboard" 
          className="font-fantasy text-4xl font-bold text-neon-blue"
        />
        <p className="mt-2 text-muted-foreground">
          Top predictors, collectors, and earners in the Story Forge universe
        </p>
      </div>

      {/* Weekly Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {WEEKLY_STATS.map((stat) => (
          <CyberCard key={stat.label} variant="glass" className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-bold">{stat.value}</p>
              <span className="text-sm text-green-400">{stat.change}</span>
            </div>
          </CyberCard>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'predictors', label: 'Top Predictors', icon: Target },
            { id: 'collectors', label: 'Top Collectors', icon: Star },
            { id: 'earners', label: 'Top Earners', icon: Coins },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as typeof category)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
                  category === cat.id
                    ? 'bg-neon-blue text-void-950'
                    : 'bg-void-900 text-muted-foreground hover:bg-void-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Timeframe */}
        <div className="flex gap-2">
          {['weekly', 'monthly', 'all-time'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as typeof timeframe)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-all ${
                timeframe === tf
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {category === 'predictors' && (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {TOP_PREDICTORS.slice(0, 3).map((user, index) => {
            const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd for visual layout
            const actualIndex = podiumOrder[index];
            const predictor = TOP_PREDICTORS[actualIndex];
            
            return (
              <CyberCard 
                key={predictor.address}
                variant="glass" 
                className={`relative overflow-hidden ${actualIndex === 0 ? 'md:scale-105 md:-mt-4' : ''}`}
              >
                {/* Rank Badge */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-neon-blue/20 to-transparent" />
                <div className="absolute right-4 top-4">
                  {getRankIcon(predictor.rank)}
                </div>

                <CyberCardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className={`mx-auto h-20 w-20 rounded-full ${
                    predictor.rank === 1 ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                    predictor.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-300' :
                    'bg-gradient-to-br from-amber-700 to-amber-600'
                  } flex items-center justify-center`}>
                    <Users className="h-10 w-10 text-void-950" />
                  </div>

                  {/* Username */}
                  <h3 className="mt-4 text-lg font-bold">{predictor.username}</h3>
                  <p className="text-xs text-muted-foreground">{predictor.address}</p>

                  {/* Badges */}
                  <div className="mt-2 flex justify-center gap-1">
                    {predictor.badges.map((badge, i) => (
                      <span key={i} className="text-lg">{badge}</span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Win Rate</p>
                      <p className="font-bold text-green-400">{predictor.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Earnings</p>
                      <p className="font-bold text-neon-blue">${predictor.earnings.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Streak */}
                  {predictor.streak > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-amber-400">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-medium">{predictor.streak} win streak</span>
                    </div>
                  )}
                </CyberCardContent>
              </CyberCard>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      {category === 'predictors' && (
        <CyberCard variant="default" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-blue/20 bg-neon-blue/5">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Predictions</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Win Rate</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Streak</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PREDICTORS.map((user) => (
                  <tr 
                    key={user.address}
                    className={`border-b border-neon-blue/10 ${getRankBg(user.rank)} transition-colors hover:bg-neon-blue/5`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getRankIcon(user.rank)}
                        <div className="flex items-center">
                          {getChangeIcon(user.change)}
                          {user.change !== 0 && (
                            <span className={`text-xs ${user.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {Math.abs(user.change)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.address}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {user.badges.slice(0, 2).map((badge, i) => (
                            <span key={i} className="text-sm">{badge}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{user.predictions}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={user.winRate >= 70 ? 'text-green-400' : user.winRate >= 60 ? 'text-amber-400' : 'text-muted-foreground'}>
                        {user.winRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.streak > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Flame className="h-3 w-3" />
                          {user.streak}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-neon-blue">
                      ${user.earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CyberCard>
      )}

      {/* Collectors Tab */}
      {category === 'collectors' && (
        <CyberCard variant="default" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-blue/20 bg-neon-blue/5">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Collector</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">NFTs Owned</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Rarest Item</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {TOP_COLLECTORS.map((collector) => (
                  <tr 
                    key={collector.username}
                    className={`border-b border-neon-blue/10 ${getRankBg(collector.rank)} transition-colors hover:bg-neon-blue/5`}
                  >
                    <td className="px-4 py-3">{getRankIcon(collector.rank)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{collector.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{collector.nftsOwned}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded px-2 py-0.5 text-xs ${
                        collector.rarest === 'Mythic' ? 'bg-amber-500/20 text-amber-400' :
                        collector.rarest === 'Legendary' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {collector.rarest}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-neon-purple">
                      {collector.totalValue} ETH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CyberCard>
      )}

      {/* Earners Tab (same as predictors sorted by earnings) */}
      {category === 'earners' && (
        <CyberCard variant="default" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-blue/20 bg-neon-blue/5">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Total Wagered</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">ROI</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Net Earnings</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PREDICTORS.sort((a, b) => b.earnings - a.earnings).map((user, index) => (
                  <tr 
                    key={user.address}
                    className={`border-b border-neon-blue/10 ${getRankBg(index + 1)} transition-colors hover:bg-neon-blue/5`}
                  >
                    <td className="px-4 py-3">{getRankIcon(index + 1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <Coins className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">${(user.earnings * 1.5).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-green-400">+{(user.winRate * 0.8).toFixed(1)}%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-400">
                      +${user.earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CyberCard>
      )}

      {/* Your Stats Card */}
      <CyberCard variant="glass" className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Your Ranking</h3>
            <p className="text-sm text-muted-foreground">Connect wallet to see your position</p>
          </div>
          <button className="rounded-lg bg-neon-blue px-4 py-2 text-sm font-medium text-void-950 hover:bg-neon-blue/90">
            Connect Wallet
          </button>
        </div>
      </CyberCard>
    </div>
  );
}
