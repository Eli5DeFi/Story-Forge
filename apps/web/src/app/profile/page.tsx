'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Wallet,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useUserBetsQuery, useUserStatsQuery } from '@/hooks/useBetting';
import { useNFTBalance, useUserNFTs } from '@/hooks/useContracts';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bets' | 'nfts' | 'stats'>('bets');

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const { data: bets, isLoading: betsLoading } = useUserBetsQuery(address || '');
  const { data: stats, isLoading: statsLoading } = useUserStatsQuery(address || '');
  const { balance: nftBalance } = useNFTBalance();
  const { data: userNFTs } = useUserNFTs();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-600 text-2xl font-bold text-primary-foreground">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {address?.slice(0, 10)}...{address?.slice(-8)}
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{nftBalance}</p>
              <p className="text-xs text-muted-foreground">NFTs Owned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                ${stats?.totalWinnings || '0'}
              </p>
              <p className="text-xs text-muted-foreground">Total Won</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {stats?.winRate?.toFixed(0) || '0'}%
              </p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('bets')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'bets'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wallet className="mr-2 inline-block h-4 w-4" />
          Betting History
        </button>
        <button
          onClick={() => setActiveTab('nfts')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'nfts'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="mr-2 inline-block h-4 w-4" />
          My NFTs ({nftBalance})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'stats'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trophy className="mr-2 inline-block h-4 w-4" />
          Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'bets' && (
          <BettingHistory bets={bets || []} isLoading={betsLoading} />
        )}
        {activeTab === 'nfts' && (
          <NFTCollection tokenIds={userNFTs ? (userNFTs as bigint[]).map(Number) : []} />
        )}
        {activeTab === 'stats' && (
          <UserStatistics stats={stats} isLoading={statsLoading} />
        )}
      </div>
    </div>
  );
}

function BettingHistory({ bets, isLoading }: { bets: any[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Bets Yet</h3>
        <p className="mt-2 text-muted-foreground">
          Start making predictions on story outcomes to see your history here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/stories">Browse Stories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bets.map((bet) => (
        <div
          key={bet.id}
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <Link
                  href={`/stories/${bet.outcome?.chapter?.storyId}`}
                  className="font-medium hover:text-primary"
                >
                  {bet.outcome?.chapter?.story?.title || 'Unknown Story'}
                </Link>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Chapter {bet.outcome?.chapter?.chapterNumber}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Outcome #{bet.outcome?.optionNumber}: {bet.outcome?.teaserText?.slice(0, 60)}...
              </p>
            </div>

            <div className="text-right">
              <p className="font-medium">${bet.amount} {bet.token}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(bet.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2">
              {bet.status === 'WON' ? (
                <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  Won
                </span>
              ) : bet.status === 'LOST' ? (
                <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-500">
                  <TrendingDown className="h-3 w-3" />
                  Lost
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              )}
            </div>

            {bet.payout && parseFloat(bet.payout) > 0 && (
              <span className="text-sm font-medium text-green-500">
                +${bet.payout}
              </span>
            )}

            {bet.transactionHash && (
              <a
                href={`https://basescan.org/tx/${bet.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" />
                View Tx
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function NFTCollection({ tokenIds }: { tokenIds: number[] }) {
  if (!tokenIds || tokenIds.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No NFTs Yet</h3>
        <p className="mt-2 text-muted-foreground">
          Mint unique 1/1 NFTs from story entities in the compendium.
        </p>
        <Button asChild className="mt-6">
          <Link href="/stories">Explore Stories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tokenIds.map((tokenId) => (
        <NFTCard key={tokenId} tokenId={tokenId} />
      ))}
    </div>
  );
}

function NFTCard({ tokenId }: { tokenId: number }) {
  // In a real app, fetch metadata from contract or API
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50">
      <div className="aspect-square bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="flex h-full items-center justify-center">
          <Sparkles className="h-16 w-16 text-primary/50" />
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">Token #{tokenId}</p>
        <p className="mt-1 font-medium">Story Entity</p>
        <a
          href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_NFT_ADDRESS}/${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View on OpenSea
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function UserStatistics({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Bets',
      value: stats?.totalBets || 0,
      icon: Wallet,
      color: 'text-primary',
    },
    {
      label: 'Total Won',
      value: `$${stats?.totalWinnings || '0'}`,
      icon: Trophy,
      color: 'text-green-500',
    },
    {
      label: 'Win Rate',
      value: `${stats?.winRate?.toFixed(1) || '0'}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      label: 'Biggest Win',
      value: `$${stats?.biggestWin || '0'}`,
      icon: Sparkles,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6"
          >
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <p className="mt-4 text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold">Detailed Statistics</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Predictions Won</span>
            <span className="font-medium">{stats?.wins || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Predictions Lost</span>
            <span className="font-medium">{stats?.losses || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pending Predictions</span>
            <span className="font-medium">{stats?.pending || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Wagered</span>
            <span className="font-medium">${stats?.totalWagered || '0'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Net Profit/Loss</span>
            <span
              className={`font-medium ${
                (stats?.netProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              ${stats?.netProfit || '0'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Stories Predicted</span>
            <span className="font-medium">{stats?.uniqueStories || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
