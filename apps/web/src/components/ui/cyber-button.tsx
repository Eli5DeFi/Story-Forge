'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyber' | 'neon' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  (
    {
      children,
      className,
      variant = 'cyber',
      size = 'md',
      glow = false,
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      cyber: 'btn-cyber text-foreground',
      neon: 'btn-neon rounded-lg',
      ghost:
        'bg-transparent border border-neon-blue/20 hover:border-neon-blue/50 hover:bg-neon-blue/10 rounded-lg transition-all',
      gold: 'bg-gradient-to-r from-gold-500 to-gold-600 text-black font-semibold rounded-lg hover:shadow-neon-gold transition-all',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          variants[variant],
          sizes[size],
          glow && 'animate-glow-pulse',
          disabled && 'opacity-50 cursor-not-allowed',
          loading && 'relative',
          className
        )}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </span>
        )}
        <span className={cn(loading && 'invisible')}>{children}</span>
      </button>
    );
  }
);

CyberButton.displayName = 'CyberButton';

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Icon button variant
interface CyberIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const CyberIconButton = forwardRef<
  HTMLButtonElement,
  CyberIconButtonProps
>(({ icon, className, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'flex items-center justify-center rounded-lg',
        'border border-neon-blue/30 bg-neon-blue/5',
        'hover:border-neon-blue/60 hover:bg-neon-blue/10',
        'text-neon-blue transition-all',
        'hover:shadow-neon-sm',
        sizes[size],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
});

CyberIconButton.displayName = 'CyberIconButton';
