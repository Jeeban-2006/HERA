export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatScore(score: number, max = 10): string {
  return `${score.toFixed(1)}/${max}`;
}

export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getCycleDay(cycleStartDate: Date, currentDate: Date = new Date()): number {
  const diff = currentDate.getTime() - cycleStartDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return (days % 28) + 1;
}

export function getCyclePhase(cycleDay: number): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

export function getMoodLabel(score: number): string {
  if (score <= 2) return 'Very Low';
  if (score <= 4) return 'Low';
  if (score <= 6) return 'Neutral';
  if (score <= 8) return 'High';
  return 'Very High';
}

export function getRiskColor(riskScore: number): string {
  if (riskScore <= 0.33) return '#00FFD1'; // teal
  if (riskScore <= 0.66) return '#FFD166'; // gold
  return '#FF5F7E'; // coral
}

export function getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore <= 0.33) return 'low';
  if (riskScore <= 0.66) return 'medium';
  return 'high';
}
