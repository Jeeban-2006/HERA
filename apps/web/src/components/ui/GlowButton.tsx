'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type AccentColor = 'teal' | 'coral' | 'gold' | 'violet';

interface GlowButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  accent?: AccentColor;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const variantClasses: Record<Variant, Record<AccentColor, string>> = {
  primary: {
    teal: 'bg-bio-teal text-void hover:shadow-glow-teal',
    coral: 'bg-bio-coral text-void hover:shadow-glow-coral',
    gold: 'bg-bio-gold text-void hover:shadow-glow-gold',
    violet: 'bg-bio-violet text-white hover:shadow-glow-violet',
  },
  ghost: {
    teal: 'border border-bio-teal/50 text-bio-teal hover:bg-bio-teal/10 hover:border-bio-teal',
    coral: 'border border-bio-coral/50 text-bio-coral hover:bg-bio-coral/10 hover:border-bio-coral',
    gold: 'border border-bio-gold/50 text-bio-gold hover:bg-bio-gold/10 hover:border-bio-gold',
    violet: 'border border-bio-violet/50 text-bio-violet hover:bg-bio-violet/10 hover:border-bio-violet',
  },
  danger: {
    teal: 'bg-bio-coral text-void hover:shadow-glow-coral',
    coral: 'bg-bio-coral text-void hover:shadow-glow-coral',
    gold: 'bg-bio-coral text-void hover:shadow-glow-coral',
    violet: 'bg-bio-coral text-void hover:shadow-glow-coral',
  },
};

export function GlowButton({
  children, variant = 'primary', size = 'md', accent = 'teal',
  onClick, disabled, loading, className, type = 'button',
}: GlowButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      className={cn(
        'rounded-xl font-body font-semibold transition-all duration-300 flex items-center justify-center gap-2',
        sizeClasses[size],
        variantClasses[variant][accent],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
