'use client';

import { motion } from 'framer-motion';

interface AnalysisProgressProps {
  progress: number;
}

function getStatusMessage(progress: number): string {
  if (progress <= 30) return 'Reading symptom patterns…';
  if (progress <= 60) return 'Analysing lifestyle signals…';
  if (progress <= 89) return 'Cross-referencing lab markers…';
  if (progress < 100) return 'Generating personalised insights…';
  return 'Analysis complete ✓';
}

export function AnalysisProgress({ progress }: AnalysisProgressProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <div className="text-4xl font-mono font-bold text-bio-coral">
          {progress}%
        </div>
        <p className="text-sm font-body text-text-muted">{getStatusMessage(progress)}</p>
      </div>

      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-bio-coral to-bio-gold"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Pulse dots */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-bio-coral"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.33 }}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Symptoms', done: progress >= 30 },
          { label: 'Lifestyle', done: progress >= 60 },
          { label: 'Lab Data', done: progress >= 89 },
          { label: 'Insights', done: progress >= 100 },
        ].map(({ label, done }) => (
          <div key={label} className="space-y-1">
            <div className={`text-lg ${done ? 'text-bio-teal' : 'text-text-muted'}`}>
              {done ? '✓' : '○'}
            </div>
            <div className="text-xs text-text-muted">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
