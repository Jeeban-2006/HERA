'use client';

import type { CyclePhase } from '@/types/mood.types';
import { getCycleColor, getPhaseLabel } from '@/lib/utils/cycle';

const PHASES: { phase: CyclePhase; startAngle: number; endAngle: number }[] = [
  { phase: 'menstrual', startAngle: 0, endAngle: 65 },
  { phase: 'follicular', startAngle: 65, endAngle: 180 },
  { phase: 'ovulation', startAngle: 180, endAngle: 205 },
  { phase: 'luteal', startAngle: 205, endAngle: 360 },
];

const CX = 100;
const CY = 100;
const R_OUTER = 80;
const R_INNER = 50;

function polarToXY(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arcPath(startAngle: number, endAngle: number, rOuter: number, rInner: number) {
  const s1 = polarToXY(startAngle, rOuter);
  const e1 = polarToXY(endAngle, rOuter);
  const s2 = polarToXY(endAngle, rInner);
  const e2 = polarToXY(startAngle, rInner);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${e2.x} ${e2.y}`,
    'Z',
  ].join(' ');
}

interface CycleWheelProps {
  currentDay: number;
  currentPhase: CyclePhase;
}

export function CycleWheel({ currentDay, currentPhase }: CycleWheelProps) {
  const dayAngle = (currentDay / 28) * 360;
  const dotPos = polarToXY(dayAngle, R_OUTER);
  const phaseColor = getCycleColor(currentPhase);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 200" className="w-52 h-52">
        {PHASES.map(({ phase, startAngle, endAngle }) => {
          const color = getCycleColor(phase);
          const isActive = phase === currentPhase;
          return (
            <path
              key={phase}
              d={arcPath(startAngle, endAngle - 2, R_OUTER, R_INNER)}
              fill={color}
              fillOpacity={isActive ? 0.35 : 0.1}
              stroke={color}
              strokeWidth={isActive ? 1.5 : 0.5}
              strokeOpacity={isActive ? 0.8 : 0.3}
            />
          );
        })}

        {/* Current day dot */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="6"
          fill={phaseColor}
          opacity="0.9"
        />
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="10"
          fill="none"
          stroke={phaseColor}
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Center labels */}
        <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fill={phaseColor} fontFamily="DM Sans, sans-serif" fontWeight="600">
          {getPhaseLabel(currentPhase)}
        </text>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize="10" fill="#6B7B9E" fontFamily="DM Sans, sans-serif">
          Day {currentDay}
        </text>
      </svg>

      {/* Phase legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {PHASES.map(({ phase }) => (
          <div key={phase} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCycleColor(phase), opacity: phase === currentPhase ? 1 : 0.4 }}
            />
            <span className="text-xs text-text-muted">{getPhaseLabel(phase)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
