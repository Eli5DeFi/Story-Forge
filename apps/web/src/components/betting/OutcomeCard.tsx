'use client';

import { Trophy, Users, TrendingUp, CheckCircle } from 'lucide-react';
import type { Outcome } from '@/types/story';

interface OutcomeCardProps {
  outcome: Outcome;
  totalPool: number;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  showWinner?: boolean;
}

const EMOTIONAL_TONE_COLORS: Record<string, string> = {
  hopeful: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  dark: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
  dramatic: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  mysterious: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
  triumphant: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  tragic: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  neutral: 'from-muted/20 to-muted/10 border-border',
};

export function OutcomeCard({
  outcome,
  totalPool,
  isSelected,
  onClick,
  disabled,
  showWinner,
}: OutcomeCardProps) {
  const poolAmount = parseFloat(outcome.bettingPool?.totalAmount || '0');
  const betCount = outcome.bettingPool?._count?.bets || 0;
  const poolPercentage = totalPool > 0 ? (poolAmount / totalPool) * 100 : 0;

  const toneColor =
    EMOTIONAL_TONE_COLORS[outcome.emotionalTone] || EMOTIONAL_TONE_COLORS.neutral;

  const isWinner = showWinner && outcome.isSelected;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 text-left transition-all ${toneColor} ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : ''
      } ${isWinner ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background' : ''} ${
        disabled
          ? 'cursor-default opacity-70'
          : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'
      }`}
    >
      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
          <Trophy className="h-3 w-3" />
          Winner
        </div>
      )}

      {/* Option Number */}
      <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-sm font-bold">
        {outcome.optionNumber}
      </div>

      {/* Content */}
      <div className="mt-8">
        <p className="text-lg font-medium leading-relaxed">{outcome.teaserText}</p>

        {/* Emotional Tone */}
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-background/50 px-2 py-1 text-xs capitalize text-muted-foreground">
            {outcome.emotionalTone}
          </span>
        </div>

        {/* Plot Implications */}
        {outcome.plotImplications && outcome.plotImplications.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {outcome.plotImplications.slice(0, 3).map((implication, i) => (
              <span
                key={i}
                className="rounded-full bg-background/30 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {implication}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pool Stats */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              {betCount} bets
            </span>
            <span className="flex items-center gap-1 font-medium text-primary">
              <TrendingUp className="h-3 w-3" />$
              {poolAmount.toLocaleString()}
            </span>
          </div>
          <span className="text-muted-foreground">
            {poolPercentage.toFixed(1)}% of pool
          </span>
        </div>

        {/* Pool Progress Bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/50">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${poolPercentage}%` }}
          />
        </div>
      </div>

      {/* Hover Prompt */}
      {!disabled && !showWinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Predict This Outcome
          </span>
        </div>
      )}
    </button>
  );
}
