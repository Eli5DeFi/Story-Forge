'use client';

import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { CyberCard, CyberCardContent, CyberCardHeader } from '@/components/ui/cyber-card';
import { CyberButton } from '@/components/ui/cyber-button';
import { GlitchText } from '@/components/ui/glitch-text';

// Mock betting data
const ACTIVE_BETS = [
  {
    id: '1',
    storyTitle: 'The Quantum Heist',
    chapter: 7,
    question: 'Will Zara betray the crew?',
    options: [
      { id: 'a', text: 'Yes, for the Corporation', odds: 2.4, pool: 12500 },
      { id: 'b', text: 'No, she stays loyal', odds: 1.8, pool: 18200 },
      { id: 'c', text: 'Partial betrayal with redemption', odds: 3.2, pool: 8300 },
    ],
    totalPool: 39000,
    endsIn: '2h 34m',
    bettors: 234,
  },
  {
    id: '2',
    storyTitle: 'Neon Shadows',
    chapter: 12,
    question: 'How will the final boss fight end?',
    options: [
      { id: 'a', text: 'Hero wins with sacrifice', odds: 1.9, pool: 25000 },
      { id: 'b', text: 'Unexpected ally saves the day', odds: 2.8, pool: 15000 },
      { id: 'c', text: 'Villain escapes', odds: 4.5, pool: 8000 },
    ],
    totalPool: 48000,
    endsIn: '5h 12m',
    bettors: 412,
  },
  {
    id: '3',
    storyTitle: 'Echoes of Tomorrow',
    chapter: 4,
    question: 'What artifact will be discovered?',
    options: [
      { id: 'a', text: 'Ancient AI Core', odds: 2.1, pool: 9800 },
      { id: 'b', text: 'Time Crystal', odds: 2.5, pool: 7200 },
      { id: 'c', text: 'Memory Archive', odds: 3.0, pool: 5500 },
    ],
    totalPool: 22500,
    endsIn: '12h 45m',
    bettors: 156,
  },
];

const RESOLVED_BETS = [
  {
    id: '4',
    storyTitle: 'The Quantum Heist',
    chapter: 6,
    question: 'Did Marcus survive the explosion?',
    winningOption: 'Yes, barely - now cybernetic',
    yourBet: { option: 'Yes, barely - now cybernetic', amount: 50, won: true, payout: 95 },
    resolvedAt: '2 hours ago',
  },
  {
    id: '5',
    storyTitle: 'Neon Shadows',
    chapter: 11,
    question: 'Who was the informant?',
    winningOption: 'The bartender',
    yourBet: { option: 'The detective', amount: 100, won: false, payout: 0 },
    resolvedAt: '1 day ago',
  },
  {
    id: '6',
    storyTitle: 'Stellar Requiem',
    chapter: 8,
    question: 'Which faction gains control?',
    winningOption: 'The Syndicate',
    yourBet: { option: 'The Syndicate', amount: 200, won: true, payout: 520 },
    resolvedAt: '3 days ago',
  },
];

export default function BettingPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'resolved' | 'my-bets'>('active');

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
              <p className="text-xl font-bold text-neon-blue">$109,500</p>
            </div>
          </div>
        </CyberCard>
        <CyberCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon-purple/20 p-2">
              <Zap className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Bets</p>
              <p className="text-xl font-bold text-neon-purple">24</p>
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
              <p className="text-xl font-bold text-green-400">+$615</p>
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
              <p className="text-xl font-bold text-amber-400">67%</p>
            </div>
          </div>
        </CyberCard>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-neon-blue/20">
        <div className="flex gap-4">
          {[
            { id: 'active', label: 'Active Markets', count: 24 },
            { id: 'resolved', label: 'Resolved', count: 156 },
            { id: 'my-bets', label: 'My Bets', count: 12 },
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
          {ACTIVE_BETS.map((bet) => (
            <CyberCard key={bet.id} variant="default" className="overflow-hidden">
              <div className="border-b border-neon-blue/10 bg-neon-blue/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link 
                      href={`/stories/${bet.id}`}
                      className="text-sm text-neon-blue hover:underline"
                    >
                      {bet.storyTitle} • Chapter {bet.chapter}
                    </Link>
                    <h3 className="mt-1 text-lg font-semibold">{bet.question}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{bet.endsIn}</span>
                  </div>
                </div>
              </div>
              <CyberCardContent className="p-4">
                <div className="space-y-3">
                  {bet.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between rounded-lg border border-neon-blue/20 bg-void-950/50 p-3 transition-colors hover:border-neon-blue/50 hover:bg-neon-blue/5"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{option.text}</p>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-void-900">
                          <div
                            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                            style={{ width: `${(option.pool / bet.totalPool) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-lg font-bold text-neon-blue">{option.odds}x</p>
                        <p className="text-xs text-muted-foreground">${option.pool.toLocaleString()}</p>
                      </div>
                      <CyberButton size="sm" className="ml-4">
                        Bet
                      </CyberButton>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {bet.bettors} bettors
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      ${bet.totalPool.toLocaleString()} pool
                    </span>
                  </div>
                  <Link 
                    href={`/stories/${bet.id}`}
                    className="flex items-center gap-1 text-neon-blue hover:underline"
                  >
                    Read Story <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </CyberCardContent>
            </CyberCard>
          ))}
        </div>
      )}

      {/* Resolved Bets */}
      {activeTab === 'resolved' && (
        <div className="space-y-4">
          {RESOLVED_BETS.map((bet) => (
            <CyberCard key={bet.id} variant="glass" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {bet.storyTitle} • Chapter {bet.chapter}
                  </p>
                  <h3 className="mt-1 font-semibold">{bet.question}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Winner:</span>
                    <span>{bet.winningOption}</span>
                  </p>
                </div>
                <div className="text-right">
                  {bet.yourBet.won ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-xl font-bold">+${bet.yourBet.payout}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <TrendingDown className="h-5 w-5" />
                      <span className="text-xl font-bold">-${bet.yourBet.amount}</span>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{bet.resolvedAt}</p>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      )}

      {/* My Bets */}
      {activeTab === 'my-bets' && (
        <div className="space-y-4">
          <CyberCard variant="glass" className="p-6 text-center">
            <Coins className="mx-auto h-12 w-12 text-neon-blue/50" />
            <h3 className="mt-4 text-lg font-semibold">Connect Wallet to View Your Bets</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Connect your wallet to see your betting history and pending predictions
            </p>
            <CyberButton className="mt-4">Connect Wallet</CyberButton>
          </CyberCard>
        </div>
      )}
    </div>
  );
}
