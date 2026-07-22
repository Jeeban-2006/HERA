import type { PeriodLog, PeriodHistoryResponse, CurrentCycleStatus, CyclePrediction } from '@/types/period.types';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const MOCK_LOGS: PeriodLog[] = [
  {
    id: 'log-1',
    startDate: fmt(addDays(today, -28)),
    endDate: fmt(addDays(today, -23)),
    cycleLength: 28,
    periodLength: 5,
    isActive: false,
    notes: null,
    createdAt: fmt(addDays(today, -28)),
  },
  {
    id: 'log-2',
    startDate: fmt(today),
    endDate: null,
    cycleLength: null,
    periodLength: null,
    isActive: true,
    notes: null,
    createdAt: fmt(today),
  },
];

const MOCK_PREDICTION: CyclePrediction = {
  nextPeriodDate: fmt(addDays(today, 23)),
  nextPeriodDateRange: {
    earliest: fmt(addDays(today, 20)),
    latest: fmt(addDays(today, 26)),
  },
  ovulationDate: fmt(addDays(today, 9)),
  fertileWindowStart: fmt(addDays(today, 7)),
  fertileWindowEnd: fmt(addDays(today, 11)),
  nextPmsWindowStart: fmt(addDays(today, 16)),
  predictedCycleLength: 28,
  confidence: 0.82,
  isIrregular: false,
  irregularityReason: null,
};

export const MOCK_PERIOD_HISTORY: PeriodHistoryResponse = {
  logs: MOCK_LOGS,
  totalCycles: 2,
  averageCycleLength: 28,
  averagePeriodLength: 5,
  prediction: MOCK_PREDICTION,
  healthScore: {
    score: 78,
    label: 'Good',
    color: '#FFD166',
    breakdown: { regularity: 32, duration: 25, symptoms: 12, data_completeness: 9 },
    recommendation: 'Your cycle is fairly regular. Track a few more cycles to improve accuracy.',
  },
};

export const MOCK_CURRENT_STATUS: CurrentCycleStatus = {
  cycleDay: 2,
  phase: 'menstrual',
  phaseLabel: 'Menstrual',
  daysInPhase: 2,
  isMenstruating: true,
  activePeriodStart: fmt(today),
  prediction: MOCK_PREDICTION,
};
