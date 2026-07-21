import type { MoodLog, CorrelationResult, CyclePhase, MoodState } from '@/types/mood.types';

const MOOD_STATES: MoodState[] = ['Radiant','Calm','Tired','Anxious','Sad','Irritable','Focused','Energized'];

function getPhase(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 14) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

function getMoodScore(cycleDay: number): number {
  if (cycleDay <= 5) return Math.floor(Math.random() * 3) + 3;
  if (cycleDay <= 14) return Math.floor(Math.random() * 3) + 7;
  if (cycleDay <= 16) return Math.floor(Math.random() * 2) + 8;
  return Math.floor(Math.random() * 4) + 3;
}

function getMoodState(cycleDay: number): MoodState {
  if (cycleDay <= 5) return cycleDay % 2 === 0 ? 'Tired' : 'Sad';
  if (cycleDay <= 14) return cycleDay % 3 === 0 ? 'Energized' : 'Focused';
  if (cycleDay <= 16) return 'Radiant';
  return cycleDay % 3 === 0 ? 'Anxious' : 'Irritable';
}

export const MOCK_MOOD_LOGS: MoodLog[] = Array.from({ length: 45 }, (_, i) => {
  const daysAgo = 44 - i;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const cycleDay = ((i % 28) + 1);
  const score = getMoodScore(cycleDay);
  return {
    date: d.toISOString().split('T')[0],
    moodScore: score,
    moodState: getMoodState(cycleDay),
    energyLevel: Math.max(1, Math.min(10, score + Math.floor(Math.random() * 3) - 1)),
    cycleDay,
    phase: getPhase(cycleDay),
  };
});

export const MOCK_CORRELATION: CorrelationResult = {
  correlationScore: 0.74,
  patternDetected: true,
  phaseAverages: [
    { phase: 'menstrual', avgMood: 4.1, avgEnergy: 3.8, daysLogged: 5 },
    { phase: 'follicular', avgMood: 7.8, avgEnergy: 7.4, daysLogged: 9 },
    { phase: 'ovulation', avgMood: 8.9, avgEnergy: 8.6, daysLogged: 2 },
    { phase: 'luteal', avgMood: 4.6, avgEnergy: 4.2, daysLogged: 12 },
  ],
  pmsDays: [
    new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
  ],
  peakEnergyWindow: { startDay: 8, endDay: 14 },
  insights: [
    {
      type: 'peak',
      title: 'Peak Energy Window',
      message: 'Days 8–14 of your cycle show consistently high energy. Schedule demanding tasks here.',
      confidence: 89,
      sparkline: [5, 6, 7, 8, 9, 9, 8, 7, 6, 5],
    },
    {
      type: 'pms_risk',
      title: 'PMS Risk Ahead',
      message: 'Based on your pattern, elevated PMS symptoms expected in 4–6 days. Reduce caffeine and increase magnesium.',
      confidence: 76,
      sparkline: [7, 6, 5, 4, 3, 3, 4, 5, 6, 7],
    },
    {
      type: 'stress',
      title: 'Luteal Stress Pattern',
      message: 'Your mood consistently drops 60% in the luteal phase. This strongly correlates with progesterone fluctuation.',
      confidence: 82,
      sparkline: [8, 7, 6, 5, 4, 3, 3, 4, 5, 6],
    },
  ],
  trendData: MOCK_MOOD_LOGS,
};
