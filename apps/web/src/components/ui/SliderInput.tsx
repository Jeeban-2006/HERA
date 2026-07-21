'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SliderInputProps {
  label: string;
  icon: LucideIcon;
  value: number;
  min: number;
  max: number;
  unit: string;
  accentColor: string;
  onChange: (value: number) => void;
}

export function SliderInput({ label, icon: Icon, value, min, max, unit, accentColor, onChange }: SliderInputProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-sm font-body text-text-primary">{label}</span>
        </div>
        <span className="text-sm font-mono font-semibold" style={{ color: accentColor }}>
          {value} {unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-2 rounded-full transition-all duration-150"
          style={{ width: `${percentage}%`, backgroundColor: accentColor }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
          )}
          style={{ zIndex: 10 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-surface shadow-lg pointer-events-none transition-all duration-150"
          style={{
            left: `calc(${percentage}% - 8px)`,
            borderColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}60`,
          }}
        />
      </div>
    </div>
  );
}
