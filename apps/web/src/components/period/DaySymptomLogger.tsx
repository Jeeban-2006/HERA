'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useLogSymptoms } from '@/hooks/usePeriod';
import type { FlowIntensity, PeriodSymptomType } from '@/types/period.types';

const SYMPTOM_OPTIONS: { id: PeriodSymptomType; label: string; emoji: string }[] = [
  { id: 'cramps',            label: 'Cramps',            emoji: '🤕' },
  { id: 'bloating',          label: 'Bloating',          emoji: '😮💨' },
  { id: 'headache',          label: 'Headache',          emoji: '🤯' },
  { id: 'fatigue',           label: 'Fatigue',           emoji: '😴' },
  { id: 'mood_swings',       label: 'Mood Swings',       emoji: '😤' },
  { id: 'back_pain',         label: 'Back Pain',         emoji: '🔙' },
  { id: 'nausea',            label: 'Nausea',            emoji: '🤢' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', emoji: '🫖' },
  { id: 'cravings',          label: 'Cravings',          emoji: '🍫' },
  { id: 'acne',              label: 'Acne',              emoji: '😰' },
];

const FLOW_OPTIONS: { value: FlowIntensity; label: string }[] = [
  { value: 'none',     label: 'None'     },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light',    label: 'Light'    },
  { value: 'medium',   label: 'Medium'   },
  { value: 'heavy',    label: 'Heavy'    },
];

const PAIN_EMOJI = (v: number) => v <= 3 ? '😊' : v <= 6 ? '😐' : '😣';

interface DaySymptomLoggerProps {
  date: string;
  onClose: () => void;
}

export function DaySymptomLogger({ date, onClose }: DaySymptomLoggerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<PeriodSymptomType[]>([]);
  const [flow, setFlow] = useState<FlowIntensity>('medium');
  const [painLevel, setPainLevel] = useState(4);
  const [notes, setNotes] = useState('');

  const logMutation = useLogSymptoms();

  const toggleSymptom = (id: PeriodSymptomType) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    await logMutation.mutateAsync({
      date,
      flow_intensity: flow,
      symptoms: selectedSymptoms,
      pain_level: painLevel,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-surface border border-bio-coral/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-bold">Log Symptoms — {date}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Flow intensity */}
          <div className="mb-5">
            <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">Flow intensity</label>
            <div className="flex gap-2 flex-wrap">
              {FLOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFlow(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    flow === opt.value
                      ? 'border-bio-coral bg-bio-coral/20 text-bio-coral'
                      : 'border-white/10 text-text-muted hover:border-bio-coral/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom grid */}
          <div className="mb-5">
            <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">Symptoms</label>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`p-2.5 rounded-lg border text-left text-sm transition-all flex items-center gap-2 ${
                    selectedSymptoms.includes(s.id)
                      ? 'border-bio-coral/60 bg-bio-coral/10 text-bio-coral'
                      : 'border-white/10 text-text-muted hover:border-white/20'
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span className="text-xs">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pain level */}
          <div className="mb-5">
            <label className="block text-xs text-text-muted uppercase tracking-wide mb-3">
              Pain level — {PAIN_EMOJI(painLevel)} {painLevel}/10
            </label>
            <div className="relative h-2 rounded-full bg-white/10">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-bio-coral transition-all"
                style={{ width: `${(painLevel - 1) / 9 * 100}%` }}
              />
              <input
                type="range" min={1} max={10} value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Mild</span><span>Severe</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling?"
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-bio-coral/60 focus:outline-none resize-none transition-all"
            />
          </div>

          <GlowButton
            accent="coral" className="w-full"
            loading={logMutation.isPending}
            onClick={handleSave}
          >
            Save Day Log
          </GlowButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
