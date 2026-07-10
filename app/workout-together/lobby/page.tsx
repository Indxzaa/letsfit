'use client';

import { Suspense, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Crown, Copy, Check, Users, ChevronRight,
  Loader2, AlertCircle, Wifi, WifiOff, CheckCircle2, UserPlus, Swords, Zap, Trophy,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import UserAvatar from '@/components/UserAvatar';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';
import { useAuth } from '@/components/AuthProvider';
import { useLobby } from '@/lib/multiplayer/hooks';
import { MULTIPLAYER_EXERCISES } from '@/lib/multiplayer/constants';
import { subscribeSessionEvents, broadcastSessionEvent } from '@/lib/multiplayer/workoutSession';
import { subscribeEmojiReactions, broadcastEmojiReaction } from '@/lib/multiplayer/reactions';
import { EmojiPicker } from '@/components/multiplayer/EmojiPicker';
import { EmojiReactionBubble } from '@/components/multiplayer/EmojiReactionBubble';
import { loadProgress } from '@/lib/progress';
import { SHOP_ITEMS } from '@/lib/shop';
import { SocialContext } from '@/components/social/SocialProvider';
import { playSound } from '@/lib/audio';

const BATTLE_ROUNDS_OPTIONS = [3, 5, 10] as const;

function lobbyStatus(playerCount: number, allReady: boolean): string {
  if (playerCount < 2) return 'Waiting for another player…';
  if (!allReady)       return 'Waiting for everyone to be ready…';
  return 'Ready to start!';
}

function lobbyStatusColor(playerCount: number, allReady: boolean): string {
  if (playerCount < 2) return 'var(--text-subtle)';
  if (!allReady)       return '#d97706';
  return '#22c55e';
}

function LobbyPlayerRow({ player, isThisHost, isMe, isReady, hasDivider, reaction, onReactionExpire }: {
  player: { id: string; user_id: string; username: string; is_ready: boolean };
  isThisHost: boolean; isMe: boolean; isReady: boolean; hasDivider: boolean;
  reaction?: { src: string | null; key: number };
  onReactionExpire?: () => void;
}) {
  const { avatarUrl } = useAvatarUrl(player.user_id);
  return (
    <div className="relative flex items-center gap-3 px-5 py-4"
      style={{ borderBottom: hasDivider ? '2px solid var(--neo-black)' : undefined }}>
      {reaction && (
        <EmojiReactionBubble
          src={reaction.src}
          reactionKey={reaction.key}
          onExpire={onReactionExpire ?? (() => {})}
        />
      )}
      <UserAvatar photoUrl={avatarUrl} letter={player.username} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-sm font-bold text-app uppercase truncate">{player.username}{isMe ? ' (You)' : ''}</span>
          {isThisHost && (
            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5"
              style={{ background: 'var(--neo-accent)', border: '1px solid #000', color: '#fff', borderRadius: 0 }}>Host</span>
          )}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-subtle mt-0.5">{isThisHost ? 'Room creator' : 'Guest'}</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={isReady ? 'ready' : 'waiting'}
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 28 }}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
          style={{ background: isReady ? '#22c55e' : 'var(--neo-surface)', border: isReady ? '2px solid #000' : 'var(--neo-border-2)', boxShadow: isReady ? '2px 2px 0 #000' : 'none', color: isReady ? '#fff' : 'var(--neo-black)', borderRadius: 0 }}>
          {isReady && <CheckCircle2 className="w-3 h-3" />}
          {isReady ? 'Ready' : 'Waiting'}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LobbyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const roomId = params.get('roomId') ?? '';
  const code   = params.get('code')   ?? '';
  const mode   = params.get('mode')   ?? 'join';

  const { user } = useAuth();
  const social = useContext(SocialContext);

  const {
    room, players, loading, error,
    leave, toggleReady, changeExercise, changeGameMode, changeBattleRounds, triggerStart, clearError,
  } = useLobby(roomId || null);

  const isHost = room ? room.host_user_id === user?.id : mode === 'create';
  const gameMode    = room?.game_mode     ?? 'freestyle';
  const battleRounds = room?.battle_rounds ?? 3;

  const [copied,          setCopied]          = useState(false);
  const [leaving,         setLeaving]         = useState(false);
  const [starting,        setStarting]        = useState(false);
  const [showFriendPick,  setShowFriendPick]  = useState(false);
  const [invitingSending, setInvitingSending] = useState<string | null>(null);
  // Initial exercise picker for the first round (host only, shown before start)
  const [pickedExercise,  setPickedExercise]  = useState<string>(room?.selected_exercise ?? MULTIPLAYER_EXERCISES[0].slug);

  const [progress] = useState(() => loadProgress());
  const ownedEmojiItems = SHOP_ITEMS.filter(i => i.type === 'emoji' && progress.unlockedItems.includes(i.id));
  const [reactions, setReactions] = useState<Record<string, { src: string | null; key: number }>>({});

  // Sync picked exercise when room loads
  useEffect(() => {
    if (room?.selected_exercise) setPickedExercise(room.selected_exercise);
  }, [room?.selected_exercise]);

  // Update presence
  useEffect(() => {
    if (!roomId || !social) return;
    social.presence.updateStatus('in_lobby', roomId);
    return () => { social.presence.updateStatus('online', null); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Guest follows host navigate event
  useEffect(() => {
    if (!roomId || isHost) return;
    const unsub = subscribeSessionEvents(roomId, (event) => {
      if (event.type === 'navigate') {
        router.push(
          `/workout-together/session?roomId=${event.roomId}&exercise=${event.exercise}&mode=join&gameMode=${event.gameMode}&battleRounds=${event.battleRounds ?? 3}`
        );
      }
    });
    return unsub;
  }, [roomId, isHost, router]);

  // Emoji reactions
  useEffect(() => {
    if (!roomId) return;
    return subscribeEmojiReactions(roomId, (event) => {
      if (event.userId === user?.id) return;
      const item = SHOP_ITEMS.find(i => i.id === event.emojiId);
      if (!item) return;
      setReactions(r => ({ ...r, [event.userId]: { src: item.value, key: (r[event.userId]?.key ?? 0) + 1 } }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleSendReaction = (emojiId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === emojiId);
    if (!item || !user?.id) return;
    setReactions(r => ({ ...r, [user.id]: { src: item.value, key: (r[user.id]?.key ?? 0) + 1 } }));
    playSound('emoji-sent');
    broadcastEmojiReaction(roomId, { userId: user.id, emojiId });
  };

  const displayCode = code || room?.room_code || '------';
  const me          = players.find(p => p.user_id === user?.id);
  const allReady    = players.length >= 2 && players.every(p => p.is_ready);
  const canStart    = isHost && allReady && (gameMode === 'freestyle' || !!pickedExercise);
  const statusText  = lobbyStatus(players.length, allReady);
  const statusColor = lobbyStatusColor(players.length, allReady);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode).catch(() => {});
    playSound('click');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleLeave = async () => {
    if (!user || !roomId) { router.push('/workout-together'); return; }
    setLeaving(true);
    await leave(user.id);
    router.push('/workout-together');
  };

  const handlePickExercise = async (slug: string) => {
    setPickedExercise(slug);
    await changeExercise(slug);
  };

  const handleStart = async () => {
    if (!canStart || starting || !room) return;
    playSound('workout-start');
    setStarting(true);
    await triggerStart();
    const exercise = gameMode === 'freestyle' ? MULTIPLAYER_EXERCISES[0].slug : pickedExercise;
    const gMode    = gameMode;
    const bRounds  = battleRounds;
    await broadcastSessionEvent(roomId, {
      type: 'navigate',
      roomId,
      exercise,
      mode: 'create',
      gameMode: gMode,
      battleRounds: bRounds,
      repGoal: 0,
    });
    router.push(
      `/workout-together/session?roomId=${roomId}&exercise=${exercise}&mode=create&gameMode=${gMode}&battleRounds=${bRounds}`
    );
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-28 pb-20">
        <button onClick={handleLeave} className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-4 flex items-start gap-3"
              style={{ background: '#fff0f0', border: '3px solid var(--neo-red)', boxShadow: '3px 3px 0 var(--neo-red)', borderRadius: 0 }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--neo-red)' }} />
              <div className="flex-1 text-sm font-semibold" style={{ color: 'var(--neo-red)' }}>{error}</div>
              <button onClick={clearError} className="text-xs font-bold cursor-pointer" style={{ color: 'var(--neo-red)' }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--neo-accent)' }} />
            <p className="text-sm text-muted font-semibold uppercase tracking-wider">Loading room…</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }} className="space-y-4"
          >
            {/* ── Header ── */}
            <div className="mb-2">
              <div className="neo-badge mb-3 w-fit">{isHost ? '👑 Host' : 'Guest'}</div>
              <h1 className="font-display text-4xl font-bold text-app uppercase mb-1">Lobby</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: statusColor }}>{statusText}</span>
              </div>
            </div>

            {/* ── Room Code ── */}
            <div className="neo-card p-5" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Room Code</div>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 py-3 text-center font-display font-black tracking-[0.35em] text-app"
                  style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', background: 'var(--neo-white)', border: 'var(--neo-border)' }}
                >{displayCode}</div>
                <motion.button
                  whileHover={{ y: -2 }} whileTap={{ y: 2, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1 px-4 py-3 text-xs font-black uppercase tracking-wider cursor-pointer min-w-[68px]"
                  style={{ background: copied ? '#22c55e' : 'var(--neo-white)', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)', color: copied ? '#fff' : 'var(--neo-black)', borderRadius: 0 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span key={copied ? 'check' : 'copy'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.span>
                  </AnimatePresence>
                  {copied ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
            </div>

            {/* ── Game Mode Selector ── */}
            <div className="neo-card overflow-hidden" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
              <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '3px solid var(--neo-black)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Game Mode</span>
                {!isHost && <span className="text-[10px] text-subtle uppercase tracking-wider">Host controls</span>}
              </div>
              <div className="p-4 space-y-3">
                {isHost ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Freestyle */}
                      <motion.button
                        whileHover={{ y: -2 }} whileTap={{ y: 2, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        onClick={() => changeGameMode('freestyle')}
                        className="flex flex-col items-center gap-2 p-4 cursor-pointer"
                        style={{
                          background: gameMode === 'freestyle' ? 'var(--neo-accent)' : 'var(--neo-white)',
                          border: gameMode === 'freestyle' ? '3px solid #000' : 'var(--neo-border-2)',
                          boxShadow: gameMode === 'freestyle' ? '3px 3px 0 #000' : 'none',
                          borderRadius: 0,
                        }}
                      >
                        <Zap className="w-5 h-5" style={{ color: gameMode === 'freestyle' ? '#fff' : 'var(--neo-accent)' }} strokeWidth={2.5} />
                        <span className="font-display text-xs font-black uppercase" style={{ color: gameMode === 'freestyle' ? '#fff' : 'var(--neo-black)' }}>Freestyle</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-center leading-snug" style={{ color: gameMode === 'freestyle' ? 'rgba(255,255,255,0.8)' : 'var(--text-subtle)' }}>Co-op · Endless</span>
                      </motion.button>
                      {/* 1v1 Battle */}
                      <motion.button
                        whileHover={{ y: -2 }} whileTap={{ y: 2, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        onClick={() => changeGameMode('battle')}
                        className="flex flex-col items-center gap-2 p-4 cursor-pointer"
                        style={{
                          background: gameMode === 'battle' ? 'var(--neo-blue)' : 'var(--neo-white)',
                          border: gameMode === 'battle' ? '3px solid #000' : 'var(--neo-border-2)',
                          boxShadow: gameMode === 'battle' ? '3px 3px 0 #000' : 'none',
                          borderRadius: 0,
                        }}
                      >
                        <Trophy className="w-5 h-5" style={{ color: gameMode === 'battle' ? '#fff' : 'var(--neo-blue)' }} strokeWidth={2.5} />
                        <span className="font-display text-xs font-black uppercase" style={{ color: gameMode === 'battle' ? '#fff' : 'var(--neo-black)' }}>1v1 Battle</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-center leading-snug" style={{ color: gameMode === 'battle' ? 'rgba(255,255,255,0.8)' : 'var(--text-subtle)' }}>Competitive · Rounds</span>
                      </motion.button>
                    </div>
                    {/* Battle rounds picker */}
                    <AnimatePresence>
                      {gameMode === 'battle' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-2 mt-1">Number of Rounds</div>
                          <div className="flex gap-2">
                            {BATTLE_ROUNDS_OPTIONS.map(n => (
                              <motion.button key={n} whileHover={{ y: -2 }} whileTap={{ y: 2, scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                onClick={() => changeBattleRounds(n)}
                                className="flex-1 py-2.5 font-display font-black text-sm uppercase cursor-pointer"
                                style={{
                                  background: battleRounds === n ? 'var(--neo-blue)' : 'var(--neo-white)',
                                  border: battleRounds === n ? '3px solid #000' : 'var(--neo-border-2)',
                                  boxShadow: battleRounds === n ? '3px 3px 0 #000' : 'none',
                                  color: battleRounds === n ? '#fff' : 'var(--neo-black)',
                                  borderRadius: 0,
                                }}
                              >{n}</motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex items-center gap-3 py-2">
                    {gameMode === 'freestyle'
                      ? <Zap className="w-5 h-5" style={{ color: 'var(--neo-accent)' }} strokeWidth={2.5} />
                      : <Trophy className="w-5 h-5" style={{ color: 'var(--neo-blue)' }} strokeWidth={2.5} />}
                    <div>
                      <p className="font-display text-sm font-black uppercase text-app">
                        {gameMode === 'freestyle' ? 'Freestyle' : `1v1 Battle — ${battleRounds} Rounds`}
                      </p>
                      <p className="text-[10px] text-subtle font-semibold uppercase tracking-wider">
                        {gameMode === 'freestyle' ? 'Co-op · Endless workout' : 'Competitive · First to finish wins each round'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isHost && gameMode === 'battle' && (
              <div className="neo-card overflow-hidden" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
                <div className="px-5 pt-4 pb-3" style={{ borderBottom: '3px solid var(--neo-black)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Starting Exercise</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {MULTIPLAYER_EXERCISES.map(ex => {
                      const selected = pickedExercise === ex.slug;
                      return (
                        <motion.button
                          key={ex.slug} whileHover={{ y: -2 }} whileTap={{ y: 2, scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          onClick={() => handlePickExercise(ex.slug)}
                          className="flex items-center gap-2.5 p-3 text-left cursor-pointer"
                          style={{
                            background: selected ? 'var(--neo-accent)' : ex.cardBg,
                            border: selected ? '3px solid #000' : 'var(--neo-border-2)',
                            boxShadow: selected ? '3px 3px 0 #000' : 'none',
                            borderRadius: 0,
                          }}
                        >
                          <span className="text-xl">{ex.emoji}</span>
                          <span className="font-display text-xs font-bold uppercase leading-tight" style={{ color: selected ? '#fff' : 'var(--text-app)' }}>{ex.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Players ── */}
            <div className="neo-card overflow-hidden" style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}>
              <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '3px solid var(--neo-black)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Players ({players.length}/2)</span>
                <div className="flex items-center gap-1.5">
                  {players.length >= 2 ? <Wifi className="w-3.5 h-3.5" style={{ color: '#22c55e' }} /> : <WifiOff className="w-3.5 h-3.5 text-subtle" />}
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: players.length >= 2 ? '#22c55e' : 'var(--text-subtle)' }}>
                    {players.length >= 2 ? 'Connected' : 'Waiting'}
                  </span>
                </div>
              </div>

              {players.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" style={{ color: 'var(--neo-accent)' }} />
                  <p className="text-sm text-muted font-semibold">Joining room…</p>
                </div>
              ) : (
                <>
                  {players.map((p, i) => {
                    const isThisHost = p.user_id === room?.host_user_id;
                    const isMe = p.user_id === user?.id;
                    return (
                      <LobbyPlayerRow
                        key={p.id}
                        player={p}
                        isThisHost={isThisHost}
                        isMe={isMe}
                        isReady={p.is_ready}
                        hasDivider={i < players.length - 1}
                        reaction={reactions[p.user_id]}
                        onReactionExpire={() => setReactions(r => ({ ...r, [p.user_id]: { ...r[p.user_id], src: null } }))}
                      />
                    );
                  })}

                  {/* Empty slot + Invite Friends */}
                  {players.length < 2 && (
                    <div>
                      <div className="flex items-center gap-3 px-5 py-4" style={{ opacity: 0.4 }}>
                        <div className="w-11 h-11 flex items-center justify-center shrink-0"
                          style={{ background: 'var(--neo-surface)', border: 'var(--neo-border-2)', borderRadius: 0 }}>
                          <Users className="w-5 h-5 text-subtle" />
                        </div>
                        <div className="flex-1">
                          <div className="font-display text-sm font-bold text-muted uppercase">Waiting for player…</div>
                          <div className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Guest</div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 animate-pulse"
                          style={{ border: 'var(--neo-border-2)', color: 'var(--text-subtle)', borderRadius: 0 }}>Pending</div>
                      </div>

                      {isHost && social && social.friends.friends.length > 0 && (
                        <div style={{ borderTop: '2px solid var(--neo-black)' }}>
                          <button onClick={() => setShowFriendPick(o => !o)}
                            className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer"
                            style={{ background: showFriendPick ? 'var(--card-bg-blue)' : 'var(--neo-surface)', border: 'none', color: 'var(--neo-black)' }}>
                            <UserPlus size={13} strokeWidth={2.5} /> Invite a Friend
                          </button>
                          <AnimatePresence>
                            {showFriendPick && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                                style={{ overflow: 'hidden', borderTop: '2px solid var(--neo-black)' }}>
                                {social.friends.friends.map((f, i) => {
                                  const liveStatus = social.presence.presenceMap.get(f.profile.id)?.status ?? 'offline';
                                  const isOnline = liveStatus !== 'offline';
                                  return (
                                    <div key={f.relation.id} className="flex items-center gap-3 px-5 py-3"
                                      style={{ borderBottom: i < social.friends.friends.length - 1 ? '2px solid var(--neo-black)' : 'none' }}>
                                      <div style={{ width: 28, height: 28, background: isOnline ? 'var(--neo-accent)' : 'var(--neo-surface)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="font-display text-xs font-black" style={{ color: isOnline ? '#fff' : 'var(--neo-black)' }}>{f.profile.username[0]?.toUpperCase()}</span>
                                      </div>
                                      <span className="font-display text-xs font-black uppercase flex-1 text-app">{f.profile.username}</span>
                                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isOnline ? '#22c55e' : 'var(--text-subtle)' }}>{isOnline ? liveStatus.replace('_', ' ') : 'Offline'}</span>
                                      {isOnline && (
                                        <button disabled={invitingSending === f.profile.id}
                                          onClick={async () => {
                                            if (!user || !roomId) return;
                                            playSound('invite');
                                            setInvitingSending(f.profile.id);
                                            const senderUsername = user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'User';
                                            const senderAvatar = user.user_metadata?.avatar ?? null;
                                            await social.invites.sendInvite(f.profile.id, roomId, senderUsername, senderAvatar);
                                            setInvitingSending(null);
                                          }}
                                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1.5"
                                          style={{ background: invitingSending === f.profile.id ? 'var(--neo-surface)' : 'var(--neo-accent)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', color: invitingSending === f.profile.id ? 'var(--neo-black)' : '#fff', cursor: invitingSending === f.profile.id ? 'not-allowed' : 'pointer' }}>
                                          <Swords size={10} strokeWidth={2.5} />
                                          {invitingSending === f.profile.id ? '...' : 'Invite'}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-col gap-3 pt-1">
              {ownedEmojiItems.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ background: 'var(--neo-white)', border: 'var(--neo-border-2)', borderRadius: 0 }}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-subtle">Send a Reaction</span>
                  <EmojiPicker items={ownedEmojiItems} onSend={handleSendReaction} variant="light" />
                </div>
              )}
              <motion.button
                whileHover={{ y: -3 }} whileTap={{ y: 2, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => { if (!user) return; playSound(me?.is_ready ? 'click' : 'ready'); toggleReady(user.id, me?.is_ready ?? false); }}
                disabled={!user}
                className="w-full py-4 font-display font-black uppercase tracking-widest text-base cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: me?.is_ready ? 'var(--neo-surface)' : '#22c55e',
                  border: 'var(--neo-border)',
                  boxShadow: me?.is_ready ? 'var(--neo-shadow-sm)' : 'var(--neo-shadow-lg)',
                  color: me?.is_ready ? 'var(--neo-black)' : '#fff',
                  borderRadius: 0,
                }}
              >
                {me?.is_ready ? <><CheckCircle2 className="w-5 h-5" /> Ready — Click to Unready</> : '✓ Mark as Ready'}
              </motion.button>

              {isHost && (
                <motion.button
                  whileHover={canStart ? { y: -3 } : undefined}
                  whileTap={canStart ? { y: 2, scale: 0.98 } : undefined}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={handleStart}
                  disabled={!canStart || starting}
                  className="w-full py-4 font-display font-black uppercase tracking-widest text-base flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  style={{
                    background: canStart ? 'var(--neo-black)' : 'var(--neo-surface)',
                    border: 'var(--neo-border)',
                    boxShadow: canStart ? 'var(--neo-shadow-lg)' : 'none',
                    color: canStart ? '#fff' : 'var(--text-subtle)',
                    opacity: !canStart ? 0.5 : 1,
                    cursor: canStart ? 'pointer' : 'not-allowed',
                    borderRadius: 0,
                  }}
                >
                  {starting
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Starting…</>
                    : canStart
                      ? <>Start Workout <ChevronRight className="w-5 h-5" /></>
                      : statusText}
                </motion.button>
              )}
            </div>

            <div className="text-center pt-1">
              <button onClick={handleLeave} disabled={leaving}
                className="text-xs text-subtle hover:text-muted transition-colors font-semibold uppercase tracking-wider cursor-pointer">
                {leaving ? 'Leaving…' : 'Leave Room'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen page-bg" />}>
      <LobbyContent />
    </Suspense>
  );
}

