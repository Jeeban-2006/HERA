'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import type { MoodLog } from '@/types/mood.types';

interface MoodChartProps {
  data: MoodLog[];
  correlationScore: number;
}

interface TooltipPayload {
  payload: MoodLog;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-white/15 rounded-xl p-3 text-xs space-y-1 shadow-glow-gold">
      <div className="text-text-muted">{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
      <div className="text-bio-gold font-semibold font-mono">Mood: {d.moodScore}/10</div>
      <div className="text-text-muted capitalize">{d.phase} · Day {d.cycleDay}</div>
    </div>
  );
}

const PHASE_BANDS = [
  { phase: 'Menstrual', fill: 'rgba(255,95,126,0.07)', days: [1, 5] },
  { phase: 'Follicular', fill: 'rgba(0,255,209,0.05)', days: [6, 14] },
  { phase: 'Ovulation', fill: 'rgba(255,209,102,0.09)', days: [15, 16] },
  { phase: 'Luteal', fill: 'rgba(155,93,229,0.06)', days: [17, 28] },
];

export function MoodChart({ data, correlationScore }: MoodChartProps) {
  const last30 = data.slice(-30);
  const chartData = last30.map((log) => ({
    ...log,
    dateLabel: new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    cycleDayStr: `Day ${log.cycleDay}`,
  }));

  // Map cycle days to data indices for reference areas
  const getReferenceAreas = () => {
    const areas: { start: number; end: number; fill: string }[] = [];
    let i = 0;
    while (i < chartData.length) {
      const item = chartData[i];
      for (const band of PHASE_BANDS) {
        if (item.cycleDay >= band.days[0] && item.cycleDay <= band.days[1]) {
          const start = i;
          let end = i;
          while (end < chartData.length && chartData[end].cycleDay >= band.days[0] && chartData[end].cycleDay <= band.days[1]) {
            end++;
          }
          if (end > start) {
            areas.push({ start, end: end - 1, fill: band.fill });
            i = end;
            break;
          }
        }
      }
      i++;
    }
    return areas;
  };

  return (
    <GlassCard className="p-6" glowColor="gold">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">30-Day Mood Trend</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bio-gold/10 border border-bio-gold/30">
          <div className="w-2 h-2 rounded-full bg-bio-gold animate-pulse" />
          <span className="text-xs font-mono text-bio-gold">
            {Math.round(correlationScore * 100)}% Hormonal Correlation
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD166" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FFD166" stopOpacity={0} />
            </linearGradient>
          </defs>
          {getReferenceAreas().map((area, idx) => (
            <ReferenceArea
              key={idx}
              x1={chartData[area.start]?.dateLabel}
              x2={chartData[area.end]?.dateLabel}
              fill={area.fill}
            />
          ))}
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 10, fill: '#6B7B9E' }}
            axisLine={false}
            tickLine={false}
            interval={6}
          />
          <YAxis domain={[1, 10]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="moodScore"
            stroke="#FFD166"
            strokeWidth={2}
            fill="url(#moodGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
