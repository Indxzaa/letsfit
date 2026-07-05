'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { usePresence, type UsePresenceReturn } from '@/hooks/social/usePresence';
import { useFriends, type UseFriendsReturn } from '@/hooks/social/useFriends';
import { useInvites, type UseInvitesReturn } from '@/hooks/social/useInvites';
import { useNotifications, type UseNotificationsReturn } from '@/hooks/social/useNotifications';
import { InvitePopup } from './invites/InvitePopup';
import { NotificationToastLayer } from './notifications/NotificationToast';

interface SocialContextValue {
  presence: UsePresenceReturn;
  friends: UseFriendsReturn;
  invites: UseInvitesReturn;
  notifications: UseNotificationsReturn;
  username: string;
  avatar: string | null;
}

export const SocialContext = createContext<SocialContextValue | null>(null);

export function useSocialContext(): SocialContextValue {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocialContext must be used inside SocialProvider');
  return ctx;
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const username = (user?.user_metadata?.username as string | undefined) ?? user?.email?.split('@')[0] ?? 'User';
  const avatar = (user?.user_metadata?.avatar as string | null) ?? null;

  const presence = usePresence(userId);
  const friends = useFriends(userId);
  const invites = useInvites(userId);
  const notifications = useNotifications(friends, invites);

  const value = useMemo(
    () => ({ presence, friends, invites, notifications, username, avatar }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [presence, friends, invites, notifications, username, avatar],
  );

  // The first pending invite that hasn't been dismissed shows as a popup
  const topInvite = invites.pendingInvites[0] ?? null;

  return (
    <SocialContext.Provider value={value}>
      {children}
      {topInvite && userId && (
        <InvitePopup
          invite={topInvite}
          onAccept={async () => {
            const result = await invites.acceptInvite(topInvite.id, username);
            if (result.ok && result.roomId) {
              window.location.href = `/workout-together/lobby?roomId=${result.roomId}`;
            }
          }}
          onDecline={() => invites.declineInvite(topInvite.id)}
        />
      )}
      <NotificationToastLayer notifications={notifications.notifications} />
    </SocialContext.Provider>
  );
}
