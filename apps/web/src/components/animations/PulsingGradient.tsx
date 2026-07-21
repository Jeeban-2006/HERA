'use client';

import React from 'react';

export function PulsingGradient() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Teal blob - top left */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none animate-glow-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 209, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'gradient-pulse-teal 8s ease-in-out infinite alternate',
        }}
      />

      {/* Coral blob - center right */}
      <div
        className="absolute top-1/3 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 95, 126, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'gradient-pulse-coral 8s ease-in-out infinite alternate',
        }}
      />

      {/* Violet blob - bottom center */}
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(155, 93, 229, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'gradient-pulse-violet 8s ease-in-out infinite alternate',
        }}
      />

      <style>{`
        @keyframes gradient-pulse-teal {
          0% {
            opacity: 0.6;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translate(-20px, 20px) scale(1.1);
          }
          100% {
            opacity: 0.6;
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes gradient-pulse-coral {
          0% {
            opacity: 0.6;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translate(20px, -20px) scale(1.1);
          }
          100% {
            opacity: 0.6;
            transform: translate(0, 0) scale(1);
          }
        }

        @keyframes gradient-pulse-violet {
          0% {
            opacity: 0.6;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translate(-10px, -20px) scale(1.1);
          }
          100% {
            opacity: 0.6;
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
