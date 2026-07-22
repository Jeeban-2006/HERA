import apiClient from './client';
import type {
  PeriodLog, PeriodHistoryResponse, CurrentCycleStatus, PeriodSymptom, CyclePrediction
} from '@/types/period.types';

// ── Transformers (snake_case → camelCase, defensive ?? pattern) ───────────────────────

function transformPeriodLog(raw: any): PeriodLog {
  return {
    id: raw.id,
    startDate: raw.start_date ?? raw.startDate,
    endDate: raw.end_date ?? raw.endDate ?? null,
    cycleLength: raw.cycle_length ?? raw.cycleLength ?? null,
    periodLength: raw.period_length ?? raw.periodLength ?? null,
    isActive: raw.is_active ?? raw.isActive ?? false,
    notes: raw.notes ?? null,
    createdAt: raw.created_at ?? raw.createdAt,
  };
}

function transformPrediction(raw: any): CyclePrediction | null {
  if (!raw) return null;
  return {
    nextPeriodDate: raw.next_period_date ?? raw.nextPeriodDate,
    nextPeriodDateRange: {
      earliest: raw.next_period_date_range?.earliest ?? raw.nextPeriodDateRange?.earliest,
      latest:   raw.next_period_date_range?.latest   ?? raw.nextPeriodDateRange?.latest,
    },
    ovulationDate:      raw.ovulation_date ?? raw.ovulationDate,
    fertileWindowStart: raw.fertile_window_start ?? raw.fertileWindowStart,
    fertileWindowEnd:   raw.fertile_window_end   ?? raw.fertileWindowEnd,
    nextPmsWindowStart: raw.next_pms_window_start ?? raw.nextPmsWindowStart,
    predictedCycleLength: raw.predicted_cycle_length ?? raw.predictedCycleLength,
    confidence:         raw.confidence,
    isIrregular:        raw.is_irregular ?? raw.isIrregular ?? false,
    irregularityReason: raw.irregularity_reason ?? raw.irregularityReason ?? null,
  };
}

function transformHistory(raw: any): PeriodHistoryResponse {
  return {
    logs: (raw.logs ?? []).map(transformPeriodLog),
    totalCycles:        raw.total_cycles ?? raw.totalCycles ?? 0,
    averageCycleLength: raw.average_cycle_length ?? raw.averageCycleLength ?? null,
    averagePeriodLength: raw.average_period_length ?? raw.averagePeriodLength ?? null,
    prediction:  transformPrediction(raw.prediction),
    healthScore: raw.health_score ?? raw.healthScore ?? null,
  };
}

function transformCurrentStatus(raw: any): CurrentCycleStatus {
  return {
    cycleDay:         raw.cycle_day ?? raw.cycleDay ?? null,
    phase:            raw.phase ?? null,
    phaseLabel:       raw.phase_label ?? raw.phaseLabel ?? null,
    daysInPhase:      raw.days_in_phase ?? raw.daysInPhase ?? null,
    isMenstruating:   raw.is_menstruating ?? raw.isMenstruating ?? false,
    activePeriodStart: raw.active_period_start ?? raw.activePeriodStart ?? null,
    prediction:       transformPrediction(raw.prediction),
  };
}

function transformSymptom(raw: any): PeriodSymptom {
  return {
    id:            raw.id,
    date:          raw.date,
    flowIntensity: raw.flow_intensity ?? raw.flowIntensity ?? null,
    symptoms:      raw.symptoms ?? [],
    painLevel:     raw.pain_level ?? raw.painLevel ?? null,
  };
}

// ── API calls ─────────────────────────────────────────────────────────────

export const periodApi = {
  startPeriod: async (data: { start_date: string; flow_intensity?: string; notes?: string }) => {
    const res = await apiClient.post('/period/start', data);
    return transformPeriodLog(res.data);
  },

  endPeriod: async (data: { end_date: string }) => {
    const res = await apiClient.post('/period/end', data);
    return transformPeriodLog(res.data);
  },

  logSymptoms: async (data: {
    date: string;
    flow_intensity?: string;
    symptoms?: string[];
    pain_level?: number;
    notes?: string;
  }) => {
    const res = await apiClient.post('/period/symptoms', data);
    return transformSymptom(res.data);
  },

  getHistory: async (): Promise<PeriodHistoryResponse> => {
    const res = await apiClient.get('/period/history');
    return transformHistory(res.data);
  },

  getCurrentStatus: async (): Promise<CurrentCycleStatus> => {
    const res = await apiClient.get('/period/current');
    return transformCurrentStatus(res.data);
  },

  getSymptomsForDate: async (date: string): Promise<PeriodSymptom | null> => {
    try {
      const res = await apiClient.get(`/period/symptoms/${date}`);
      return res.data ? transformSymptom(res.data) : null;
    } catch {
      return null;
    }
  },
};
