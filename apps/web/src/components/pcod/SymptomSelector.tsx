'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { SYMPTOMS_LIST } from '@/lib/mock-data/pcod.mock';

interface SymptomSelectorProps {
  selected: string[];
  onChange: (symptoms: string[]) => void;
}

export function SymptomSelector({ selected, onChange }: SymptomSelectorProps) {
  const toggle = (symptom: string) => {
    onChange(
      selected.includes(symptom)
        ? selected.filter((s) => s !== symptom)
        : [...selected, symptom]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SYMPTOMS_LIST.map((symptom, idx) => {
          const isSelected = selected.includes(symptom);
          return (
            <motion.button
              key={symptom}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(symptom)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-body border transition-all duration-200',
                isSelected
                  ? 'bg-bio-coral/20 border-bio-coral text-bio-coral shadow-glow-coral'
                  : 'bg-white/5 border-white/15 text-text-muted hover:border-white/30 hover:text-text-primary'
              )}
            >
              {symptom}
            </motion.button>
          );
        })}
      </div>
      <p className={cn(
        'text-sm font-body transition-colors',
        selected.length >= 2 ? 'text-bio-teal' : 'text-text-muted'
      )}>
        <span className="font-semibold font-mono">{selected.length}</span> selected
        {selected.length < 2 && ' — select at least 2 to continue'}
        {selected.length >= 2 && ' — ready to continue'}
      </p>
    </div>
  );
}
