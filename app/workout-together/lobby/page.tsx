'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Crown, Copy, Check, Users, ChevronRight,
  Loader2, AlertCircle, Wifi, WifiOff, CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { useLobby } from '@/lib/multiplayer/hooks';
import { MULTIPLAYER_EXERCISES } from '@/lib/multiplayer/constants';
import { subscribeSessionEvents, broadcastSessionEvent } from '@/lib/multiplayer/workoutSession';

const DURATION_OPTIONS = [
  { label: '30s',  value: 30  },
  { label: '60s',  value: 60  },
  { label: '90s',  value: 90  },
  { label: '2m',   value: 120 },
];

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

function LobbyContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const roomId  = params.get('roomId') ?? '';
  const code    = params.get('code')   ?? '';
  const mode    = params.get('mode')   ?? 'join';

  const { user } = useAuth();
  const {
    room, players, loading, error,
    leave, toggleReady, changeExercise, changeDuration, triggerStart, clearError,
  } = useLobby(roomId || null);

  const isHost = room ? room.host_user_id === user?.id : mode === 'create';

  const [copied,   setCopied]   = useState(false);
  const [leaving,  setLeaving]  = useState(false);
  const [starting, setStarting] = useState(false);

  // Guest listens for the host's navigate broadcast and follows automatically
  useEffect(() => {
    if (!roomId || isHost) return;
    const unsub = subscribeSessionEvents(roomId, (event) => {
      if (event.type === 'navigate') {
        router.push(
          `/workout-together/session?roomId=${event.roomId}&exercise=${event.exercise}&mode=join`
        );
      }
    });
    return unsub;
  }, [roomId, isHost, router]);
  const displayCode = code || room?.room_code || '------';
  const me          = players.find(p => p.user_id === user?.id);
  const allReady    = players.length >= 2 && players.every(p => p.is_ready);
  const canStart    = isHost && allReady;
  const statusText  = lobbyStatus(players.length, allReady);
  const statusColor = lobbyStatusColor(players.length, allReady);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleLeave = async () => {
    if (!user || !roomId) { router.push('/workout-together'); return; }
    setLeaving(true);
    await leave(user.id);
    router.push('/workout-together');
  };

  const handleStart = async () => {
    if (!canStart || starting || !room) return;
    setStarting(true);
    await triggerStart();
    const exercise = room.selected_exercise ?? 'squat';
    await broadcastSessionEvent(roomId, { type: 'navigate', roomId, exercise, mode: 'create' });
    router.push(`/workout-together/session?roomId=${roomId}&exercise=${exercise}&mode=create`);
  };

  if (!roomId) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <p className="text-muted text-sm">
          No room ID.{' '}
          <Link href="/workout-together" className="accent-text underline">Go back</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-28 pb-20">

        {/* Back */}
        <button onClick={handleLeave} className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Error banner */}
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
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* ── Header ── */}
            <div className="mb-2">
              <div className="neo-badge mb-3 w-fit">{isHost ? '👑 Host' : 'Guest'}</div>
              <h1 className="font-display text-4xl font-bold text-app uppercase mb-1">Lobby</h1>
              {/* Live status */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: statusColor }}>
                  {statusText}
                </span>
              </div>
            </div>

            {/* ── Room Code ── */}
            <div className="neo-card p-5" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Room Code</div>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 py-3 text-center font-display font-black tracking-[0.35em] text-app"
                  style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', background: 'var(--neo-white)', border: 'var(--neo-border)' }}
                >
                  {displayCode}
                </div>
                <motion.button
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1 px-4 py-3 text-xs font-black uppercase tracking-wider cursor-pointer min-w-[68px]"
                  style={{
                    background: copied ? '#22c55e' : 'var(--neo-white)',
                    border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)',
                    color: copied ? '#fff' : 'var(--neo-black)', borderRadius: 0,
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={copied ? 'check' : 'copy'}
                      initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.span>
                  </AnimatePresence>
                  {copied ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
            </div>

            {/* ── Players ── */}
            <div className="neo-card overflow-hidden" style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}>
              <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '3px solid var(--neo-black)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">
                  Players ({players.length}/2)
                </span>
                <div className="flex items-center gap-1.5">
                  {players.length >= 2
                    ? <Wifi className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                    : <WifiOff className="w-3.5 h-3.5 text-subtle" />}
                  <span className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: players.length >= 2 ? '#22c55e' : 'var(--text-subtle)' }}>
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
                      <div
                        key={p.id}
                        className="flex items-center gap-3 px-5 py-4"
                        style={{ borderBottom: i < players.length - 1 ? '2px solid var(--neo-black)' : undefined }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-11 h-11 flex items-center justify-center shrink-0 text-lg font-bold"
                          style={{
                            background: isThisHost ? 'var(--neo-accent)' : 'var(--neo-blue)',
                            border: '3px solid #000', boxShadow: '2px 2px 0 #000', borderRadius: 0,
                            color: '#fff',
                          }}
                        >
                          {isThisHost ? <Crown className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-bold text-app uppercase truncate">
                              {p.username}{isMe ? ' (You)' : ''}
                            </span>
                            {isThisHost && (
                              <span
                                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5"
                                style={{ background: 'var(--neo-accent)', border: '1px solid #000', color: '#fff', borderRadius: 0 }}
                              >
                                Host
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-subtle mt-0.5">
                            {isThisHost ? 'Room creator' : 'Guest'}
                          </div>
                        </div>

                        {/* Animated ready badge */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={p.is_ready ? 'ready' : 'waiting'}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5"
                            style={{
                              background: p.is_ready ? '#22c55e' : 'var(--neo-surface)',
                              border: p.is_ready ? '2px solid #000' : 'var(--neo-border-2)',
                              boxShadow: p.is_ready ? '2px 2px 0 #000' : 'none',
                              color: p.is_ready ? '#fff' : 'var(--neo-black)',
                              borderRadius: 0,
                            }}
                          >
                            {p.is_ready && <CheckCircle2 className="w-3 h-3" />}
                            {p.is_ready ? 'Ready' : 'Waiting'}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Empty slot */}
                  {players.length < 2 && (
                    <div className="flex items-center gap-3 px-5 py-4" style={{ opacity: 0.4 }}>
                      <div className="w-11 h-11 flex items-center justify-center shrink-0"
                        style={{ background: 'var(--neo-surface)', border: 'var(--neo-border-2)', borderRadius: 0 }}>
                        <Users className="w-5 h-5 text-subtle" />
                      </div>
                      <div className="flex-1">
                        <div className="font-display text-sm font-bold text-muted uppercase">Waiting for player…</div>
                        <div className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Guest</div>
                      </div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 animate-pulse"
                        style={{ border: 'var(--neo-border-2)', color: 'var(--text-subtle)', borderRadius: 0 }}
                      >
                        Pending
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Workout Settings ── */}
            <div className="neo-card overflow-hidden" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: '3px solid var(--neo-black)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Workout Settings</span>
                  {!isHost && (
                    <span className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Host controls</span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Exercise */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Exercise</div>
                  {isHost ? (
                    <div className="grid grid-cols-2 gap-2">
                      {MULTIPLAYER_EXERCISES.map(ex => {
                        const selected = room?.selected_exercise === ex.slug;
                        return (
                          <motion.button
                            key={ex.slug}
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            onClick={() => changeExercise(ex.slug)}
                            className="flex items-center gap-2.5 p-3 text-left cursor-pointer"
                            style={{
                              background: selected ? 'var(--neo-accent)' : ex.cardBg,
                              border: selected ? '3px solid #000' : 'var(--neo-border-2)',
                              boxShadow: selected ? '3px 3px 0 #000' : 'none',
                              borderRadius: 0,
                            }}
                          >
                            <span className="text-xl">{ex.emoji}</span>
                            <span
                              className="font-display text-xs font-bold uppercase leading-tight"
                              style={{ color: selected ? '#fff' : 'var(--text-app)' }}
                            >
                              {ex.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="p-3 font-display text-base font-bold text-app"
                      style={{ background: 'var(--neo-white)', border: 'var(--neo-border-2)', borderRadius: 0 }}
                    >
                      {room?.selected_exercise
                        ? MULTIPLAYER_EXERCISES.find(e => e.slug === room.selected_exercise)?.name ?? room.selected_exercise
                        : 'Waiting for host…'}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Duration</div>
                  {isHost ? (
                    <div className="flex gap-2">
                      {DURATION_OPTIONS.map(opt => {
                        const selected = room?.duration_seconds === opt.value;
                        return (
                          <motion.button
                            key={opt.value}
                            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            onClick={() => changeDuration(opt.value)}
                            className="flex-1 py-2.5 font-display font-black text-sm uppercase cursor-pointer"
                            style={{
                              background: selected ? 'var(--neo-accent)' : 'var(--neo-white)',
                              border: selected ? '3px solid #000' : 'var(--neo-border-2)',
                              boxShadow: selected ? '3px 3px 0 #000' : 'none',
                              color: selected ? '#fff' : 'var(--neo-black)',
                              borderRadius: 0,
                            }}
                          >
                            {opt.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="p-3 font-display text-base font-bold text-app"
                      style={{ background: 'var(--neo-white)', border: 'var(--neo-border-2)', borderRadius: 0 }}
                    >
                      {room?.duration_seconds
                        ? DURATION_OPTIONS.find(o => o.value === room.duration_seconds)?.label ?? `${room.duration_seconds}s`
                        : 'Waiting for host…'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-col gap-3 pt-1">
              {/* Ready toggle — all players */}
              <motion.button
                whileHover={{ y: -3 }} whileTap={{ y: 2, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => user && toggleReady(user.id, me?.is_ready ?? false)}
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
                {me?.is_ready
                  ? <><CheckCircle2 className="w-5 h-5" /> Ready — Click to Unready</>
                  : '✓ Mark as Ready'}
              </motion.button>

              {/* Start — host only, requires all ready */}
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
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="text-xs text-subtle hover:text-muted transition-colors font-semibold uppercase tracking-wider cursor-pointer"
              >
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
