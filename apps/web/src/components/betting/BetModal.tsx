'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  X,
  AlertCircle,
  TrendingUp,
  Loader2,
  CheckCircle,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlaceBet, useCalculatePotentialWinnings } from '@/hooks/useBetting';
import type { Outcome } from '@/types/story';

interface BetModalProps {
  outcome: Outcome;
  totalPool: number;
  onClose: () => void;
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function BetModal({ outcome, totalPool, onClose }: BetModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'USDC' | 'USDT'>('USDC');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const placeBet = usePlaceBet();
  const { potentialWinnings, share } = useCalculatePotentialWinnings(outcome, amount);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await placeBet.mutateAsync({
        outcomeId: outcome.id,
        amount,
        token,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to place bet');
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Prediction Placed!</h2>
          <p className="mt-2 text-muted-foreground">
            You&apos;ve bet ${amount} {token} on outcome #{outcome.optionNumber}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            If this outcome wins, you could earn up to ${potentialWinnings}
          </p>
          <Button onClick={onClose} className="mt-6 w-full">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold">Place Your Prediction</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selected Outcome */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {outcome.optionNumber}
              </div>
              <div>
                <p className="font-medium">{outcome.teaserText}</p>
                <p className="mt-1 text-xs text-muted-foreground capitalize">
                  {outcome.emotionalTone} • {((parseFloat(outcome.bettingPool?.totalAmount || '0') / totalPool) * 100 || 0).toFixed(1)}% of pool
                </p>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="mt-6">
            <label className="text-sm text-muted-foreground">Token</label>
            <div className="mt-2 flex gap-2">
              {(['USDC', 'USDT'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setToken(t)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    token === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mt-6">
            <label className="text-sm text-muted-foreground">Amount</label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-border bg-background py-3 pl-8 pr-16 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {token}
              </span>
            </div>

            {/* Quick Amounts */}
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Winnings */}
          {amount && parseFloat(amount) > 0 && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                Potential Earnings
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  ${potentialWinnings}
                </span>
                <span className="text-sm text-muted-foreground">
                  {share.toFixed(2)}% pool share
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                * Estimated maximum if this outcome wins. Actual payout depends on final pool size.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={placeBet.isPending || !amount || parseFloat(amount) <= 0}
            className="mt-6 w-full"
            size="lg"
          >
            {placeBet.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Bet...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Predict for ${amount || '0'} {token}
              </>
            )}
          </Button>

          {/* Disclaimer */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By placing a prediction, you agree to our terms of service.
            <br />
            2% platform fee applies. 85% goes to winners.
          </p>
        </div>
      </div>
    </div>
  );
}
