'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, CalendarDays } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useStartPeriod, useEndPeriod } from '@/hooks/usePeriod';
import type { FlowIntensity, CurrentCycleStatus } from '@/types/period.types';

const FLOW_OPTIONS: { value: FlowIntensity; label: string; color: string }[] = [
  { value: 'spotting', label: 'Spotting', color: '#FF5F7E30' },
  { value: 'light',    label: 'Light',    color: '#FF5F7E55' },
  { value: 'medium',   label: 'Medium',   color: '#FF5F7E99' },
  { value: 'heavy',    label: 'Heavy',    color: '#FF5F7ECC' },
];

interface LogPeriodModalProps {
  mode: 'start' | 'end';
  currentStatus: CurrentCycleStatus | undefined;
  onClose: () => void;
}

export function LogPeriodModal({ mode, currentStatus, onClose }: LogPeriodModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [flow, setFlow] = useState<FlowIntensity>('medium');
  const [notes, setNotes] = useState('');
  const [currentMode, setCurrentMode] = useState<'start' | 'end'>(mode);

  const startMutation = useStartPeriod();
  const endMutation = useEndPeriod();

  const isLoading = startMutation.isPending || endMutation.isPending;

  const handleSubmit = async () => {
    try {
      if (currentMode === 'start') {
        await startMutation.mutateAsync({
          start_date: selectedDate,
          flow_intensity: flow,
          notes: notes || undefined,
        });
      } else {
        await endMutation.mutateAsync({ end_date: selectedDate });
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const endDate = selectedDate;
  const startDate = currentStatus?.activePeriodStart;
  const duration = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : null;

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
          className="bg-surface border border-bio-coral/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-bio-coral" />
              <h2 className="text-lg font-display font-bold">
                {currentMode === 'start' ? 'Log Period Start' : 'Log Period End'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active period notice */}
          {currentStatus?.isMenstruating && (
            <div className="mb-4 p-3 rounded-lg bg-bio-coral/10 border border-bio-coral/20">
              <p className="text-sm text-bio-coral">
                Active period started: <strong>{currentStatus.activePeriodStart}</strong>
              </p>
              {currentMode === 'start' && (
                <button
                  onClick={() => setCurrentMode('end')}
                  className="text-xs text-bio-coral/70 underline mt-1 hover:text-bio-coral"
                >
                  Switch to End Period →
                </button>
              )}
            </div>
          )}

          {/* Date picker */}
          <div className="mb-5">
            <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">
              <CalendarDays className="inline w-3 h-3 mr-1" />
              {currentMode === 'start' ? 'Period start date' : 'Period end date'}
            </label>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-text-primary focus:border-bio-coral/60 focus:outline-none transition-all"
            />
          </div>

          {/* Flow intensity (start mode only) */}
          {currentMode === 'start' && (
            <div className="mb-5">
              <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">Flow intensity</label>
              <div className="flex gap-2">
                {FLOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFlow(opt.value)}
                    className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold border transition-all ${
                      flow === opt.value
                        ? 'border-bio-coral text-bio-coral'
                        : 'border-white/10 text-text-muted hover:border-bio-coral/40'
                    }`}
                    style={flow === opt.value ? { background: opt.color } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration preview (end mode) */}
          {currentMode === 'end' && duration && (
            <div className="mb-5 p-3 rounded-lg bg-bio-coral/5 border border-bio-coral/15 text-center">
              <p className="text-sm text-bio-coral">That's <strong>{duration} days</strong></p>
            </div>
          )}

          {/* Notes */}
          {currentMode === 'start' && (
            <div className="mb-5">
              <label className="block text-xs text-text-muted uppercase tracking-wide mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes..."
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-bio-coral/60 focus:outline-none resize-none transition-all"
              />
            </div>
          )}

          {/* Action button */}
          <GlowButton
            accent="coral"
            className="w-full"
            loading={isLoading}
            onClick={handleSubmit}
          >
            {currentMode === 'start' ? 'Log Period Start' : 'Log Period End'}
          </GlowButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
