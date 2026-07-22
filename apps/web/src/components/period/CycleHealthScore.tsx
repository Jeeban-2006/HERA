'use client';

import { Lightbulb } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { CycleHealthScore as CycleHealthScoreType } from '@/types/period.types';

const BREAKDOWN_LABELS: Record<string, { label: string; max: number }> = {
  regularity:       { label: 'Regularity',       max: 40 },
  duration:         { label: 'Period Duration',   max: 25 },
  symptoms:         { label: 'Symptom Severity',  max: 20 },
  data_completeness: { label: 'Data Completeness', max: 15 },
};

interface Props { healthScore: CycleHealthScoreType | null | undefined; }

export function CycleHealthScore({ healthScore }: Props) {
  if (!healthScore) {
    return (
      <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[180px] gap-2" glowColor="teal">
        <div className="text-3xl">📊</div>
        <p className="text-text-muted text-sm text-center">Log periods to see your cycle health score</p>
      </GlassCard>
    );
  }

  const size = 120;
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - healthScore.score / 100);

  return (
    <GlassCard className="p-6 space-y-4" glowColor="teal">
      <h3 className="text-sm font-semibold text-bio-teal uppercase tracking-wide">Cycle Health Score</h3>

      {/* Donut chart */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
            <circle
              cx={size/2} cy={size/2} r={r}
              fill="none"
              stroke={healthScore.color}
              strokeWidth={12}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono" style={{ color: healthScore.color }}>
              {healthScore.score}
            </span>
            <span className="text-[10px] text-text-muted" style={{ color: healthScore.color }}>
              {healthScore.label}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2">
        {Object.entries(BREAKDOWN_LABELS).map(([key, meta]) => {
          const val = healthScore.breakdown[key as keyof typeof healthScore.breakdown] ?? 0;
          const pct = (val / meta.max) * 100;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">{meta.label}</span>
                <span className="font-mono" style={{ color: healthScore.color }}>{val}/{meta.max}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: healthScore.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div className="flex gap-2 p-3 rounded-lg bg-white/5 border border-white/8">
        <Lightbulb className="w-4 h-4 text-bio-gold shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted">{healthScore.recommendation}</p>
      </div>
    </GlassCard>
  );
}
