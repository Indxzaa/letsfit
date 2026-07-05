// Supabase Realtime broadcast signaling for WebRTC.
// SDP and ICE are never written to the database — they travel through
// ephemeral broadcast messages on a per-room channel.

import { getSupabase } from '@/lib/supabase';

export type SignalingMessage =
  | { type: 'offer';     sdp: string;                   fromUserId: string }
  | { type: 'answer';    sdp: string;                   fromUserId: string }
  | { type: 'ice';       candidate: RTCIceCandidateInit; fromUserId: string }
  | { type: 'leave';                                    fromUserId: string };

type SignalingHandler = (msg: SignalingMessage) => void;

/** Returns the broadcast channel name for a given room. */
function signalingChannel(roomId: string) {
  return `signaling:${roomId}`;
}

/**
 * Subscribe to signaling messages for a room.
 * Returns an unsubscribe function — call it on component unmount.
 */
export function subscribeSignaling(
  roomId: string,
  onMessage: SignalingHandler,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb
    .channel(signalingChannel(roomId))
    .on('broadcast', { event: 'signal' }, ({ payload }) => {
      if (payload && payload.type) onMessage(payload as SignalingMessage);
    })
    .subscribe();

  return () => { sb.removeChannel(channel); };
}

/** Send a signaling message to all peers in the room (broadcast, no DB). */
export async function sendSignal(
  roomId: string,
  message: SignalingMessage,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.channel(signalingChannel(roomId)).send({
    type: 'broadcast',
    event: 'signal',
    payload: message,
  });
}
