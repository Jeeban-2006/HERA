"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedDotProps {
  pathId: string;
  color: string;
  duration?: number;
  delay?: number;
}

export function AnimatedDot({
  pathId,
  color,
  duration = 2000,
  delay = 0,
}: AnimatedDotProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const pathEl = document.getElementById(pathId) as SVGPathElement | null;
      if (!pathEl) return;

      const totalLength = pathEl.getTotalLength();

      const animate = (timestamp: number) => {
        if (!startRef.current) startRef.current = timestamp;
        const elapsed = (timestamp - startRef.current) % duration;
        const progress = elapsed / duration;
        const point = pathEl.getPointAtLength(progress * totalLength);
        setPos({ x: point.x, y: point.y });
        frameRef.current = requestAnimationFrame(animate);
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [pathId, duration, delay]);

  if (!pos) return null;

  return (
    <circle
      cx={pos.x}
      cy={pos.y}
      r={3.5}
      fill={color}
      style={{
        filter: `drop-shadow(0 0 4px ${color})`,
      }}
    />
  );
}
