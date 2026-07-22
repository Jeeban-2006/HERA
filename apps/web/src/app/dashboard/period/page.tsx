'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { CycleRing } from '@/components/period/CycleRing';
import { PredictionCard } from '@/components/period/PredictionCard';
import { CycleHealthScore } from '@/components/period/CycleHealthScore';
import { PeriodCalendar } from '@/components/period/PeriodCalendar';
import { LogPeriodModal } from '@/components/period/LogPeriodModal';
import { DaySymptomLogger } from '@/components/period/DaySymptomLogger';
import { useCurrentCycle, usePeriodHistory } from '@/hooks/usePeriod';
import { Loader2 } from 'lucide-react';

export default function PeriodPage() {
  const [showLogModal, setShowLogModal] = useState(false);
  const [logModalMode, setLogModalMode] = useState<'start' | 'end'>('start');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: currentStatus, isLoading: isStatusLoading } = useCurrentCycle();
  const { data: history, isLoading: isHistoryLoading } = usePeriodHistory();

  const handleLogFab = () => {
    if (currentStatus?.isMenstruating) {
      setLogModalMode('end');
    } else {
      setLogModalMode('start');
    }
    setShowLogModal(true);
  };

  const handleDayClick = (iso: string, inPeriod: boolean) => {
    if (inPeriod) {
      setSelectedDate(iso);
    } else {
      setLogModalMode('start');
      setShowLogModal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full border border-bio-coral/40 text-bio-coral text-xs font-semibold">
            🔴 Module 05
          </span>
        </div>
        <h1 className="text-4xl font-display font-bold">
          Period <span className="text-bio-coral">Tracker</span>
        </h1>
        <p className="text-text-muted">Your cycle, charted and predicted with care.</p>
      </motion.div>

      {/* Top row: 3 widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cycle ring */}
        <GlassCard className="p-6 flex flex-col items-center" glowColor="coral">
          {isStatusLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-bio-coral" />
            </div>
          ) : (
            <CycleRing status={currentStatus} size={200} />
          )}
        </GlassCard>

        {/* Prediction */}
        <PredictionCard prediction={history?.prediction ?? currentStatus?.prediction} />

        {/* Health score */}
        <CycleHealthScore healthScore={history?.healthScore} />
      </div>

      {/* Calendar section */}
      <GlassCard className="p-6" glowColor="coral">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold">Cycle Calendar</h2>
          <GlowButton accent="coral" size="sm" onClick={handleLogFab}>
            <Plus className="w-4 h-4" />
            {currentStatus?.isMenstruating ? 'End Period' : 'Log Period'}
          </GlowButton>
        </div>
        <PeriodCalendar
          logs={history?.logs ?? []}
          prediction={history?.prediction ?? currentStatus?.prediction}
          onDayClick={handleDayClick}
        />
      </GlassCard>

      {/* History table */}
      <GlassCard className="p-6" glowColor="coral">
        <h2 className="text-lg font-display font-bold mb-4">Past Cycles</h2>
        {isHistoryLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-bio-coral" />
          </div>
        ) : !history?.logs.length ? (
          <div className="text-center py-8 text-text-muted">
            <Droplets className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No periods logged yet — tap 'Log Period' to start</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-text-muted text-xs uppercase tracking-wide">
                  <th className="pb-2 text-left">Start Date</th>
                  <th className="pb-2 text-left">End Date</th>
                  <th className="pb-2 text-left">Duration</th>
                  <th className="pb-2 text-left">Cycle Length</th>
                  <th className="pb-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.logs.map((log) => (
                  <tr key={log.id} className="py-3">
                    <td className="py-2.5 font-mono text-text-primary">{log.startDate}</td>
                    <td className="py-2.5 font-mono text-text-muted">{log.endDate ?? '—'}</td>
                    <td className="py-2.5 text-text-muted">
                      {log.periodLength ? `${log.periodLength} days` : '—'}
                    </td>
                    <td className="py-2.5 text-text-muted">
                      {log.cycleLength ? `${log.cycleLength} days` : '—'}
                    </td>
                    <td className="py-2.5">
                      {log.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-bio-coral/15 text-bio-coral text-xs border border-bio-coral/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-bio-teal/10 text-bio-teal text-xs border border-bio-teal/20">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary stats */}
        {history && (
          <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-mono font-bold text-bio-coral">
                {history.averageCycleLength ?? '—'}
              </div>
              <div className="text-xs text-text-muted">Avg cycle (days)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-mono font-bold text-bio-coral">
                {history.averagePeriodLength ?? '—'}
              </div>
              <div className="text-xs text-text-muted">Avg duration (days)</div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Modals */}
      {showLogModal && (
        <LogPeriodModal
          mode={logModalMode}
          currentStatus={currentStatus}
          onClose={() => setShowLogModal(false)}
        />
      )}
      {selectedDate && (
        <DaySymptomLogger
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
