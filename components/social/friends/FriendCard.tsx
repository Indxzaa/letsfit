'use client';

import { Swords } from 'lucide-react';
import { PresenceDot } from '@/components/social/presence/PresenceDot';
import { ACTIVITY_LABELS } from '@/types/social';
import type { FriendWithPresence, PresencePayload } from '@/types/social';

interface FriendCardProps {
  friend: FriendWithPresence;
  livePresence: PresencePayload | null;
  onInvite?: (friendId: string) => void;
  canInvite?: boolean;
  isLast?: boolean;
}

export function FriendCard({ friend, livePresence, onInvite, canInvite = false, isLast = false }: FriendCardProps) {
  const { profile } = friend;
  const status = livePresence?.status ?? 'offline';
  const isOnline = status !== 'offline';
  const initial = profile.username[0]?.toUpperCase() ?? '?';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '2px solid var(--neo-black)',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          background: isOnline ? 'var(--neo-accent)' : 'var(--neo-surface)',
          border: '3px solid var(--neo-black)',
          boxShadow: '2px 2px 0 var(--neo-black)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span className="font-display text-sm font-black" style={{ color: isOnline ? '#fff' : 'var(--neo-black)' }}>
          {initial}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-black uppercase tracking-wide text-app truncate">
          {profile.username}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PresenceDot status={status} size="sm" />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
            {ACTIVITY_LABELS[status]}
          </span>
        </div>
      </div>

      {/* Invite button */}
      {canInvite && status === 'online' && onInvite && (
        <button
          onClick={() => onInvite(profile.id)}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-2"
          style={{
            background: 'var(--neo-accent)',
            border: '2px solid #000',
            boxShadow: '2px 2px 0 #000',
            color: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Swords size={11} strokeWidth={2.5} />
          Invite
        </button>
      )}
    </div>
  );
}
