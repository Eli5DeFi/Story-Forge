'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Coins,
  Target,
  Zap,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { CyberCard, CyberCardHeader, CyberCardContent } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { GlitchText } from '@/components/ui/glitch-text';
import { DataPanel, DataRow, CyberProgress } from '@/components/ui/data-panel';

// Mock betting markets data
const MOCK_MARKETS = [
  {
    id: 'market-1',
    storyId: 'echoes-of-eternity',
    storyTitle: 'Echoes of Eternity',
    chapter: 1,
    question: 'What will Lyra do when she discovers she can rewrite memories?',
    status: 'OPEN',
    totalPool: 12500,
    bettors: 156,
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 23), // 23 hours from now
    outcomes: [
      { id: 'o1', text: 'Use the power to save her dying sister immediately', odds: 2.4, percentage: 42, bets: 5250 },
      { id: 'o2', text: 'Seek guidance from the Memory Keepers guild', odds: 3.1, percentage: 32, bets: 4000 },
      { id: 'o3', text: 'Attempt to hide her abilities from everyone', odds: 4.5, percentage: 18, bets: 2250 },
      { id: 'o4', text: 'Confront the Shadow Council who created her', odds: 8.2, percentage: 8, bets: 1000 },
    ],
  },
  {
    id: 'market-2',
    storyId: 'the-last-grimoire',
    storyTitle: 'The Last Grimoire',
    chapter: 2,
    question: 'Who will Marcus encounter in the Forgotten Library?',
    status: 'OPEN',
    totalPool: 8750,
    bettors: 98,
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 47), // 47 hours from now
    outcomes: [
      { id: 'o1', text: 'The ghost of the last Archmagus', odds: 2.8, percentage: 35, bets: 3063 },
      { id: 'o2', text: 'A rival seeking the same forbidden knowledge', odds: 2.2, percentage: 45, bets: 3938 },
      { id: 'o3', text: 'An ancient demon bound to the grimoire', odds: 5.5, percentage: 12, bets: 1050 },
      { id: 'o4', text: 'His presumed-dead mentor', odds: 7.0, percentage: 8, bets: 700 },
    ],
  },
  {
    id: 'market-3',
    storyId: 'neon-dynasty',
    storyTitle: 'Neon Dynasty',
    chapter: 3,
    question: 'How will Zara escape the corporate hunters?',
    status: 'OPEN',
    totalPool: 15200,
    bettors: 234,
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
    outcomes: [
      { id: 'o1', text: 'Hack into their neural network and disable them', odds: 1.8, percentage: 55, bets: 8360 },
      { id: 'o2', text: 'Use the dead CEO\'s memories to blackmail them', odds: 3.2, percentage: 28, bets: 4256 },
      { id: 'o3', text: 'Escape through the abandoned subway tunnels', odds: 5.0, percentage: 12, bets: 1824 },
      { id: 'o4', text: 'Surrender and infiltrate from within', odds: 12.0, percentage: 5, bets: 760 },
    ],
  },
];

