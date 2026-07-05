// Business logic for the multiplayer room system.
// Pages and hooks call these functions — raw DB queries stay in db.ts.

import {
  dbInsertRoom, dbGetRoomByCode, dbGetRoomById, dbGetRoomPlayers,
  dbInsertPlayer, dbRemovePlayer, dbUpdateRoomHost, dbDeleteRoom,
  type RoomRow, type RoomPlayerRow,
} from './db';
import { MAX_PLAYERS, ROOM_CODE_LENGTH } from './constants';

// ── Room code generation ──────────────────────────────────────────────────

// No O/0 or I/1 to avoid confusion
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// Retry up to 10 times on unique-constraint collision
async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = makeCode();
    const { data } = await dbGetRoomByCode(code);
    if (!data) return code; // code is free
  }
  throw new Error('Could not generate a unique room code. Try again.');
}

// ── Result type ───────────────────────────────────────────────────────────

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ── Create room ───────────────────────────────────────────────────────────

export async function createRoom(
  hostUserId: string,
  username: string,
): Promise<ServiceResult<{ room: RoomRow; code: string }>> {
  try {
    const code = await generateUniqueCode();
    const { data: room, error: roomErr } = await dbInsertRoom(code, hostUserId);
    if (roomErr || !room) return { ok: false, error: roomErr ?? 'Failed to create room.' };

    const { error: playerErr } = await dbInsertPlayer(room.id, hostUserId, username);
    if (playerErr) {
      // Roll back the room
      await dbDeleteRoom(room.id);
      return { ok: false, error: playerErr };
    }

    return { ok: true, data: { room, code } };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error.' };
  }
}

// ── Join room ─────────────────────────────────────────────────────────────

export async function joinRoom(
  code: string,
  userId: string,
  username: string,
): Promise<ServiceResult<{ room: RoomRow }>> {
  const { data: room, error: findErr } = await dbGetRoomByCode(code);
  if (findErr) return { ok: false, error: findErr };
  if (!room) return { ok: false, error: 'Room not found. Check the code and try again.' };

  if (room.status !== 'lobby') return { ok: false, error: 'This room has already started.' };

  const { data: players } = await dbGetRoomPlayers(room.id);
  const alreadyJoined = players.some(p => p.user_id === userId);
  if (alreadyJoined) return { ok: true, data: { room } }; // idempotent re-join

  if (players.length >= MAX_PLAYERS) return { ok: false, error: 'This room is full.' };

  const { error: insertErr } = await dbInsertPlayer(room.id, userId, username);
  if (insertErr) return { ok: false, error: insertErr };

  return { ok: true, data: { room } };
}

// ── Leave room ────────────────────────────────────────────────────────────

export async function leaveRoom(
  roomId: string,
  userId: string,
): Promise<ServiceResult<void>> {
  const { error: removeErr } = await dbRemovePlayer(roomId, userId);
  if (removeErr) return { ok: false, error: removeErr };

  // Check if the room still has players
  const { data: remaining } = await dbGetRoomPlayers(roomId);

  if (remaining.length === 0) {
    // Nobody left — delete the room
    await dbDeleteRoom(roomId);
  } else {
    // Check if the host just left; if so, transfer host to next player
    const { data: room } = await dbGetRoomById(roomId);
    if (room && room.host_user_id === userId) {
      const newHost = remaining.find(p => p.user_id !== userId);
      if (newHost) await dbUpdateRoomHost(roomId, newHost.user_id);
    }
  }

  return { ok: true, data: undefined };
}

// ── Read helpers ──────────────────────────────────────────────────────────

export async function getRoomWithPlayers(
  roomId: string,
): Promise<ServiceResult<{ room: RoomRow; players: RoomPlayerRow[] }>> {
  const { data: room, error: roomErr } = await dbGetRoomById(roomId);
  if (roomErr) return { ok: false, error: roomErr };
  if (!room) return { ok: false, error: 'Room not found.' };

  const { data: players, error: playersErr } = await dbGetRoomPlayers(roomId);
  if (playersErr) return { ok: false, error: playersErr };

  return { ok: true, data: { room, players } };
}
