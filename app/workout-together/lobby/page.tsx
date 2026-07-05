'use client';

import { useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Crown, Copy, Check, Users, Dumbbell, Clock,
  ChevronRight, Loader2, AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { useLobby } from '@/lib/multiplayer/hooks';
import { useState } from 'react';

function LobbyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const roomId  = params.get('roomId') ?? '';
  const code    = params.get('code') ?? '';
  const mode    = params.get('mode') ?? 'join';

  const { user } = useAuth();
  const { room, players, loading, error, leave, clearError } = useLobby(roomId || null);

  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isHost      = room ? room.host_user_id === user?.id : mode === 'create';
  const displayCode = code || room?.room_code || '------';

  // Leave room on browser back / unmount only when user navigates away deliberately
  const handleLeave = async () => {
    if (!user || !roomId) { router.push('/workout-together'); return; }
    setLeaving(true);
    await leave(user.id);
    router.push('/workout-together');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleStart = () => {
    router.push('/workout-together/exercise-select');
  };

  if (!roomId) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <p className="text-muted text-sm">No room ID. <Link href="/workout-together" className="accent-text underline">Go back</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-28 pb-20">

        <button onClick={handleLeave} className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
            {/* Page title */}
            <div className="mb-6">
              <div className="neo-badge mb-3 w-fit">{isHost ? 'Host' : 'Guest'}</div>
              <h1 className="font-display text-4xl font-bold text-app uppercase mb-1">Lobby</h1>
              <p className="text-sm text-muted">
                {isHost ? 'Share the code below with your friend.' : `Joined room ${displayCode}.`}
              </p>
            </div>

            {/* Room Code */}
            <div className="neo-card p-5" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Room Code</div>
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex-1 py-3 text-center font-display font-black tracking-[0.35em] text-app"
                  style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', background: 'var(--neo-white)', border: 'var(--neo-border)' }}
                >
                  {displayCode}
                </div>
                <motion.button
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95, y: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1 px-4 py-3 text-xs font-black uppercase tracking-wider cursor-pointer min-w-[72px]"
                  style={{
                    background: copied ? '#22c55e' : 'var(--neo-white)',
                    border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)',
                    color: copied ? '#fff' : 'var(--neo-black)', borderRadius: 0,
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span key={copied ? 'check' : 'copy'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </motion.span>
                  </AnimatePresence>
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </div>

            {/* Players */}
            <div className="neo-card overflow-hidden" style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: '3px solid var(--neo-black)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">
                  Players ({players.length}/{2})
                </span>
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
                        <div className="w-11 h-11 flex items-center justify-center shrink-0 neo-card-accent" style={{ borderRadius: 0 }}>
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-base font-bold text-app uppercase truncate">
                            {p.username}{isMe ? ' (You)' : ''}
                          </div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--neo-accent)' }}>
                            {isThisHost ? '👑 Host' : 'Guest'}
                          </div>
                        </div>
                        <div
                          className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5"
                          style={{
                            background: 'var(--neo-surface)',
                            border: 'var(--neo-border-2)',
                            color: 'var(--neo-black)',
                            borderRadius: 0,
                          }}
                        >
                          Waiting
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty slot when only 1 player */}
                  {players.length < 2 && (
                    <div className="flex items-center gap-3 px-5 py-4" style={{ opacity: 0.45 }}>
                      <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ background: 'var(--neo-surface)', border: 'var(--neo-border-2)', borderRadius: 0 }}>
                        <Users className="w-5 h-5 text-subtle" />
                      </div>
                      <div className="flex-1">
                        <div className="font-display text-base font-bold text-muted uppercase">Waiting…</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-subtle">Guest</div>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 animate-pulse" style={{ border: 'var(--neo-border-2)', color: 'var(--text-subtle)', borderRadius: 0 }}>Pending</div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Workout settings */}
            <div className="neo-card p-5" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-4">Workout Settings</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Dumbbell className="w-4 h-4" />, label: 'Exercise', value: room?.selected_exercise ?? 'To be chosen' },
                  { icon: <Clock className="w-4 h-4" />,    label: 'Duration', value: `${Math.round((room?.duration_seconds ?? 300) / 60)} min` },
                ].map(s => (
                  <div key={s.label} className="p-3 flex items-center gap-2.5" style={{ background: 'var(--neo-white)', border: 'var(--neo-border-2)', borderRadius: 0 }}>
                    <span className="text-subtle">{s.icon}</span>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-subtle">{s.label}</div>
                      <div className="font-display text-sm font-bold text-app">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1">
              {isHost && (
                <motion.button
                  whileHover={{ y: -3 }} whileTap={{ y: 2, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  onClick={handleStart}
                  disabled={players.length < 2}
                  className="w-full py-4 font-display font-black uppercase tracking-widest text-base cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--neo-black)',
                    border: 'var(--neo-border)',
                    boxShadow: players.length >= 2 ? 'var(--neo-shadow-lg)' : 'none',
                    color: '#fff', borderRadius: 0,
                  }}
                >
                  {players.length < 2 ? 'Waiting for friend…' : <>Start Workout <ChevronRight className="w-5 h-5" /></>}
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
