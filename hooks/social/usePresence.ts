'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { upsertPresence, setOffline } from '@/lib/social/presence-service';
import type { PresenceMap, PresencePayload, PresenceStatus } from '@/types/social';

const CHANNEL = 'presence_global';

export interface UsePresenceReturn {
  presenceMap: PresenceMap;
  updateStatus: (status: PresenceStatus, activity: string | null) => Promise<void>;
  getStatus: (userId: string) => PresencePayload | null;
}

export function usePresence(userId: string | null): UsePresenceReturn {
  const [presenceMap, setPresenceMap] = useState<PresenceMap>(new Map());
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null>(null);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (!userId) return;
    const sb = getSupabase();
    if (!sb) return;

    const channel = sb.channel(CHANNEL, { config: { presence: { key: userId } } });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresencePayload>();
        const map = new Map<string, PresencePayload>();
        for (const [, presences] of Object.entries(state)) {
          const p = (presences as unknown as PresencePayload[])[0];
          if (p?.userId) map.set(p.userId, p);
        }
        setPresenceMap(map);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setPresenceMap(prev => {
          const next = new Map(prev);
          for (const p of (newPresences as unknown as PresencePayload[])) {
            if (p.userId) next.set(p.userId, p);
          }
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setPresenceMap(prev => {
          const next = new Map(prev);
          for (const p of (leftPresences as unknown as PresencePayload[])) {
            if (p.userId) next.delete(p.userId);
          }
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId, status: 'online', activity: null } satisfies PresencePayload);
          await upsertPresence(userId, 'online', null);
        }
      });

    channelRef.current = channel;

    return () => {
      const uid = userIdRef.current;
      channel.untrack().then(() => {
        if (uid) setOffline(uid);
        sb.removeChannel(channel);
      });
      channelRef.current = null;
    };
  }, [userId]);

  const updateStatus = useCallback(async (status: PresenceStatus, activity: string | null) => {
    const uid = userIdRef.current;
    if (!uid || !channelRef.current) return;
    const payload: PresencePayload = { userId: uid, status, activity };
    await channelRef.current.track(payload);
    await upsertPresence(uid, status, activity);
  }, []);

  const getStatus = useCallback(
    (id: string) => presenceMap.get(id) ?? null,
    [presenceMap],
  );

  return { presenceMap, updateStatus, getStatus };
}
