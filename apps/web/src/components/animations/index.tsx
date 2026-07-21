'use client';

import React from 'react';
import { cn } from '@/lib/cn';

interface GlowingBadgeProps {
  children: React.ReactNode;
  color?: 'teal' | 'coral' | 'gold' | 'violet';
  className?: string;
}

export function GlowingBadge({ children, color = 'teal', className }: GlowingBadgeProps) {
  const colorClasses = {
    teal: 'border-bio-teal text-bio-teal glow-teal',
    coral: 'border-bio-coral text-bio-coral glow-coral',
    gold: 'border-bio-gold text-bio-gold glow-gold',
    violet: 'border-bio-violet text-bio-violet glow-violet',
  };

  return (
    <div
      className={cn(
        'px-4 py-2 rounded-full border text-sm font-medium font-body backdrop-blur-glass transition-all duration-300 hover:shadow-lg',
        colorClasses[color],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ShimmerLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function ShimmerLoader({
  width = '100%',
  height = '20px',
  className,
  count = 3,
}: ShimmerLoaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            backgroundImage: `linear-gradient(
              90deg,
              rgba(11, 17, 32, 0.8) 0%,
              rgba(11, 17, 32, 0.5) 20%,
              rgba(11, 17, 32, 0.8) 40%
            )`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
          className="rounded-lg"
        />
      ))}
    </div>
  );
}

export function ScrollIndicator() {
  return (
    <div className="flex flex-col items-center gap-2 animate-bounce-subtle">
      <div className="text-xs font-mono text-text-muted uppercase tracking-widest">Scroll</div>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-bio-teal"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
