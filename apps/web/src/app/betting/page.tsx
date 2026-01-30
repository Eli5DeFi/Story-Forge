'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Trophy,
  Coins,
  CheckCircle2,
  XCircle,
  Zap,
  Users,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { GlitchText } from '@/components/ui/glitch-text';
import { useActivePools, useUserBets, useUserStats } from '@/hooks/useBetting';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import type { ActivePoolOutcome } from '@/types/story';

export default function BettingPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'resolved' | 'my-bets'>('active');

  const { data: activePools, isLoading: poolsLoading, error: poolsError, refetch: refetchPools } = useActivePools();
  const { data: userBets, isLoading: betsLoading } = useUserBets();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { isAuthenticated } = useAuth();

  // Group active pools by chapter
  const chapterMarkets = useMemo(() => {
    if (!activePools) return [];
    const grouped = new Map<string, { chapterId: string; storyTitle: string; storyId: string; chapterNumber: number; title: string; bettingEndsAt?: string; outcomes: ActivePoolOutcome[] }>();

    for (const pool of activePools) {
      const chapterId = pool.chapter?.id || pool.chapterId;
      if (!grouped.has(chapterId)) {
        grouped.set(chapterId, {
          chapterId,
          storyTitle: pool.chapter?.story?.title || 'Unknown Story',
          storyId: pool.chapter?.story?.id || '',
          chapterNumber: pool.chapter?.chapterNumber || 0,
          title: pool.chapter?.title || `Chapter ${pool.chapter?.chapterNumber}`,
          bettingEndsAt: pool.chapter?.bettingEndsAt,
          outcomes: [],
        });
      }
      grouped.get(chapterId)!.outcomes.push(pool);
    }
    return Array.from(grouped.values());
  }, [activePools]);

  // Calculate total pool from all active outcomes
  const totalActivePool = useMemo(() => {
    if (!activePools) return 0;
    return activePools.reduce((sum, o) => sum + parseFloat(o.bettingPool?.totalAmount || '0'), 0);
  }, [activePools]);

  // Separate user bets into active vs resolved
  const resolvedBets = useMemo(
    () => (userBets ?? []).filter((b) => b.status === 'WON' || b.status === 'LOST'),
    [userBets],
  );
  const pendingBets = useMemo(
    () => (userBets ?? []).filter((b) => b.status === 'PENDING'),
    [userBets],
  );

  if (poolsError) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-semibold">Failed to load betting data</h3>
        <p className="mt-2 text-muted-foreground">{(poolsError as Error).message}</p>
        <CyberButton className="mt-4" onClick={() => refetchPools()}>
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
          text="Prediction Markets"
          className="font-fantasy text-4xl font-bold text-neon-blue"
        />
        <p className="mt-2 text-muted-foreground">
          Bet on story outcomes and earn rewards for correct predictions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-blue/20 p-2">
              <Coins className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pool</p>
              <p className="text-xl font-bold text-neon-blue">
                {poolsLoading ? (
                  <span className="inline-block h-6 w-16 animate-pulse rounded bg-void-800" />
                ) : (
                  `$${totalActivePool.toLocaleString()}`
                )}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-purple/20 p-2">
              <Zap className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Markets</p>
              <p className="text-xl font-bold text-neon-purple">
                {poolsLoading ? (
                  <span className="inline-block h-6 w-8 animate-pulse rounded bg-void-800" />
                ) : (
                  chapterMarkets.length
                )}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Winnings</p>
              <p className="text-xl font-bold text-green-400">
                {statsLoading ? (
                  <span className="inline-block h-6 w-16 animate-pulse rounded bg-void-800" />
                ) : userStats ? (
                  `+$${userStats.totalEarnings || '0'}`
                ) : (
                  '--'
                )}
              </p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-xl font-bold text-amber-400">
                {statsLoading ? (
                  <span className="inline-block h-6 w-12 animate-pulse rounded bg-void-800" />
                ) : userStats ? (
                  `${userStats.winRate.toFixed(0)}%`
                ) : (
                  '--'
                )}
              </p>
            </div>
          </div>
        </CyberCard>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-neon-blue/20">
        <div className="flex gap-4">
          {[
            { id: 'active', label: 'Active Markets', count: chapterMarkets.length },
            { id: 'resolved', label: 'Resolved', count: resolvedBets.length },
            { id: 'my-bets', label: 'My Bets', count: pendingBets.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-neon-blue text-neon-blue'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-neon-blue/20 px-2 py-0.5 text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Markets */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {poolsLoading ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <CyberCard key={i} variant="default" className="overflow-hidden">
                <div className="border-b border-neon-blue/10 bg-neon-blue/5 p-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-void-800" />
                  <div className="mt-2 h-6 w-64 animate-pulse rounded bg-void-800" />
                </div>
                <CyberCardContent className="space-y-3 p-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-14 animate-pulse rounded-lg bg-void-800" />
                  ))}
                </CyberCardContent>
              </CyberCard>
            ))
          ) : chapterMarkets.length === 0 ? (
            <div className="py-20 text-center">
              <Coins className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Active Markets</h3>
              <p className="mt-2 text-muted-foreground">
                There are no active prediction markets right now. Check back when new chapters are published.
              </p>
            </div>
          ) : (
            chapterMarkets.map((market) => {
              const totalPool = market.outcomes.reduce(
                (sum, o) => sum + parseFloat(o.bettingPool?.totalAmount || '0'),
                0,
              );
              const totalBettors = market.outcomes.reduce(
                (sum, o) => sum + (o.bettingPool?._count?.bets || 0),
                0,
              );

              return (
                <CyberCard key={market.chapterId} variant="default" className="overflow-hidden">
                  <div className="border-b border-neon-blue/10 bg-neon-blue/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/stories/${market.storyId}`}
                          className="text-sm text-neon-blue hover:underline"
                        >
                          {market.storyTitle} &bull; Chapter {market.chapterNumber}
                        </Link>
                        <h3 className="mt-1 text-lg font-semibold">{market.title}</h3>
                      </div>
                      {market.bettingEndsAt && (
                        <div className="flex items-center gap-2 text-amber-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {formatDistanceToNow(new Date(market.bettingEndsAt), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CyberCardContent className="p-4">
                    <div className="space-y-3">
                      {market.outcomes.map((outcome) => {
                        const poolAmt = parseFloat(outcome.bettingPool?.totalAmount || '0');
                        const odds = totalPool > 0 && poolAmt > 0 ? (totalPool / poolAmt).toFixed(1) : '-.--';
                        const pct = totalPool > 0 ? (poolAmt / totalPool) * 100 : 0;

                        return (
                          <div
                            key={outcome.id}
                            className="flex items-center justify-between rounded-lg border border-neon-blue/20 bg-void-950/50 p-3 transition-colors hover:border-neon-blue/50 hover:bg-neon-blue/5"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{outcome.teaserText}</p>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-void-900">
                                <div
                                  className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-lg font-bold text-neon-blue">{odds}x</p>
                              <p className="text-xs text-muted-foreground">${poolAmt.toLocaleString()}</p>
                            </div>
                            <CyberButton size="sm" className="ml-4">
                              Bet
                            </CyberButton>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {totalBettors} bettors
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="h-4 w-4" />
                          ${totalPool.toLocaleString()} pool
                        </span>
                      </div>
                      <Link
                        href={`/stories/${market.storyId}`}
                        className="flex items-center gap-1 text-neon-blue hover:underline"
                      >
                        Read Story <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CyberCardContent>
                </CyberCard>
              );
            })
          )}
        </div>
      )}

      {/* Resolved Bets */}
      {activeTab === 'resolved' && (
        <div className="space-y-4">
          {!isAuthenticated ? (
            <CyberCard variant="glass" className="p-6 text-center">
              <Coins className="mx-auto h-12 w-12 text-neon-blue/50" />
              <h3 className="mt-4 text-lg font-semibold">Connect Wallet to View Resolved Bets</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your wallet and sign in to see your resolved predictions
              </p>
            </CyberCard>
          ) : betsLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-void-800" />
            ))
          ) : resolvedBets.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No resolved bets yet</p>
            </div>
          ) : (
            resolvedBets.map((bet) => (
              <CyberCard key={bet.id} variant="glass" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bet #{bet.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 font-semibold">${bet.amount} wagered</p>
                  </div>
                  <div className="text-right">
                    {bet.status === 'WON' ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-xl font-bold">+${bet.payout || '0'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400">
                        <TrendingDown className="h-5 w-5" />
                        <span className="text-xl font-bold">-${bet.amount}</span>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CyberCard>
            ))
          )}
        </div>
      )}

      {/* My Bets */}
      {activeTab === 'my-bets' && (
        <div className="space-y-4">
          {!isAuthenticated ? (
            <CyberCard variant="glass" className="p-6 text-center">
              <Coins className="mx-auto h-12 w-12 text-neon-blue/50" />
              <h3 className="mt-4 text-lg font-semibold">Connect Wallet to View Your Bets</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your wallet to see your betting history and pending predictions
              </p>
              <CyberButton className="mt-4">Connect Wallet</CyberButton>
            </CyberCard>
          ) : betsLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-void-800" />
            ))
          ) : pendingBets.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 text-lg font-semibold">No Pending Bets</h3>
              <p className="mt-2 text-muted-foreground">
                You don&apos;t have any pending predictions. Browse active markets to place your first bet.
              </p>
            </div>
          ) : (
            pendingBets.map((bet) => (
              <CyberCard key={bet.id} variant="glass" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bet #{bet.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 font-semibold">${bet.amount} wagered</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-400">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                </div>
              </CyberCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
