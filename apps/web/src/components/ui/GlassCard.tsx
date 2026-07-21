import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type GlowColor = 'teal' | 'coral' | 'gold' | 'violet';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: GlowColor;
  onClick?: () => void;
}

const glowBorders: Record<GlowColor, string> = {
  teal: 'border-bio-teal/30 hover:border-bio-teal/60 hover:shadow-glow-teal',
  coral: 'border-bio-coral/30 hover:border-bio-coral/60 hover:shadow-glow-coral',
  gold: 'border-bio-gold/30 hover:border-bio-gold/60 hover:shadow-glow-gold',
  violet: 'border-bio-violet/30 hover:border-bio-violet/60 hover:shadow-glow-violet',
};

export function GlassCard({ children, className, glowColor, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface border border-white/8 rounded-2xl transition-all duration-300',
        glowColor && glowBorders[glowColor],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
