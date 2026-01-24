'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOutcomes, usePlaceBet } from '@/hooks/useBetting';
import { formatDistanceToNow } from 'date-fns';
import type { Chapter, Outcome } from '@/types/story';
import { OutcomeCard } from './OutcomeCard';
import { BetModal } from './BetModal';

interface BettingPanelProps {
  chapter: Chapter;
}

export function BettingPanel({ chapter }: BettingPanelProps) {
  const { address, isConnected } = useAccount();
  const { data: outcomes, isLoading } = useOutcomes(chapter.id);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);

  const isBettingOpen = chapter.status === 'BETTING_OPEN';
  const bettingEndsAt = chapter.bettingEndsAt
    ? new Date(chapter.bettingEndsAt)
    : null;
  const isExpired = bettingEndsAt ? bettingEndsAt < new Date() : false;

  // Calculate total pool across all outcomes
  const totalPool = outcomes?.reduce((sum, o) => {
    return sum + parseFloat(o.bettingPool?.totalAmount || '0');
  }, 0) || 0;

  const handleSelectOutcome = (outcome: Outcome) => {
    setSelectedOutcome(outcome);
    if (isConnected && isBettingOpen && !isExpired) {
      setShowBetModal(true);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-fantasy text-2xl font-bold">
              What Happens Next?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Predict the outcome of the next chapter and win rewards
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${isBettingOpen && !isExpired
                ? 'bg-green-500/20 text-green-400'
                : 'bg-muted text-muted-foreground'
              }`}
          >
            {isBettingOpen && !isExpired ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Betting Open
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Betting Closed
              </>
            )}
          </div>
        </div>

        {/* Timer & Pool Info */}
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
          {bettingEndsAt && isBettingOpen && !isExpired && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Ends {formatDistanceToNow(bettingEndsAt, { addSuffix: true })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">
              ${totalPool.toLocaleString()} USDC
            </span>
            <span className="text-muted-foreground">in predictions</span>
          </div>
        </div>
      </div>

      {/* Outcomes Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {outcomes?.map((outcome) => (
                <OutcomeCard
                  key={outcome.id}
                  outcome={outcome}
                  totalPool={totalPool}
                  isSelected={selectedOutcome?.id === outcome.id}
                  onClick={() => handleSelectOutcome(outcome)}
                  disabled={!isBettingOpen || isExpired}
                  showWinner={chapter.status === 'RESOLVED'}
                />
              ))}
            </div>

            {/* Connect Wallet CTA */}
            {!isConnected && isBettingOpen && !isExpired && (
              <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Connect your wallet to place predictions
                </p>
                <div className="mt-4">
                  <ConnectButton />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Footer */}
      <div className="border-t border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>85% to winners</span>
          <span>•</span>
          <span>15% to treasury</span>
          <span>•</span>
          <span>2% platform fee</span>
          <span>•</span>
          <span>No minimum bet</span>
        </div>
      </div>

      {/* Bet Modal */}
      {showBetModal && selectedOutcome && (
        <BetModal
          outcome={selectedOutcome}
          totalPool={totalPool}
          onClose={() => {
            setShowBetModal(false);
            setSelectedOutcome(null);
          }}
        />
      )}
    </div>
  );
}
