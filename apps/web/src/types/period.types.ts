export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type PeriodSymptomType =
  | 'cramps' | 'bloating' | 'headache' | 'fatigue'
  | 'mood_swings' | 'back_pain' | 'nausea'
  | 'breast_tenderness' | 'cravings' | 'acne';

export interface PeriodLog {
  id: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
  periodLength: number | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

export interface PeriodSymptom {
  id: string;
  date: string;
  flowIntensity: FlowIntensity | null;
  symptoms: PeriodSymptomType[];
  painLevel: number | null;
}

export interface CyclePrediction {
  nextPeriodDate: string;
  nextPeriodDateRange: { earliest: string; latest: string };
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPmsWindowStart: string;
  predictedCycleLength: number;
  confidence: number;
  isIrregular: boolean;
  irregularityReason: string | null;
}

export interface CycleHealthScore {
  score: number;
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  color: string;
  breakdown: {
    regularity: number;
    duration: number;
    symptoms: number;
    data_completeness: number;
  };
  recommendation: string;
}

export interface PeriodHistoryResponse {
  logs: PeriodLog[];
  totalCycles: number;
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  prediction: CyclePrediction | null;
  healthScore: CycleHealthScore | null;
}

export interface CurrentCycleStatus {
  cycleDay: number | null;
  phase: string | null;
  phaseLabel: string | null;
  daysInPhase: number | null;
  isMenstruating: boolean;
  activePeriodStart: string | null;
  prediction: CyclePrediction | null;
}
