'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { joinRoom } from '@/lib/multiplayer/service';
import {
  getPendingInvites,
  sendInvite,
  acceptInvite,
  declineInvite,
} from '@/lib/social/invite-service';
import type { InviteWithSender, SocialBroadcastEvent } from '@/types/social';

export interface UseInvitesReturn {
  pendingInvites: InviteWithSender[];
  loading: boolean;
  sendInvite: (
    toUser: string,
    roomId: string,
    senderUsername: string,
    senderAvatar: string | null,
  ) => Promise<{ ok: boolean; error?: string }>;
  acceptInvite: (inviteId: string, username: string) => Promise<{ ok: boolean; roomId?: string; error?: string }>;
  declineInvite: (inviteId: string) => Promise<void>;
}

export function useInvites(userId: string | null): UseInvitesReturn {
  const [pendingInvites, setPendingInvites] = useState<InviteWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>['channel']> | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const result = await getPendingInvites(userId);
    if (result.ok) setPendingInvites(result.data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    load();

    const sb = getSupabase();
    if (!sb) return;

    // Listen for DB changes (for persistence/recovery)
    const dbChannel = sb
      .channel(`invites_changes:${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'invites',
        filter: `to_user=eq.${userId}`,
      }, () => load())
      .subscribe();

    // Listen for broadcast (for instant popup delivery)
    const broadcastChannel = sb
      .channel(`social:${userId}`)
      .on('broadcast', { event: 'social' }, ({ payload }) => {
        const event = payload as SocialBroadcastEvent;
        if (event.type === 'invite_sent') {
          // Push directly so popup appears immediately without a DB round-trip
          setPendingInvites(prev => {
            const already = prev.some(i => i.id === event.invite.id);
            if (already) return prev;
            return [
              {
                ...event.invite,
                sender_username: event.senderUsername,
                sender_avatar: event.senderAvatar,
              },
              ...prev,
            ];
          });
        }
      })
      .subscribe();

    channelRef.current = broadcastChannel;

    return () => {
      sb.removeChannel(dbChannel);
      sb.removeChannel(broadcastChannel);
      channelRef.current = null;
    };
  }, [userId, load]);

  const send = useCallback(async (
    toUser: string,
    roomId: string,
    senderUsername: string,
    senderAvatar: string | null,
  ) => {
    if (!userId) return { ok: false, error: 'Not authenticated.' };
    const result = await sendInvite(userId, toUser, roomId, senderUsername, senderAvatar);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }, [userId]);

  const accept = useCallback(async (inviteId: string, username: string) => {
    if (!userId) return { ok: false, error: 'Not authenticated.' };
    const result = await acceptInvite(inviteId);
    if (!result.ok) return { ok: false, error: result.error };

    const joinResult = await joinRoom(result.data.roomId, userId, username);
    if (!joinResult.ok) return { ok: false, error: joinResult.error };

    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
    return { ok: true, roomId: result.data.roomId };
  }, [userId]);

  const decline = useCallback(async (inviteId: string) => {
    await declineInvite(inviteId);
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
  }, []);

  return { pendingInvites, loading, sendInvite: send, acceptInvite: accept, declineInvite: decline };
}
