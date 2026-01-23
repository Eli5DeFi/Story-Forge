import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, decimals = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function calculateOdds(
  outcomeDeposits: number,
  totalDeposits: number
): number {
  if (outcomeDeposits === 0) return 0;
  return totalDeposits / outcomeDeposits;
}

export function calculatePercentage(
  outcomeDeposits: number,
  totalDeposits: number
): number {
  if (totalDeposits === 0) return 0;
  return (outcomeDeposits / totalDeposits) * 100;
}

export function calculatePotentialWinnings(
  betAmount: number,
  outcomeDeposits: number,
  totalDeposits: number,
  winnerPercentage = 0.85
): number {
  if (outcomeDeposits === 0) return 0;
  const totalPrize = totalDeposits * winnerPercentage;
  return (betAmount / outcomeDeposits) * totalPrize;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
