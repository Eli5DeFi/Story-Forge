'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DataPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  status?: 'online' | 'offline' | 'warning';
}

export function DataPanel({
  children,
  className,
  title,
  status,
}: DataPanelProps) {
  const statusColors = {
    online: 'bg-neon-green',
    offline: 'bg-red-500',
    warning: 'bg-neon-orange',
  };

  return (
    <div
      className={cn(
        'relative p-4 rounded border border-neon-blue/20 bg-void-950/60 backdrop-blur-sm',
        className
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />

      {/* Header */}
      {(title || status) && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neon-blue/10">
          {title && (
            <span className="hud-element text-xs uppercase tracking-widest">
              {title}
            </span>
          )}
          {status && (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full animate-pulse',
                  statusColors[status]
                )}
                style={{
                  boxShadow: `0 0 8px ${status === 'online' ? '#00ff9f' : status === 'offline' ? '#ff4444' : '#ff6b00'}`,
                }}
              />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {status}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative">{children}</div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-neon-blue/30" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-neon-blue/30" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-neon-blue/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-neon-blue/30" />
    </div>
  );
}

interface DataRowProps {
  label: string;
  value: ReactNode;
  className?: string;
  highlight?: boolean;
}

export function DataRow({ label, value, className, highlight }: DataRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2',
        highlight && 'bg-neon-blue/5 -mx-2 px-2 rounded',
        className
      )}
    >
      <span className="data-label">{label}</span>
      <span className={cn('data-value', highlight && 'text-neon-blue')}>
        {value}
      </span>
    </div>
  );
}

interface DataGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DataGrid({ children, columns = 2, className }: DataGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}: StatCardProps) {
  const changeColors = {
    positive: 'text-neon-green',
    negative: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border border-neon-blue/10 bg-void-950/40',
        'hover:border-neon-blue/30 transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-neon-blue/60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono text-neon-blue">
          {value}
        </span>
        {change && (
          <span className={cn('text-xs mb-1', changeColors[changeType])}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

// Progress bar with cyber styling
interface CyberProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  variant?: 'default' | 'gradient' | 'segmented';
}

export function CyberProgress({
  value,
  max = 100,
  label,
  showValue = true,
  className,
  variant = 'default',
}: CyberProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          )}
          {showValue && (
            <span className="font-mono text-neon-blue">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="progress-cyber">
        <div
          className={cn(
            'h-full transition-all duration-500',
            variant === 'gradient' &&
              'bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue',
            variant === 'segmented' && 'bg-neon-blue'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