const RESOLVED_MARKETS = [
  {
    id: 'resolved-1',
    storyTitle: 'Echoes of Eternity',
    chapter: 0,
    question: 'How does Lyra first discover her memory-rewriting ability?',
    winningOutcome: 'Accidentally while trying to save a dying street child',
    totalPool: 9800,
    winners: 67,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
];

export default function BettingPage() {
  const [selectedTab, setSelectedTab] = useState<'open' | 'resolved'>('open');
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  const formatTimeRemaining = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <GlitchText
            text="Prediction Markets"
            className="font-fantasy text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-neon-blue to-neon-purple"
          />
          <p className="mt-4 text-muted-foreground text-lg">
            Predict story outcomes and win USDC/USDT
          </p>
        </div>

        {/* Global Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <CyberCard variant="glass" className="text-center py-4">
            <Coins className="h-6 w-6 mx-auto mb-2 text-gold-500" />
            <div className="text-2xl font-bold text-gold-500">$36,450</div>
            <div className="text-xs text-muted-foreground">Total Volume</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Target className="h-6 w-6 mx-auto mb-2 text-neon-blue" />
            <div className="text-2xl font-bold text-neon-blue">3</div>
            <div className="text-xs text-muted-foreground">Active Markets</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Users className="h-6 w-6 mx-auto mb-2 text-neon-purple" />
            <div className="text-2xl font-bold text-neon-purple">488</div>
            <div className="text-xs text-muted-foreground">Active Bettors</div>
          </CyberCard>
          <CyberCard variant="glass" className="text-center py-4">
            <Zap className="h-6 w-6 mx-auto mb-2 text-cyber-500" />
            <div className="text-2xl font-bold text-cyber-500">$2,450</div>
            <div className="text-xs text-muted-foreground">Avg. Payout</div>
          </CyberCard>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-1 p-1 rounded-lg bg-void-800/50 border border-neon-blue/20">
            <button
              onClick={() => setSelectedTab('open')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                selectedTab === 'open'
                  ? 'bg-green-500/20 text-green-400 shadow-neon-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Timer className="h-4 w-4" />
              Open Markets
            </button>
            <button
              onClick={() => setSelectedTab('resolved')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                selectedTab === 'resolved'
                  ? 'bg-neon-blue/20 text-neon-blue shadow-neon-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Resolved
            </button>
          </div>
        </div>

        {/* Markets List */}
        {selectedTab === 'open' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {MOCK_MARKETS.map((market, index) => (
              <CyberCard
                key={market.id}
                variant="default"
                corners
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Market Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      href={`/stories/${market.storyId}`}
                      className="text-sm text-neon-blue hover:underline"
                    >
                      {market.storyTitle} - Chapter {market.chapter}
                    </Link>
                    <h3 className="mt-1 text-lg font-semibold">{market.question}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gold-500" />
                    <span className={`font-mono ${
                      market.endsAt.getTime() - Date.now() < 1000 * 60 * 60 * 6
                        ? 'text-red-400'
                        : 'text-gold-500'
                    }`}>
                      {formatTimeRemaining(market.endsAt)}
                    </span>
                  </div>
                </div>

                {/* Outcomes */}
                <div className="space-y-3">
                  {market.outcomes.map((outcome) => (
                    <div
                      key={outcome.id}
                      className="group p-3 rounded-lg border border-neon-blue/20 hover:border-neon-blue/50 bg-void-900/50 transition-all cursor-pointer"
                      onClick={() => setSelectedMarket(outcome.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm flex-1">{outcome.text}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gold-500 font-mono font-bold">{outcome.odds}x</span>
                          <CyberButton variant="neon" size="sm">
                            Bet
                          </CyberButton>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <CyberProgress value={outcome.percentage} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          ${outcome.bets.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Market Stats */}
                <div className="mt-4 pt-4 border-t border-neon-blue/10 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-gold-500" />
                      ${market.totalPool.toLocaleString()} pool
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-neon-purple" />
                      {market.bettors} bettors
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                    BETTING OPEN
                  </span>
                </div>
              </CyberCard>
            ))}
          </div>
        )}

        {/* Resolved Markets */}
        {selectedTab === 'resolved' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {RESOLVED_MARKETS.map((market, index) => (
              <CyberCard
                key={market.id}
                variant="glass"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {market.storyTitle} - Chapter {market.chapter}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold">{market.question}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
                    RESOLVED
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Winning Outcome</span>
                  </div>
                  <p className="text-foreground">{market.winningOutcome}</p>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Pool: ${market.totalPool.toLocaleString()}</span>
                  <span>{market.winners} winners</span>
                </div>
              </CyberCard>
            ))}

            {RESOLVED_MARKETS.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resolved markets yet</p>
              </div>
            )}
          </div>
        )}

        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <CyberCard variant="glass" className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neon-blue/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-neon-blue">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Your Prediction</h3>
              <p className="text-sm text-muted-foreground">
                Browse active markets and select the story outcome you believe will happen
              </p>
            </CyberCard>
            <CyberCard variant="glass" className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-gold-500">2</span>
              </div>
              <h3 className="font-semibold mb-2">Place Your Bet</h3>
              <p className="text-sm text-muted-foreground">
                Stake USDC or USDT on your chosen outcome before betting closes
              </p>
            </CyberCard>
            <CyberCard variant="glass" className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="font-semibold mb-2">Win the Pool</h3>
              <p className="text-sm text-muted-foreground">
                If your prediction is correct, share the entire pool with other winners
              </p>
            </CyberCard>
          </div>
        </div>
      </div>
    </div>
  );
}
