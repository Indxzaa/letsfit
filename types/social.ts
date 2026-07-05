// Shared TypeScript types for the Phase 6.2 social layer.

// ── DB row types ──────────────────────────────────────────────────────────────

export interface FriendRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface InviteRow {
  id: string;
  from_user: string;
  to_user: string;
  room_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface PresenceRow {
  user_id: string;
  status: PresenceStatus;
  current_activity: string | null;
  last_seen: string;
}

// ── Presence ──────────────────────────────────────────────────────────────────

export type PresenceStatus =
  | 'online'
  | 'offline'
  | 'in_lobby'
  | 'in_workout'
  | 'in_round'
  | 'in_invite_screen';

export const ACTIVITY_LABELS: Record<PresenceStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  in_lobby: 'In Lobby',
  in_workout: 'In Workout',
  in_round: 'In Round',
  in_invite_screen: 'Viewing Invite',
};

export const STATUS_COLORS: Record<PresenceStatus, string> = {
  online: '#22c55e',
  offline: 'var(--neo-surface)',
  in_lobby: 'var(--neo-blue)',
  in_workout: 'var(--neo-amber)',
  in_round: 'var(--neo-amber)',
  in_invite_screen: 'var(--neo-purple)',
};

// ── Enriched friend (profile + presence) ─────────────────────────────────────

export interface FriendProfile {
  id: string;
  username: string;
  avatar: string | null;
}

export interface FriendWithPresence {
  relation: FriendRow;
  profile: FriendProfile;
}

// ── Invites enriched with sender info ─────────────────────────────────────────

export interface InviteWithSender extends InviteRow {
  sender_username: string;
  sender_avatar: string | null;
}

// ── Notifications (derived — no DB table) ─────────────────────────────────────

export type NotificationType =
  | 'friend_request'
  | 'invite_received'
  | 'invite_accepted'
  | 'friend_online';

export type NotificationData =
  | { type: 'friend_request'; requesterId: string; requesterName: string; friendRowId: string }
  | { type: 'invite_received'; inviteId: string; fromName: string; fromAvatar: string | null; roomId: string }
  | { type: 'invite_accepted'; friendName: string; friendId: string }
  | { type: 'friend_online'; userId: string; username: string };

export interface SocialNotification {
  id: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  data: NotificationData;
}

// ── Realtime Presence ─────────────────────────────────────────────────────────

export interface PresencePayload {
  userId: string;
  status: PresenceStatus;
  activity: string | null;
}

// userId → live presence payload (online users only)
export type PresenceMap = Map<string, PresencePayload>;

// ── Broadcast events (social:{userId} channel) ────────────────────────────────

export type SocialBroadcastEvent =
  | { type: 'invite_sent'; invite: InviteRow; senderUsername: string; senderAvatar: string | null }
  | { type: 'friend_accepted'; friendId: string; friendUsername: string };
