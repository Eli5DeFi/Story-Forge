'use client';

import { cn } from '@/lib/utils';
import { CSSProperties, ReactNode } from 'react';

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'holo';
  glow?: boolean;
  corners?: boolean;
  scanLine?: boolean;
  style?: CSSProperties;
}

export function CyberCard({
  children,
  className,
  variant = 'default',
  glow = false,
  corners = false,
  scanLine = false,
  style,
}: CyberCardProps) {
  const variants = {
    default: 'card-cyber',
    glass: 'card-glass',
    holo: 'card-cyber holo-shimmer',
  };

  return (
    <div
      className={cn(
        variants[variant],
        glow && 'glow-cyber',
        corners && 'corner-brackets',
        scanLine && 'scan-line-moving',
        'p-6',
        className
      )}
      style={style}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface CyberCardHeaderProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function CyberCardHeader({
  children,
  className,
  icon,
}: CyberCardHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3 mb-4', className)}>
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded border border-neon-blue/30 bg-neon-blue/10 flex items-center justify-center text-neon-blue">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-medium text-lg tracking-wide">{children}</h3>
        <div className="h-px bg-gradient-to-r from-neon-blue/50 to-transparent mt-2" />
      </div>
    </div>
  );
}

interface CyberCardContentProps {
  children: ReactNode;
  className?: string;
}

export function CyberCardContent({
  children,
  className,
}: CyberCardContentProps) {
  return <div className={cn('relative', className)}>{children}</div>;
}

interface CyberCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CyberCardFooter({
  children,
  className,
}: CyberCardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-neon-blue/10 flex items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}
