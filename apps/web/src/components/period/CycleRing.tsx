'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { CurrentCycleStatus } from '@/types/period.types';

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#FF5F7E',
  follicular: '#00FFD1',
  ovulation: '#FFD166',
  luteal: '#9B5DE5',
};

const PHASE_LENGTHS = {
  menstrual: 5,
  follicular: 9,
  ovulation: 2,
  luteal: 12,
};

interface CycleRingProps {
  status: CurrentCycleStatus | undefined;
  size?: number;
  className?: string;
}

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number, cy: number, r: number, startAngle: number, endAngle: number
): string {
  const s = polarToXY(startAngle, r, cx, cy);
  const e = polarToXY(endAngle, r, cx, cy);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

export function CycleRing({ status, size = 180, className = '' }: CycleRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.055;

  if (!status || status.cycleDay === null) {
    return (
      <Link href="/dashboard/period">
        <div className={`flex flex-col items-center justify-center gap-3 cursor-pointer group ${className}`}>
          <div
            style={{ width: size, height: size }}
            className="rounded-full border-2 border-dashed border-bio-coral/30 flex items-center justify-center group-hover:border-bio-coral/60 transition-all"
          >
            <div className="text-center px-4">
              <div className="text-2xl mb-1">🩸</div>
              <p className="text-xs text-text-muted leading-tight">Tap to set up period tracking</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Build arc segments (28-day cycle)
  const totalDays = 28;
  const phases = [
    { id: 'menstrual', days: 5 },
    { id: 'follicular', days: 9 },
    { id: 'ovulation', days: 2 },
    { id: 'luteal', days: 12 },
  ];

  let currentAngle = 0;
  const arcs = phases.map((p) => {
    const span = (p.days / totalDays) * 360;
    const arc = { id: p.id, startAngle: currentAngle, endAngle: currentAngle + span - 2 };
    currentAngle += span;
    return arc;
  });

  // Current day dot position
  const dotAngle = ((status.cycleDay - 1) / totalDays) * 360;
  const dotPos = polarToXY(dotAngle, r, cx, cy);

  // Days until next period
  const daysUntilNext = status.prediction
    ? Math.ceil(
        (new Date(status.prediction.nextPeriodDate).getTime() - Date.now()) / 86400000
      )
    : null;

  const phaseColor = PHASE_COLORS[status.phase ?? 'follicular'];

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth + 2} />

        {/* Phase arc segments */}
        {arcs.map((arc) => (
          <path
            key={arc.id}
            d={describeArc(cx, cy, r, arc.startAngle, arc.endAngle)}
            fill="none"
            stroke={PHASE_COLORS[arc.id]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}

        {/* Pulsing dot at current day */}
        <motion.circle
          cx={dotPos.x}
          cy={dotPos.y}
          r={strokeWidth * 0.7}
          fill={phaseColor}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <circle cx={dotPos.x} cy={dotPos.y} r={strokeWidth * 0.35} fill="white" opacity={0.9} />

        {/* Center text */}
        <text x={cx} y={cy - size * 0.08} textAnchor="middle" fill={phaseColor}
          fontFamily="JetBrains Mono, monospace" fontWeight="700"
          fontSize={size * 0.16}>
          Day {status.cycleDay}
        </text>
        <text x={cx} y={cy + size * 0.08} textAnchor="middle" fill="rgba(255,255,255,0.5)"
          fontFamily="DM Sans, sans-serif" fontSize={size * 0.08}>
          {status.phaseLabel ?? ''}
        </text>
      </svg>

      {daysUntilNext !== null && daysUntilNext > 0 && (
        <p className="text-xs text-text-muted text-center">
          Next period in{' '}
          <span style={{ color: '#FF5F7E' }} className="font-semibold">{daysUntilNext} days</span>
        </p>
      )}
      {status.isMenstruating && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-bio-coral/15 text-bio-coral border border-bio-coral/30">
          Active period
        </span>
      )}
    </div>
  );
}
