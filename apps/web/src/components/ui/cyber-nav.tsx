'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface CyberNavProps {
  items: NavItem[];
  className?: string;
}

export function CyberNav({ items, className }: CyberNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all',
              'hover:text-neon-blue',
              isActive ? 'text-neon-blue' : 'text-muted-foreground'
            )}
          >
            <span className="relative z-10 flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>

            {/* Active indicator */}
            {isActive && (
              <>
                <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent" />
                <span className="absolute inset-0 bg-neon-blue/5 rounded" />
              </>
            )}

            {/* Hover effect */}
            <span className="absolute inset-0 bg-neon-blue/0 hover:bg-neon-blue/5 rounded transition-colors" />
          </Link>
        );
      })}
    </nav>
  );
}

// Mobile navigation
interface CyberMobileNavProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function CyberMobileNav({
  items,
  isOpen,
  onClose,
}: CyberMobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-void-950/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-72 bg-void-950 border-l border-neon-blue/20 animate-slide-down">
        {/* Header */}
        <div className="p-4 border-b border-neon-blue/20">
          <div className="flex items-center justify-between">
            <span className="hud-element">Navigation</span>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-neon-blue transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  'border border-transparent',
                  isActive
                    ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                    : 'text-muted-foreground hover:text-foreground hover:bg-void-900'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-neon-blue/50 via-neon-purple/50 to-transparent" />
      </div>
    </div>
  );
}

// Header component
interface CyberHeaderProps {
  logo?: ReactNode;
  navItems: NavItem[];
  actions?: ReactNode;
  className?: string;
}

export function CyberHeader({
  logo,
  navItems,
  actions,
  className,
}: CyberHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'bg-void-950/80 backdrop-blur-xl',
        'border-b border-neon-blue/10',
        className
      )}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            {logo}
            <CyberNav items={navItems} className="hidden md:flex" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {actions}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-neon-blue transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <CyberMobileNav
        items={navItems}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </header>
  );
}
