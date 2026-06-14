'use client';
import { useMemo } from 'react';
import type { WorldTheme } from '@/lib/worlds';

export function WorldParticles({ theme }: { theme: WorldTheme }) {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 5.55 + (i % 3) * 7) % 100}%`,
      delay: `${((i * 0.41) % 3.5).toFixed(2)}s`,
      duration: `${(3.5 + (i * 0.55) % 4).toFixed(2)}s`,
      size: `${5 + (i % 5) * 2}px`,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map(p => (
        <div
          key={p.id}
          className={`world-particle world-particle-${theme.particleType}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            color: theme.particleColor,
            background: theme.particleColor,
          }}
        />
      ))}
    </div>
  );
}
