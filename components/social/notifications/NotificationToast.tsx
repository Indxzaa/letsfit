'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, Swords } from 'lucide-react';
import type { SocialNotification } from '@/types/social';

interface ToastItem {
  notification: SocialNotification;
  id: string;
}

interface NotificationToastLayerProps {
  notifications: SocialNotification[];
}

export function NotificationToastLayer({ notifications }: NotificationToastLayerProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenRef   = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const newOnes = notifications.filter(n => !n.read && !seenRef.current.has(n.id));
    if (newOnes.length === 0) return;

    for (const n of newOnes) seenRef.current.add(n.id);

    const latest = newOnes[0];
    if (!latest) return;

    const item: ToastItem = { notification: latest, id: `toast-${latest.id}-${Date.now()}` };
    setToasts(prev => [item, ...prev].slice(0, 3));

    // Timer stored in ref so cleanup doesn't cancel it when notifications re-renders
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== item.id));
      timersRef.current.delete(item.id);
    }, 2800);
    timersRef.current.set(item.id, timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[90] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 48, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 48, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 460, damping: 28, delay: i * 0.06 }}
            style={{
              width: 288,
              background: 'var(--neo-white)',
              border: '3px solid var(--neo-black)',
              boxShadow: '4px 4px 0 var(--neo-black)',
              borderRadius: 0,
              pointerEvents: 'auto',
            }}
          >
            <ToastContent notification={t.notification} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastContent({ notification }: { notification: SocialNotification }) {
  const { data } = notification;

  if (data.type === 'friend_request') {
    return (
      <div className="flex items-center gap-3 p-3">
        <div style={{ background: 'var(--neo-blue)', border: '2px solid #000', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UserPlus size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-app">Friend Request</p>
          <p className="text-xs text-muted truncate">{data.requesterName} wants to be friends</p>
        </div>
      </div>
    );
  }

  if (data.type === 'invite_received') {
    return (
      <div className="flex items-center gap-3 p-3">
        <div style={{ background: 'var(--neo-accent)', border: '2px solid #000', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Swords size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-app">Workout Invite</p>
          <p className="text-xs text-muted truncate">{data.fromName} invited you to workout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3">
      <div style={{ background: 'var(--neo-surface)', border: '2px solid #000', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bell size={14} strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">New notification</p>
      </div>
    </div>
  );
}
