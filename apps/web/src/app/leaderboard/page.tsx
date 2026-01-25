'use client';

import { useState } from 'react';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Target,
  Percent,
  Coins,
  Calendar,
  ChevronUp,
  ChevronDown,
  Minus,
  Star,
  Flame,
  Zap,
} from 'lucide-react';
import { CyberCard } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { GlitchText } from '@/components/ui/glitch-text';
import { CyberProgress } from '@/components/ui/data-panel';

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  {
    rank: 1,
    previousRank: 1,
    address: '0x7a3d...f29d',
    displayName: 'CryptoOracle',
    avatar: null,
    totalWinnings: 15420,
    totalBets: 47,
    winRate: 78.7,
    streak: 8,
    favoriteStory: 'Echoes of Eternity',
    badges: ['top-predictor', 'early-adopter', 'whale'],
    joinedAt: '2024-01-05',
  },
  {
    rank: 2,
    previousRank: 4,
    address: '0x3b8c...a12c',
    displayName: 'StoryMaster',
    avatar: null,
    totalWinnings: 12850,
    totalBets: 62,
    winRate: 72.5,
    streak: 5,
    favoriteStory: 'The Last Grimoire',
    badges: ['top-predictor', 'consistent'],
    joinedAt: '2024-01-08',
  },
  {
    rank: 3,
    previousRank: 2,
    address: '0x9f2e...e45b',
    displayName: 'NeonProphet',
    avatar: null,
    totalWinnings: 11200,
    totalBets: 38,
    winRate: 81.5,
    streak: 3,
    favoriteStory: 'Neon Dynasty',
    badges: ['high-accuracy', 'early-adopter'],
    joinedAt: '2024-01-10',
  },
  {
    rank: 4,
    previousRank: 3,
    address: '0x2c7f...b98a',
    displayName: 'FateWeaver',
    avatar: null,
    totalWinnings: 9870,
    totalBets: 55,
    winRate: 67.2,
    streak: 0,
    favoriteStory: 'Echoes of Eternity',
    badges: ['consistent'],
    joinedAt: '2024-01-12',
  },
  {
    rank: 5,
    previousRank: 7,
    address: '0x5d1a...c73f',
    displayName: 'MemoryThief',
    avatar: null,
    totalWinnings: 8540,
    totalBets: 41,
    winRate: 70.7,
    streak: 4,
    favoriteStory: 'Echoes of Eternity',
    badges: ['rising-star'],
    joinedAt: '2024-01-15',
  },
  {
    rank: 6,
    previousRank: 5,
    address: '0x8e4d...d21e',
    displayName: 'ChapterChaser',
    avatar: null,
    totalWinnings: 7650,
    totalBets: 33,
    winRate: 75.7,
    streak: 2,
    favoriteStory: 'The Last Grimoire',
    badges: ['high-accuracy'],
    joinedAt: '2024-01-18',
  },
  {
    rank: 7,
    previousRank: 6,
    address: '0x1f9b...892a',
    displayName: 'VoidWalker',
    avatar: null,
    totalWinnings: 6420,
    totalBets: 28,
    winRate: 71.4,
    streak: 1,
    favoriteStory: 'The Last Grimoire',
    badges: [],
    joinedAt: '2024-01-20',
  },
  {
    rank: 8,
    previousRank: 10,
    address: '0x4c2e...f56d',
    displayName: 'PlotTwister',
    avatar: null,
    totalWinnings: 5890,
    totalBets: 45,
    winRate: 62.2,
    streak: 6,
    favoriteStory: 'Neon Dynasty',
    badges: ['rising-star'],
    joinedAt: '2024-01-22',
  },
  {
    rank: 9,
    previousRank: 8,
    address: '0x6a7f...123c',
    displayName: 'SageSeer',
    avatar: null,
    totalWinnings: 5120,
    totalBets: 29,
    winRate: 68.9,
    streak: 0,
    favoriteStory: 'Echoes of Eternity',
    badges: [],
    joinedAt: '2024-01-23',
  },
  {
    rank: 10,
    previousRank: 9,
    address: '0x9d3c...789e',
    displayName: 'TaleTeller',
    avatar: null,
    totalWinnings: 4780,
    totalBets: 36,
    winRate: 63.8,
    streak: 2,
    favoriteStory: 'Neon Dynasty',
    badges: [],
    joinedAt: '2024-01-24',
  },
];

const BADGES: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  'top-predictor': { icon: <Crown className="h-3 w-3" />, label: 'Top Predictor', color: 'text-gold-500' },
  'early-adopter': { icon: <Star className="h-3 w-3" />, label: 'Early Adopter', color: 'text-neon-blue' },
  'whale': { icon: <Coins className="h-3 w-3" />, label: 'Whale', color: 'text-neon-purple' },
  'consistent': { icon: <Target className="h-3 w-3" />, label: 'Consistent', color: 'text-green-400' },
  'high-accuracy': { icon: <Zap className="h-3 w-3" />, label: 'High Accuracy', color: 'text-cyber-500' },
  'rising-star': { icon: <TrendingUp className="h-3 w-3" />, label: 'Rising Star', color: 'text-red-400' },
};

