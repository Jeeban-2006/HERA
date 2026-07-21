'use client';

import { motion } from 'framer-motion';
import type { MoodState } from '@/types/mood.types';

const MOOD_NODES: { state: MoodState; emoji: string; color: string; angle: number }[] = [
  { state: 'Radiant', emoji: '✨', color: '#FFD166', angle: 0 },
  { state: 'Energized', emoji: '⚡', color: '#FFD166', angle: 45 },
  { state: 'Focused', emoji: '🎯', color: '#00FFD1', angle: 90 },
  { state: 'Calm', emoji: '🌊', color: '#00FFD1', angle: 135 },
  { state: 'Tired', emoji: '😴', color: '#9B5DE5', angle: 180 },
  { state: 'Sad', emoji: '💙', color: '#6B7B9E', angle: 225 },
  { state: 'Anxious', emoji: '😰', color: '#FF5F7E', angle: 270 },
  { state: 'Irritable', emoji: '🔥', color: '#FF5F7E', angle: 315 },
];

const RADIUS = 100;
const CX = 140;
const CY = 140;

function polarToCartesian(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

interface MoodDialProps {
  selected: MoodState;
  onSelect: (state: MoodState) => void;
}

export function MoodDial({ selected, onSelect }: MoodDialProps) {
  const selectedNode = MOOD_NODES.find((n) => n.state === selected)!;
  const selectedPos = polarToCartesian(selectedNode.angle, RADIUS);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 280 280" className="w-64 h-64">
        {/* Outer ring */}
        <circle cx={CX} cy={CY} r={RADIUS + 20} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Line to selected */}
        <line
          x1={CX} y1={CY}
          x2={selectedPos.x} y2={selectedPos.y}
          stroke={selectedNode.color}
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r="4" fill={selectedNode.color} opacity="0.8" />

        {/* Mood nodes */}
        {MOOD_NODES.map((node) => {
          const pos = polarToCartesian(node.angle, RADIUS);
          const isSelected = node.state === selected;
          return (
            <g key={node.state} onClick={() => onSelect(node.state)} style={{ cursor: 'pointer' }}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 16 : 12}
                fill={node.color}
                fillOpacity={isSelected ? 0.25 : 0.1}
                stroke={node.color}
                strokeWidth={isSelected ? 2 : 1}
                strokeOpacity={isSelected ? 1 : 0.4}
                animate={{ scale: isSelected ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fontSize={isSelected ? '13' : '11'}
              >
                {node.emoji}
              </text>
              <text
                x={pos.x}
                y={pos.y + 26}
                textAnchor="middle"
                fontSize="8"
                fill={isSelected ? node.color : '#6B7B9E'}
                fontFamily="DM Sans, sans-serif"
              >
                {node.state}
              </text>
            </g>
          );
        })}

        {/* Center text */}
        <text x={CX} y={CY - 8} textAnchor="middle" fontSize="20">{selectedNode.emoji}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="11" fill={selectedNode.color} fontFamily="DM Sans, sans-serif" fontWeight="600">
          {selected}
        </text>
      </svg>
    </div>
  );
}
