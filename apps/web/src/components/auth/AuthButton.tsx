'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Loader2, LogOut, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export function AuthButton() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, isAuthenticating, login, logout, user, error } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Not connected - show connect button
  if (!isConnected) {
    return <ConnectButton />;
  }

  // Connected but not authenticated - show sign in button
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal }) => (
            <button
              onClick={openAccountModal}
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
            >
              <Wallet className="h-4 w-4" />
              {account?.displayName}
            </button>
          )}
        </ConnectButton.Custom>

        <Button onClick={login} disabled={isAuthenticating}>
          {isAuthenticating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  }

  // Fully authenticated
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm transition-colors hover:bg-muted/80"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden sm:inline">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="font-mono text-sm">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>

            <div className="mt-2 space-y-1">
              <a
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <User className="h-4 w-4" />
                My Profile
              </a>
              <a
                href="/my-bets"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <Wallet className="h-4 w-4" />
                My Bets
              </a>
              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
