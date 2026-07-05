import { getSupabase } from '@/lib/supabase';
import {
  dbGetPendingInviteByPair,
  dbInsertInvite,
  dbUpdateInviteStatus,
  dbGetPendingInvites,
} from './invite-db';
import type { InviteWithSender, SocialBroadcastEvent } from '@/types/social';

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function getPendingInvites(
  userId: string,
): Promise<ServiceResult<InviteWithSender[]>> {
  const result = await dbGetPendingInvites(userId);
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, data: result.data ?? [] };
}

export async function sendInvite(
  fromUser: string,
  toUser: string,
  roomId: string,
  senderUsername: string,
  senderAvatar: string | null,
): Promise<ServiceResult<{ inviteId: string }>> {
  const existing = await dbGetPendingInviteByPair(fromUser, toUser);
  if (existing.error) return { ok: false, error: existing.error };
  if (existing.data) return { ok: false, error: 'Invite already pending.' };

  const insert = await dbInsertInvite(fromUser, toUser, roomId);
  if (insert.error || !insert.data) return { ok: false, error: insert.error ?? 'Insert failed.' };

  // Broadcast to recipient over their personal channel so they get an instant popup
  const sb = getSupabase();
  if (sb) {
    const event: SocialBroadcastEvent = {
      type: 'invite_sent',
      invite: insert.data,
      senderUsername,
      senderAvatar,
    };
    await sb.channel(`social:${toUser}`).send({
      type: 'broadcast',
      event: 'social',
      payload: event,
    });
  }

  return { ok: true, data: { inviteId: insert.data.id } };
}

export async function acceptInvite(
  inviteId: string,
): Promise<ServiceResult<{ roomId: string }>> {
  const result = await dbUpdateInviteStatus(inviteId, 'accepted');
  if (result.error || !result.data) return { ok: false, error: result.error ?? 'Update failed.' };
  return { ok: true, data: { roomId: result.data.room_id } };
}

export async function declineInvite(inviteId: string): Promise<ServiceResult<void>> {
  const result = await dbUpdateInviteStatus(inviteId, 'declined');
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, data: undefined };
}
