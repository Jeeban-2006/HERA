'use client';

import { CalendarDays, Leaf, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { CyclePrediction } from '@/types/period.types';

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(s: string) {
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);
}

function confidenceColor(c: number): string {
  if (c >= 0.75) return '#00FFD1';
  if (c >= 0.55) return '#FFD166';
  return '#FF5F7E';
}

interface PredictionCardProps {
  prediction: CyclePrediction | null | undefined;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) {
    return (
      <GlassCard className="p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[180px]" glowColor="coral">
        <CalendarDays className="w-8 h-8 text-bio-coral/40" />
        <p className="text-text-muted text-sm">Log 2 periods to unlock predictions</p>
        <p className="text-xs text-text-muted/60">
          Your next period, fertile window, and PMS window will appear here
        </p>
      </GlassCard>
    );
  }

  const daysAway = daysUntil(prediction.nextPeriodDate);
  const fertileStart = fmtDate(prediction.fertileWindowStart);
  const fertileEnd = fmtDate(prediction.fertileWindowEnd);
  const pmsStart = fmtDate(prediction.nextPmsWindowStart);
  const pmsDays = daysUntil(prediction.nextPmsWindowStart);
  const confColor = confidenceColor(prediction.confidence);

  return (
    <GlassCard className="p-6 space-y-4" glowColor="coral">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bio-coral uppercase tracking-wide">Next Period</h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full border font-mono"
          style={{ color: confColor, borderColor: confColor + '40', background: confColor + '15' }}
        >
          {Math.round(prediction.confidence * 100)}% confidence
        </span>
      </div>

      {/* Countdown */}
      <div>
        <div className="text-4xl font-mono font-bold text-bio-coral">
          {daysAway > 0 ? `${daysAway}` : 'Today'}
          {daysAway > 0 && <span className="text-base ml-1 font-normal text-text-muted">days</span>}
        </div>
        <p className="text-xs text-text-muted mt-0.5">
          {fmtDate(prediction.nextPeriodDate)} ± 3 days
        </p>
      </div>

      {/* Irregular warning */}
      {prediction.isIrregular && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-bio-gold/10 border border-bio-gold/20">
          <AlertCircle className="w-3.5 h-3.5 text-bio-gold shrink-0 mt-0.5" />
          <p className="text-xs text-bio-gold">{prediction.irregularityReason}</p>
        </div>
      )}

      <div className="border-t border-white/8 pt-3 space-y-2">
        {/* Fertile window */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-bio-teal" />
            <span className="text-xs text-text-muted">Fertile window</span>
          </div>
          <span className="text-xs text-bio-teal font-mono">{fertileStart} – {fertileEnd}</span>
        </div>

        {/* Ovulation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-bio-gold" />
            <span className="text-xs text-text-muted">Ovulation</span>
          </div>
          <span className="text-xs text-bio-gold font-mono">{fmtDate(prediction.ovulationDate)}</span>
        </div>

        {/* PMS window */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-bio-violet" />
            <span className="text-xs text-text-muted">PMS window</span>
          </div>
          <span className="text-xs text-bio-violet font-mono">
            {pmsStart} ({pmsDays > 0 ? `in ${pmsDays}d` : 'now'})
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
