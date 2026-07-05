import {
  dbGetFriends,
  dbGetFriendByPair,
  dbInsertFriendRequest,
  dbAcceptFriendRequest,
  dbDeleteFriend,
  dbSearchProfiles,
} from './friends-db';
import type { FriendWithPresence, UserSearchResult } from '@/types/social';

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function getFriendsWithProfiles(
  userId: string,
): Promise<ServiceResult<FriendWithPresence[]>> {
  const result = await dbGetFriends(userId);
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, data: result.data ?? [] };
}

export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string,
): Promise<ServiceResult<{ id: string }>> {
  const existing = await dbGetFriendByPair(requesterId, addresseeId);
  if (existing.error) return { ok: false, error: existing.error };
  if (existing.data) {
    if (existing.data.status === 'accepted') return { ok: false, error: 'Already friends.' };
    return { ok: false, error: 'Friend request already pending.' };
  }

  const result = await dbInsertFriendRequest(requesterId, addresseeId);
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, data: { id: result.data!.id } };
}

export async function acceptFriendRequest(
  friendRowId: string,
  userId: string,
  friendsList: FriendWithPresence[],
): Promise<ServiceResult<void>> {
  const row = friendsList.find(f => f.relation.id === friendRowId);
  if (row && row.relation.addressee_id !== userId) {
    return { ok: false, error: 'Only the addressee can accept a request.' };
  }

  const result = await dbAcceptFriendRequest(friendRowId);
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, data: undefined };
}

export async function removeFriend(friendRowId: string): Promise<ServiceResult<void>> {
  const result = await dbDeleteFriend(friendRowId);
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, data: undefined };
}

export async function searchUsers(
  query: string,
  currentUserId: string,
): Promise<ServiceResult<UserSearchResult[]>> {
  if (query.trim().length < 2) return { ok: true, data: [] };
  const result = await dbSearchProfiles(query.trim(), currentUserId);
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, data: result.data ?? [] };
}
