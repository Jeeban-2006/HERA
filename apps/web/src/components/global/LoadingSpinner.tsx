'use client';

import React from 'react';
import { DNAHelix } from '@/components/animations/DNAHelix';
import { cn } from '@/lib/cn';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 60,
  color = '#00FFD1',
  text,
  fullscreen,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <DNAHelix size={size} color={color} />
      {text && (
        <div className="text-center">
          <p className="text-sm font-mono text-text-muted">{text}</p>
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {content}
    </div>
  );
}

interface OfflineBannerProps {
  isOffline: boolean;
}

export function OfflineBanner({ isOffline }: OfflineBannerProps) {
  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-bio-coral/10 border-b border-bio-coral/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-bio-coral animate-pulse" />
        <p className="text-sm font-body text-bio-coral">
          You are currently offline. Some features may be unavailable.
        </p>
      </div>
    </div>
  );
}
