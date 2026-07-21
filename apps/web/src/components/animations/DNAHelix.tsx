'use client';

import React from 'react';

interface DNAHelixProps {
  size?: number;
  color?: string;
}

export function DNAHelix({ size = 60, color = '#00FFD1' }: DNAHelixProps) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="animate-dna-spin"
        style={{
          filter: `drop-shadow(0 0 20px ${color}40)`,
        }}
      >
        <defs>
          <linearGradient id="dna-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Left strand */}
        <path
          d="M 30 10 Q 25 30, 30 50 T 30 90"
          stroke="url(#dna-gradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Right strand */}
        <path
          d="M 70 10 Q 75 30, 70 50 T 70 90"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Connecting bonds */}
        {Array.from({ length: 8 }).map((_, i) => {
          const y = 15 + i * 10;
          const xLeft = 30 + Math.sin(i) * 5;
          const xRight = 70 - Math.sin(i) * 5;
          return (
            <line
              key={i}
              x1={xLeft}
              y1={y}
              x2={xRight}
              y2={y}
              stroke={color}
              strokeWidth="2"
              opacity={0.5 + (i % 2) * 0.3}
            />
          );
        })}
      </svg>
    </div>
  );
}
