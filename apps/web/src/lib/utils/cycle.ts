import type { CyclePhase } from '@/types/mood.types';

export function getCyclePhase(cycleDay: number): CyclePhase {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 14) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

export function getCycleColor(phase: CyclePhase): string {
  const colors: Record<CyclePhase, string> = {
    menstrual: '#FF5F7E',
    follicular: '#00FFD1',
    ovulation: '#FFD166',
    luteal: '#9B5DE5',
  };
  return colors[phase];
}

export function getPhaseLabel(phase: CyclePhase): string {
  const labels: Record<CyclePhase, string> = {
    menstrual: 'Menstrual',
    follicular: 'Follicular',
    ovulation: 'Ovulation',
    luteal: 'Luteal',
  };
  return labels[phase];
}

export function getDaysUntilNextPhase(cycleDay: number): number {
  if (cycleDay <= 5) return 5 - cycleDay + 1;
  if (cycleDay <= 14) return 14 - cycleDay + 1;
  if (cycleDay <= 16) return 16 - cycleDay + 1;
  return 28 - cycleDay + 1;
}
