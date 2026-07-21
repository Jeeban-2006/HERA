'use client';

import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  delay: number;
  duration: number;
}

export function ParticleField() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: 0.1 + Math.random() * 0.5,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 12,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>{`
            @keyframes particle-float {
              0%, 100% {
                transform: translate(0, 0);
              }
              25% {
                transform: translate(20px, -40px);
              }
              50% {
                transform: translate(10px, -80px);
              }
              75% {
                transform: translate(-10px, -40px);
              }
            }
          `}</style>
        </defs>

        {particles.map((particle) => (
          <circle
            key={particle.id}
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r="2"
            fill="#00FFD1"
            opacity={particle.opacity}
            filter="url(#glow-filter)"
            style={
              {
                '--delay': `${particle.delay}s`,
                '--duration': `${particle.duration}s`,
                animation: `particle-float var(--duration) ease-in-out var(--delay) infinite`,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
    </div>
  );
}
