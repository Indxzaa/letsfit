'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Crown, Copy, Check, Users, Dumbbell, Clock, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

function LobbyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get('mode') ?? 'create';
  const codeParam = params.get('code') ?? '';

  const roomCode = mode === 'create' ? 'LFIT42' : codeParam.toUpperCase();
  const isHost = mode === 'create';

  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleStart = () => router.push('/workout-together/exercise-select');

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-28 pb-20">

        <Link href="/workout-together" className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

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
              {isHost ? 'Share the code below with your friend.' : `Joined room ${roomCode}.`}
            </p>
          </div>

          {/* ── Room Code ── */}
          <div
            className="neo-card p-5"
            style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Room Code</div>
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex-1 py-3 text-center font-display font-black tracking-[0.35em] text-app"
                style={{
                  fontSize: 'clamp(1.8rem, 6vw, 2.5rem)',
                  background: 'var(--neo-white)',
                  border: 'var(--neo-border)',
                  letterSpacing: '0.35em',
                }}
              >
                {roomCode}
              </div>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95, y: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={handleCopy}
                className="flex flex-col items-center gap-1 px-4 py-3 text-xs font-black uppercase tracking-wider cursor-pointer min-w-[72px]"
                style={{
                  background: copied ? '#22c55e' : 'var(--neo-white)',
                  border: 'var(--neo-border)',
                  boxShadow: 'var(--neo-shadow)',
                  color: copied ? '#fff' : 'var(--neo-black)',
                  borderRadius: 0,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={copied ? 'check' : 'copy'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </motion.span>
                </AnimatePresence>
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
          </div>

          {/* ── Players ── */}
          <div
            className="neo-card overflow-hidden"
            style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}
          >
            <div className="px-5 pt-4 pb-3" style={{ borderBottom: '3px solid var(--neo-black)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Players (1/2)</span>
            </div>

            {/* You */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '2px solid var(--neo-black)' }}>
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0 neo-card-accent"
                style={{ borderRadius: 0 }}
              >
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base font-bold text-app uppercase">You</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--neo-accent)' }}>
                  {isHost ? '👑 Host' : 'Guest'}
                </div>
              </div>
              {/* Animated ready badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={ready ? 'ready' : 'not-ready'}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5"
                  style={{
                    background: ready ? '#22c55e' : 'var(--neo-surface)',
                    border: ready ? '2px solid #000' : 'var(--neo-border-2)',
                    boxShadow: ready ? '2px 2px 0 #000' : 'none',
                    color: ready ? '#fff' : 'var(--neo-black)',
                    borderRadius: 0,
                  }}
                >
                  {ready ? '✓ Ready' : 'Not Ready'}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Friend slot */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ opacity: 0.45 }}>
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0"
                style={{ background: 'var(--neo-surface)', border: 'var(--neo-border-2)', borderRadius: 0 }}
              >
                <Users className="w-5 h-5 text-subtle" />
              </div>
              <div className="flex-1">
                <div className="font-display text-base font-bold text-muted uppercase">Waiting…</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                  {isHost ? 'Guest' : 'Host'}
                </div>
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 animate-pulse"
                style={{ border: 'var(--neo-border-2)', color: 'var(--text-subtle)', borderRadius: 0 }}
              >
                Pending
              </div>
            </div>
          </div>

          {/* ── Workout Settings ── */}
          <div
            className="neo-card p-5"
            style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-4">
              Workout Settings
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Dumbbell className="w-4 h-4" />, label: 'Exercise', value: 'To be chosen' },
                { icon: <Clock className="w-4 h-4"    />, label: 'Duration', value: '5 min' },
              ].map(s => (
                <div
                  key={s.label}
                  className="p-3 flex items-center gap-2.5"
                  style={{ background: 'var(--neo-white)', border: 'var(--neo-border-2)', borderRadius: 0 }}
                >
                  <span className="text-subtle">{s.icon}</span>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-subtle">{s.label}</div>
                    <div className="font-display text-sm font-bold text-app">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col gap-3 pt-1">
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ y: 2, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={() => setReady(r => !r)}
              className="w-full py-4 font-display font-black uppercase tracking-widest text-base cursor-pointer"
              style={{
                background: ready ? 'var(--neo-surface)' : '#22c55e',
                border: 'var(--neo-border)',
                boxShadow: ready ? 'var(--neo-shadow-sm)' : 'var(--neo-shadow-lg)',
                color: ready ? 'var(--neo-black)' : '#fff',
                borderRadius: 0,
              }}
            >
              {ready ? '← Unready' : '✓ Ready'}
            </motion.button>

            {isHost && (
              <motion.button
                whileHover={ready ? { y: -3 } : undefined}
                whileTap={ready ? { y: 2, scale: 0.98 } : undefined}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={handleStart}
                disabled={!ready}
                className="w-full py-4 font-display font-black uppercase tracking-widest text-base cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'var(--neo-black)',
                  border: 'var(--neo-border)',
                  boxShadow: ready ? 'var(--neo-shadow-lg)' : 'none',
                  color: '#fff',
                  borderRadius: 0,
                }}
              >
                Start Workout <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          <div className="text-center pt-1">
            <Link href="/workout-together" className="text-xs text-subtle hover:text-muted transition-colors font-semibold uppercase tracking-wider">
              Leave Room
            </Link>
          </div>
        </motion.div>
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
