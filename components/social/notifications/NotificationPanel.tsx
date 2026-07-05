'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, Swords, Check, X } from 'lucide-react';
import type { SocialNotification } from '@/types/social';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface NotificationPanelProps {
  notifications: SocialNotification[];
  onAcceptFriend: (friendRowId: string) => void;
  onDeclineFriend: (friendRowId: string) => void;
  onOpenFriends: () => void;
  onJoinRoom: (roomId: string) => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  onAcceptFriend,
  onDeclineFriend,
  onOpenFriends,
  onJoinRoom,
  onClose,
}: NotificationPanelProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="notif-panel"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 mt-2 z-50 overflow-hidden"
        style={{
          width: 300,
          background: 'var(--neo-white)',
          border: '3px solid var(--neo-black)',
          boxShadow: '6px 6px 0 var(--neo-black)',
          borderRadius: 0,
          top: '100%',
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '3px solid var(--neo-black)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--neo-surface)',
          }}
        >
          <div className="flex items-center gap-2">
            <Bell size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-widest">Notifications</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-xs text-subtle font-semibold uppercase tracking-wider">No notifications</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <NotifRow
                key={n.id}
                notification={n}
                isLast={i === notifications.length - 1}
                onAcceptFriend={onAcceptFriend}
                onDeclineFriend={onDeclineFriend}
                onOpenFriends={onOpenFriends}
                onJoinRoom={onJoinRoom}
              />
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function NotifRow({
  notification,
  isLast,
  onAcceptFriend,
  onDeclineFriend,
  onOpenFriends,
  onJoinRoom,
}: {
  notification: SocialNotification;
  isLast: boolean;
  onAcceptFriend: (id: string) => void;
  onDeclineFriend: (id: string) => void;
  onOpenFriends: () => void;
  onJoinRoom: (roomId: string) => void;
}) {
  const { data } = notification;

  const iconBg = data.type === 'friend_request'
    ? 'var(--neo-blue)'
    : data.type === 'invite_received'
    ? 'var(--neo-accent)'
    : 'var(--neo-surface)';

  const icon = data.type === 'friend_request'
    ? <UserPlus size={13} color="#fff" strokeWidth={2.5} />
    : data.type === 'invite_received'
    ? <Swords size={13} color="#fff" strokeWidth={2.5} />
    : <Bell size={13} strokeWidth={2.5} />;

  const label = data.type === 'friend_request'
    ? `${data.requesterName} sent a friend request`
    : data.type === 'invite_received'
    ? `${data.fromName} invited you to workout`
    : 'New notification';

  const timestamp = timeAgo(notification.createdAt);

  return (
    <div
      style={{
        padding: '10px 14px',
        borderBottom: isLast ? 'none' : '2px solid var(--neo-black)',
        background: notification.read ? 'transparent' : 'var(--card-bg-blue)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          style={{
            width: 28,
            height: 28,
            background: iconBg,
            border: '2px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-app leading-snug">{label}</p>
          <p className="text-[10px] text-subtle mt-0.5 uppercase tracking-wider">{timestamp}</p>
        </div>
      </div>

      {data.type === 'friend_request' && (
        <div className="flex gap-2 pl-9">
          <button
            onClick={() => { onAcceptFriend(data.friendRowId); }}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
            style={{ background: 'var(--neo-accent)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', color: '#fff', cursor: 'pointer' }}
          >
            <Check size={11} strokeWidth={3} /> Accept
          </button>
          <button
            onClick={onOpenFriends}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
            style={{ background: 'var(--neo-surface)', border: '2px solid #000', cursor: 'pointer' }}
          >
            View
          </button>
        </div>
      )}

      {data.type === 'invite_received' && (
        <div className="pl-9">
          <button
            onClick={() => onJoinRoom(data.roomId)}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
            style={{
              background: 'var(--neo-accent)',
              border: '2px solid #000',
              boxShadow: '2px 2px 0 #000',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <Swords size={11} strokeWidth={3} /> Join Workout
          </button>
        </div>
      )}
    </div>
  );
}
