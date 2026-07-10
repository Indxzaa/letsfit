// Emoji reaction events + broadcast helpers — lightweight, ephemeral, no DB writes.
// Separate channel from workoutSession.ts so it works in both the lobby (no session)
// and an active workout session without coupling to round-based session state.

import { getSupabase } from '@/lib/supabase';

export type EmojiReactionEvent = {
  userId:  string;
  emojiId: string;
};

function reactionChannel(roomId: string) {
  return `emoji_reaction:${roomId}`;
}

export type ReactionEventHandler = (event: EmojiReactionEvent) => void;

export function subscribeEmojiReactions(
  roomId: string,
  onEvent: ReactionEventHandler,
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb
    .channel(reactionChannel(roomId))
    .on('broadcast', { event: 'reaction' }, ({ payload }) => {
      if (payload?.userId && payload?.emojiId) onEvent(payload as EmojiReactionEvent);
    })
    .subscribe();

  return () => { sb.removeChannel(channel); };
}

export async function broadcastEmojiReaction(
  roomId: string,
  event: EmojiReactionEvent,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.channel(reactionChannel(roomId)).send({
    type: 'broadcast',
    event: 'reaction',
    payload: event,
  });
}
