'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Moon, Zap, Activity, Droplets, FlaskConical } from 'lucide-react';
import type { PCODFormState } from '@/types/pcod.types';

interface ReviewStepProps {
  formData: PCODFormState;
  onRunAnalysis: () => void;
  isAnalysing: boolean;
}

export function ReviewStep({ formData, onRunAnalysis, isAnalysing }: ReviewStepProps) {
  const { symptoms, lifestyle, labValues } = formData;
  const hasLabValues = Object.values(labValues).some((v) => v.trim() !== '');

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-bio-coral mb-3 uppercase tracking-wide">
          Symptoms ({symptoms.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {symptoms.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-bio-coral/10 text-bio-coral border border-bio-coral/20">
              {s}
            </span>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-bio-teal mb-3 uppercase tracking-wide">Lifestyle</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Moon, label: 'Sleep', value: `${lifestyle.sleep} hrs` },
            { icon: Zap, label: 'Stress', value: `${lifestyle.stress}/10` },
            { icon: Activity, label: 'Exercise', value: `${lifestyle.exercise} days/wk` },
            { icon: Droplets, label: 'Water', value: `${lifestyle.water} glasses` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-bio-teal flex-shrink-0" />
              <div>
                <div className="text-xs text-text-muted">{label}</div>
                <div className="text-sm font-mono text-text-primary">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {hasLabValues && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-bio-gold mb-3 uppercase tracking-wide flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> Lab Values
          </h3>
          <div className="space-y-1">
            {Object.entries(labValues).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-mono text-text-primary">{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <motion.button
        onClick={onRunAnalysis}
        disabled={isAnalysing}
        whileHover={isAnalysing ? {} : { y: -2 }}
        whileTap={isAnalysing ? {} : { scale: 0.97 }}
        className="w-full py-4 rounded-xl bg-bio-coral text-void font-bold font-body text-base hover:shadow-glow-coral transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalysing ? 'Analysing…' : '🧬 Run PCOD Analysis'}
      </motion.button>
    </div>
  );
}