type TimeFilter = 'all' | 'month' | 'week';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-gold-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) {
      return (
        <span className="flex items-center gap-0.5 text-green-400 text-xs">
          <ChevronUp className="h-3 w-3" />
          {previous - current}
        </span>
      );
    } else if (current > previous) {
      return (
        <span className="flex items-center gap-0.5 text-red-400 text-xs">
          <ChevronDown className="h-3 w-3" />
          {current - previous}
        </span>
      );
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const topThree = MOCK_LEADERBOARD.slice(0, 3);
  const restOfBoard = MOCK_LEADERBOARD.slice(3);

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <GlitchText
            text="Leaderboard"
            className="font-fantasy text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-cyber-500 to-neon-purple"
          />
          <p className="mt-4 text-muted-foreground text-lg">
            Top predictors ranked by total winnings
          </p>
        </div>

        {/* Global Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <CyberCard variant="glass" className="text-center py-4">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-gold-500" />
            <div className="text-2xl font-bold text-gold-500">$87,740</div>
            <div className="text-xs text-muted-foreground">Total Won</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Target className="h-6 w-6 mx-auto mb-2 text-neon-blue" />
            <div className="text-2xl font-bold text-neon-blue">414</div>
            <div className="text-xs text-muted-foreground">Total Predictions</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Percent className="h-6 w-6 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-green-400">71.2%</div>
            <div className="text-xs text-muted-foreground">Avg Win Rate</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Flame className="h-6 w-6 mx-auto mb-2 text-red-400" />
            <div className="text-2xl font-bold text-red-400">8</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </CyberCard>
        </div>

        {/* Time Filter */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-1 p-1 rounded-lg bg-void-800/50 border border-neon-blue/20">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'month', label: 'This Month' },
              { id: 'week', label: 'This Week' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id as TimeFilter)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  timeFilter === filter.id
                    ? 'bg-neon-blue/20 text-neon-blue shadow-neon-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            <div className="order-1">
              <CyberCard variant="glass" className="text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="pt-4">
                  <Medal className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold">{topThree[1].displayName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{topThree[1].address}</p>
                  <div className="mt-3 pt-3 border-t border-neon-blue/10">
                    <p className="text-2xl font-bold text-gold-500">${topThree[1].totalWinnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {topThree[1].winRate}% win rate
                    </p>
                  </div>
                </div>
              </CyberCard>
            </div>

            {/* 1st Place */}
            <div className="order-2">
              <CyberCard variant="default" corners className="text-center relative overflow-hidden transform scale-105">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
                <div className="pt-4">
                  <Crown className="h-10 w-10 mx-auto text-gold-500 mb-2 animate-glow-pulse" />
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center mb-3 shadow-neon-gold">
                    <span className="text-3xl font-bold text-black">1</span>
                  </div>
                  <h3 className="font-semibold text-lg">{topThree[0].displayName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{topThree[0].address}</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {topThree[0].badges.map((badge) => (
                      <span
                        key={badge}
                        className={`${BADGES[badge].color}`}
                        title={BADGES[badge].label}
                      >
                        {BADGES[badge].icon}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gold-500/20">
                    <p className="text-3xl font-bold text-gold-500">${topThree[0].totalWinnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {topThree[0].winRate}% win rate | {topThree[0].streak} streak
                    </p>
                  </div>
                </div>
              </CyberCard>
            </div>

            {/* 3rd Place */}
            <div className="order-3">
              <CyberCard variant="glass" className="text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
                <div className="pt-4">
                  <Medal className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold">{topThree[2].displayName}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{topThree[2].address}</p>
                  <div className="mt-3 pt-3 border-t border-neon-blue/10">
                    <p className="text-2xl font-bold text-gold-500">${topThree[2].totalWinnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {topThree[2].winRate}% win rate
                    </p>
                  </div>
                </div>
              </CyberCard>
            </div>
          </div>
        </div>

        {/* Rest of Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <CyberCard variant="default" className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-neon-blue/20 text-xs font-medium text-muted-foreground">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-2 text-right">Winnings</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-1 text-right">Bets</div>
              <div className="col-span-2 text-right">Streak</div>
            </div>

            {/* Table Body */}
            {restOfBoard.map((player, index) => (
              <div
                key={player.address}
                className="grid grid-cols-12 gap-4 p-4 border-b border-neon-blue/10 hover:bg-neon-blue/5 transition-colors items-center animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center gap-2">
                  <span className="font-mono font-bold">{player.rank}</span>
                  {getRankChange(player.rank, player.previousRank)}
                </div>

                {/* Player */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center text-sm font-bold">
                    {player.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{player.displayName}</p>
                    <p className="text-xs text-muted-foreground">{player.address}</p>
                  </div>
                </div>

                {/* Winnings */}
                <div className="col-span-2 text-right">
                  <span className="font-bold text-gold-500">
                    ${player.totalWinnings.toLocaleString()}
                  </span>
                </div>

                {/* Win Rate */}
                <div className="col-span-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    <CyberProgress value={player.winRate} className="w-16" />
                    <span className="text-sm">{player.winRate}%</span>
                  </div>
                </div>

                {/* Total Bets */}
                <div className="col-span-1 text-right text-muted-foreground">
                  {player.totalBets}
                </div>

                {/* Streak */}
                <div className="col-span-2 text-right">
                  {player.streak > 0 ? (
                    <span className="inline-flex items-center gap-1 text-red-400">
                      <Flame className="h-4 w-4" />
                      {player.streak}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            ))}
          </CyberCard>
        </div>

        {/* Your Stats CTA */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <CyberCard variant="glass" className="py-8">
            <Trophy className="h-12 w-12 mx-auto text-gold-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Climb the Ranks?</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet and start predicting story outcomes to appear on the leaderboard.
            </p>
            <CyberButton variant="gold" size="lg">
              Connect Wallet & Start Betting
            </CyberButton>
          </CyberCard>
        </div>
      </div>
    </div>
  );
}
