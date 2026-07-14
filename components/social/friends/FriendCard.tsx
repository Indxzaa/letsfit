'use client';

import { useState } from 'react';
import { Swords, MoreHorizontal } from 'lucide-react';
import { PresenceDot } from '@/components/social/presence/PresenceDot';
import { ACTIVITY_LABELS } from '@/types/social';
import type { FriendWithPresence, PresencePayload } from '@/types/social';
import UserAvatar from '@/components/UserAvatar';
import { getAvatarPublicUrl } from '@/lib/profilePicture';

interface FriendCardProps {
  friend: FriendWithPresence;
  livePresence: PresencePayload | null;
  onInvite?: (friendId: string) => void;
  onUnfriend?: () => void;
  canInvite?: boolean;
  isLast?: boolean;
}

export function FriendCard({ friend, livePresence, onInvite, onUnfriend, canInvite = false, isLast = false }: FriendCardProps) {
  const { profile } = friend;
  const status = livePresence?.status ?? 'offline';
  const photoUrl = getAvatarPublicUrl(profile.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: isLast ? 'none' : '2px solid var(--neo-black)', position: 'relative' }}>
        <UserAvatar photoUrl={photoUrl} letter={profile.username} size="sm" progress={profile.data} />
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-black uppercase tracking-wide text-app truncate">{profile.username}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <PresenceDot status={status} size="sm" />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
              {ACTIVITY_LABELS[status]}
            </span>
          </div>
        </div>

        {canInvite && status === 'online' && onInvite && (
          <button onClick={() => onInvite(profile.id)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-2"
            style={{ background: 'var(--neo-accent)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
            <Swords size={11} strokeWidth={2.5} /> Invite
          </button>
        )}

        {onUnfriend && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--neo-surface)', border: '2px solid #000', cursor: 'pointer',
                boxShadow: menuOpen ? 'none' : '2px 2px 0 #000',
                transform: menuOpen ? 'translate(2px, 2px)' : 'none',
              }}
            >
              <MoreHorizontal size={14} strokeWidth={2.5} />
            </button>

            {menuOpen && (
              <>
                {/* backdrop to close menu */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 50,
                  background: 'var(--neo-white)', border: '2px solid #000', boxShadow: '3px 3px 0 #000',
                  minWidth: 120,
                }}>
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
                    className="w-full text-left text-[11px] font-black uppercase tracking-wider px-3 py-2.5"
                    style={{ color: '#DC2626', cursor: 'pointer', display: 'block', background: 'transparent', border: 'none', borderBottom: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Unfriend
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}
        >
          <div style={{
            background: 'var(--neo-white)', border: '3px solid #000', boxShadow: '5px 5px 0 #000',
            padding: '24px 28px', maxWidth: 340, width: '90%',
          }}>
            <h3 className="font-display text-lg font-black uppercase tracking-tight text-app mb-2">
              Remove Friend?
            </h3>
            <p className="text-sm text-subtle mb-6">
              Are you sure you want to remove <span className="font-black text-app uppercase">{profile.username}</span> from your friends list?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 text-[11px] font-black uppercase tracking-wider py-2.5"
                style={{ background: 'var(--neo-surface)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onUnfriend!(); setConfirmOpen(false); }}
                className="flex-1 text-[11px] font-black uppercase tracking-wider py-2.5"
                style={{ background: '#DC2626', border: '2px solid #000', boxShadow: '2px 2px 0 #000', color: '#fff', cursor: 'pointer' }}
              >
                Remove Friend
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
