'use client';

import { useMemo, useCallback, useState } from 'react';
import type { UseFriendsReturn } from './useFriends';
import type { UseInvitesReturn } from './useInvites';
import type { SocialNotification } from '@/types/social';

const STORAGE_KEY = 'letsfit:notif:lastRead';

function getLastRead(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
}

export interface UseNotificationsReturn {
  notifications: SocialNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

export function useNotifications(
  friends: UseFriendsReturn,
  invites: UseInvitesReturn,
): UseNotificationsReturn {
  const [lastRead, setLastRead] = useState<number>(getLastRead);

  const notifications = useMemo<SocialNotification[]>(() => {
    const items: SocialNotification[] = [];

    // Pending incoming friend requests
    for (const f of friends.pendingReceived) {
      items.push({
        id: f.relation.id,
        type: 'friend_request',
        createdAt: f.relation.created_at,
        read: new Date(f.relation.created_at).getTime() <= lastRead,
        data: {
          type: 'friend_request',
          requesterId: f.relation.requester_id,
          requesterName: f.profile.username,
          friendRowId: f.relation.id,
        },
      });
    }

    // Pending incoming invites
    for (const inv of invites.pendingInvites) {
      items.push({
        id: inv.id,
        type: 'invite_received',
        createdAt: inv.created_at,
        read: new Date(inv.created_at).getTime() <= lastRead,
        data: {
          type: 'invite_received',
          inviteId: inv.id,
          fromName: inv.sender_username,
          fromAvatar: inv.sender_avatar,
          roomId: inv.room_id,
        },
      });
    }

    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [friends.pendingReceived, invites.pendingInvites, lastRead]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  const markAllRead = useCallback(() => {
    const now = Date.now();
    setLastRead(now);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, String(now));
  }, []);

  return { notifications, unreadCount, markAllRead };
}
