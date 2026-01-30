'use client';

import { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  TrendingUp,
  Flame,
  Target,
  Coins,
  Users,
  Crown,
  Zap,
  Star,
  AlertCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { GlitchText } from '@/components/ui/glitch-text';
import { useLeaderboard, useLeaderboardByWinRate } from '@/hooks/useLeaderboard';
import type { LeaderboardEntry } from '@/types/story';

export default function LeaderboardPage() {
  const [category, setCategory] = useState<'predictors' | 'collectors' | 'earners'>('predictors');

  const { data: earnersData, isLoading: earnersLoading, error: earnersError, refetch: refetchEarners } = useLeaderboard();
  const { data: predictorsData, isLoading: predictorsLoading, error: predictorsError, refetch: refetchPredictors } = useLeaderboardByWinRate();

  const earners = earnersData ?? [];
  const predictors = predictorsData ?? [];

  const isLoading = earnersLoading || predictorsLoading;
  const error = earnersError || predictorsError;

  // Derive stats from leaderboard data
  const stats = useMemo(() => {
    const allUsers = earners.length > 0 ? earners : predictors;
    const totalPredictions = allUsers.reduce((sum, u) => sum + u.totalBets, 0);
    const totalWagered = allUsers.reduce((sum, u) => sum + parseFloat(u.totalWon || '0'), 0);
    return {
      totalPredictions,
      totalWagered,
      uniquePredictors: allUsers.length,
    };
  }, [earners, predictors]);

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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-semibold">Failed to load leaderboard</h3>
        <p className="mt-2 text-muted-foreground">{(error as Error).message}</p>
        <CyberButton className="mt-4" onClick={() => { refetchEarners(); refetchPredictors(); }}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </CyberButton>
      </div>
    );
  }

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

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Predictions', value: isLoading ? null : stats.totalPredictions.toLocaleString() },
          { label: 'Total Wagered', value: isLoading ? null : `$${stats.totalWagered.toLocaleString()}` },
          { label: 'Unique Predictors', value: isLoading ? null : stats.uniquePredictors.toString() },
        ].map((stat) => (
          <CyberCard key={stat.label} variant="glass" className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-1">
              {stat.value === null ? (
                <span className="inline-block h-8 w-20 animate-pulse rounded bg-void-800" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </div>
          </CyberCard>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex gap-2">
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

      {/* Top Predictors (by win rate) */}
      {category === 'predictors' && (
        <>
          {/* Top 3 Podium */}
          {!predictorsLoading && predictors.length >= 3 && (
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {[1, 0, 2].map((actualIndex, displayIndex) => {
                const entry = predictors[actualIndex];
                if (!entry) return null;
                const rank = actualIndex + 1;

                return (
                  <CyberCard
                    key={entry.walletAddress}
                    variant="glass"
                    className={`relative overflow-hidden ${actualIndex === 0 ? 'md:scale-105 md:-mt-4' : ''}`}
                  >
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-neon-blue/20 to-transparent" />
                    <div className="absolute right-4 top-4">
                      {getRankIcon(rank)}
                    </div>

                    <CyberCardContent className="p-6 text-center">
                      <div className={`mx-auto h-20 w-20 rounded-full ${
                        rank === 1 ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                        rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-300' :
                        'bg-gradient-to-br from-amber-700 to-amber-600'
                      } flex items-center justify-center`}>
                        <Users className="h-10 w-10 text-void-950" />
                      </div>

                      <h3 className="mt-4 text-lg font-bold">
                        {entry.username || `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Win Rate</p>
                          <p className="font-bold text-green-400">{entry.winRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earnings</p>
                          <p className="font-bold text-neon-blue">${parseFloat(entry.totalWon).toLocaleString()}</p>
                        </div>
                      </div>

                      {entry.winStreak > 0 && (
                        <div className="mt-3 flex items-center justify-center gap-1 text-amber-400">
                          <Flame className="h-4 w-4" />
                          <span className="text-sm font-medium">{entry.winStreak} win streak</span>
                        </div>
                      )}
                    </CyberCardContent>
                  </CyberCard>
                );
              })}
            </div>
          )}

          {/* Full Table */}
          {predictorsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-void-800" />
              ))}
            </div>
          ) : predictors.length === 0 ? (
            <div className="py-20 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No predictors yet</h3>
              <p className="mt-2 text-muted-foreground">Be the first to make predictions and climb the leaderboard.</p>
            </div>
          ) : (
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
                    {predictors.map((entry, index) => {
                      const rank = index + 1;
                      return (
                        <tr
                          key={entry.walletAddress}
                          className={`border-b border-neon-blue/10 ${getRankBg(rank)} transition-colors hover:bg-neon-blue/5`}
                        >
                          <td className="px-4 py-3">{getRankIcon(rank)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {entry.username || `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{entry.totalBets}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={entry.winRate >= 70 ? 'text-green-400' : entry.winRate >= 60 ? 'text-amber-400' : 'text-muted-foreground'}>
                              {entry.winRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {entry.winStreak > 0 ? (
                              <span className="inline-flex items-center gap-1 text-amber-400">
                                <Flame className="h-3 w-3" />
                                {entry.winStreak}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-neon-blue">
                            ${parseFloat(entry.totalWon).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CyberCard>
          )}
        </>
      )}

      {/* Collectors Tab - Coming Soon */}
      {category === 'collectors' && (
        <div className="py-20 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
          <p className="mt-2 text-muted-foreground">
            Cross-user NFT collection rankings are under development. Check back soon!
          </p>
        </div>
      )}

      {/* Earners Tab */}
      {category === 'earners' && (
        <>
          {earnersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-void-800" />
              ))}
            </div>
          ) : earners.length === 0 ? (
            <div className="py-20 text-center">
              <Coins className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No earners yet</h3>
              <p className="mt-2 text-muted-foreground">Be the first to win predictions and earn rewards.</p>
            </div>
          ) : (
            <CyberCard variant="default" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neon-blue/20 bg-neon-blue/5">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Total Bets</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Win Rate</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Net Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earners.map((entry, index) => {
                      const rank = index + 1;
                      return (
                        <tr
                          key={entry.walletAddress}
                          className={`border-b border-neon-blue/10 ${getRankBg(rank)} transition-colors hover:bg-neon-blue/5`}
                        >
                          <td className="px-4 py-3">{getRankIcon(rank)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Coins className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {entry.username || `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{entry.totalBets}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-green-400">{entry.winRate.toFixed(1)}%</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-green-400">
                            +${parseFloat(entry.totalWon).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CyberCard>
          )}
        </>
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
