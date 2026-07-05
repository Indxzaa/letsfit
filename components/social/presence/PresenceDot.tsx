'use client';

import type { PresenceStatus } from '@/types/social';
import { ACTIVITY_LABELS, STATUS_COLORS } from '@/types/social';

interface PresenceDotProps {
  status: PresenceStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function PresenceDot({ status, showLabel = false, size = 'sm' }: PresenceDotProps) {
  const color = STATUS_COLORS[status];
  const dim = size === 'sm' ? 8 : 10;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        style={{
          display: 'inline-block',
          width: dim,
          height: dim,
          background: color,
          border: status === 'offline' ? '2px solid var(--neo-black)' : '2px solid #000',
          flexShrink: 0,
        }}
      />
      {showLabel && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: status === 'offline' ? 'var(--text-subtle)' : 'var(--neo-black)' }}
        >
          {ACTIVITY_LABELS[status]}
        </span>
      )}
    </span>
  );
}
