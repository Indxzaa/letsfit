'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { FriendCard } from './FriendCard';
import type { FriendWithPresence, PresenceMap } from '@/types/social';

interface FriendListProps {
  friends: FriendWithPresence[];
  pendingReceived: FriendWithPresence[];
  pendingSent: FriendWithPresence[];
  presenceMap: PresenceMap;
  onAccept: (friendRowId: string) => void;
  onRemove: (friendRowId: string) => void;
  onInvite?: (friendId: string) => void;
  canInvite?: boolean;
  onAddFriend: () => void;
}

type Tab = 'friends' | 'pending';

export function FriendList({
  friends,
  pendingReceived,
  pendingSent,
  presenceMap,
  onAccept,
  onRemove,
  onInvite,
  canInvite = false,
  onAddFriend,
}: FriendListProps) {
  const [tab, setTab] = useState<Tab>('friends');
  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: '10px 0',
    background: active ? 'var(--neo-black)' : 'var(--neo-surface)',
    color: active ? 'var(--neo-white)' : 'var(--neo-black)',
    border: 'none',
    borderBottom: active ? 'none' : '3px solid var(--neo-black)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  });

  const pendingCount = pendingReceived.length;

  return (
    <div
      style={{
        background: 'var(--neo-white)',
        border: '3px solid var(--neo-black)',
        boxShadow: '4px 4px 0 var(--neo-black)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '3px solid var(--neo-black)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--neo-surface)',
        }}
      >
        <span className="font-display text-sm font-black uppercase tracking-widest">Friends</span>
        <button
          onClick={onAddFriend}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-2"
          style={{
            background: 'var(--neo-accent)',
            border: '2px solid #000',
            boxShadow: '2px 2px 0 #000',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <UserPlus size={12} strokeWidth={2.5} />
          Add Friend
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '3px solid var(--neo-black)' }}>
        <button style={tabStyle(tab === 'friends')} onClick={() => setTab('friends')}>
          Friends ({friends.length})
        </button>
        <button style={tabStyle(tab === 'pending')} onClick={() => setTab('pending')}>
          Pending {pendingCount > 0 ? `(${pendingCount})` : ''}
        </button>
      </div>

      {/* Content */}
      {tab === 'friends' && (
        <>
          {friends.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-subtle font-semibold uppercase tracking-wider">
                No friends yet. Add someone!
              </p>
            </div>
          ) : (
            friends.map((f, i) => (
              <FriendCard
                key={f.relation.id}
                friend={f}
                livePresence={presenceMap.get(f.profile.id) ?? null}
                onInvite={onInvite}
                canInvite={canInvite}
                isLast={i === friends.length - 1}
              />
            ))
          )}
        </>
      )}

      {tab === 'pending' && (
        <>
          {pendingReceived.length === 0 && pendingSent.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-subtle font-semibold uppercase tracking-wider">
                No pending requests
              </p>
            </div>
          ) : (
            <>
              {pendingReceived.length > 0 && (
                <>
                  <div style={{ padding: '8px 16px 4px', borderBottom: '2px solid var(--neo-black)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Incoming</span>
                  </div>
                  {pendingReceived.map((f, i) => (
                    <div
                      key={f.relation.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < pendingReceived.length - 1 || pendingSent.length > 0 ? '2px solid var(--neo-black)' : 'none' }}
                    >
                      <div style={{ width: 32, height: 32, background: 'var(--neo-blue)', border: '3px solid #000', boxShadow: '2px 2px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="font-display text-xs font-black text-white">
                          {f.profile.username[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-display text-sm font-black uppercase flex-1 text-app">{f.profile.username}</span>
                      <button
                        onClick={() => onAccept(f.relation.id)}
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
                        style={{ background: 'var(--neo-accent)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', color: '#fff', cursor: 'pointer' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onRemove(f.relation.id)}
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
                        style={{ background: 'var(--neo-surface)', border: '2px solid #000', cursor: 'pointer' }}
                      >
                        Decline
                      </button>
                    </div>
                  ))}
                </>
              )}

              {pendingSent.length > 0 && (
                <>
                  <div style={{ padding: '8px 16px 4px', borderBottom: '2px solid var(--neo-black)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Sent</span>
                  </div>
                  {pendingSent.map((f, i) => (
                    <div
                      key={f.relation.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < pendingSent.length - 1 ? '2px solid var(--neo-black)' : 'none' }}
                    >
                      <div style={{ width: 32, height: 32, background: 'var(--neo-surface)', border: '3px solid #000', boxShadow: '2px 2px 0 #000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="font-display text-xs font-black text-app">
                          {f.profile.username[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-display text-sm font-black uppercase flex-1 text-app">{f.profile.username}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">Pending...</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
