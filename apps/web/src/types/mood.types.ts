export type MoodState = 'Radiant' | 'Calm' | 'Tired' | 'Anxious' | 'Sad' | 'Irritable' | 'Focused' | 'Energized';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface MoodLog {
  date: string;
  moodScore: number;
  moodState: MoodState;
  energyLevel: number;
  cycleDay: number;
  phase: CyclePhase;
}

export interface PhaseAverage {
  phase: CyclePhase;
  avgMood: number;
  avgEnergy: number;
  daysLogged: number;
}

export interface MoodInsight {
  type: 'peak' | 'pms_risk' | 'pattern' | 'stress';
  title: string;
  message: string;
  confidence: number;
  sparkline: number[];
}

export interface CorrelationResult {
  correlationScore: number;
  patternDetected: boolean;
  phaseAverages: PhaseAverage[];
  pmsDays: string[];
  peakEnergyWindow: { startDay: number; endDay: number };
  insights: MoodInsight[];
  trendData: MoodLog[];
}
