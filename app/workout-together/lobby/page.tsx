'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Crown, Clock, Dumbbell, Copy, Check, Users } from 'lucide-react';
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
  const [exercise, setExercise] = useState('Squats');
  const [duration, setDuration] = useState('5 min');

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    router.push('/workout-together/exercise-select');
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        <Link href="/workout-together" className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-6">
            <div className="neo-badge mb-4 w-fit">
              {isHost ? 'You are the Host' : 'Joined as Guest'}
            </div>
            <h1 className="font-display text-4xl font-bold text-app uppercase mb-2">
              Lobby
            </h1>
            <p className="text-muted text-sm">
              {isHost ? 'Share the code below with a friend.' : `Joined room ${roomCode}.`}
            </p>
          </div>

          {/* Room Code */}
          <div
            className="neo-card p-6 mb-5 flex items-center justify-between gap-4"
            style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-1">Room Code</div>
              <div className="font-display text-4xl font-bold text-app tracking-[0.2em]">{roomCode}</div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer"
              style={{
                background: copied ? '#22c55e' : 'var(--neo-white)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow-sm)',
                color: copied ? '#fff' : 'var(--neo-black)',
                borderRadius: 0,
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>

          {/* Players */}
          <div
            className="neo-card p-6 mb-5"
            style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-4">
              Players
            </div>
            <div className="flex flex-col gap-3">
              {/* You */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center neo-card-accent"
                  style={{ borderRadius: 0 }}
                >
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-app text-sm">You</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--neo-accent)' }}>
                    {isHost ? 'Host' : 'Guest'}
                  </div>
                </div>
                <div className="ml-auto">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1"
                    style={{
                      background: ready ? '#22c55e' : 'var(--neo-surface)',
                      border: 'var(--neo-border-2)',
                      color: ready ? '#fff' : 'var(--neo-black)',
                      borderRadius: 0,
                    }}
                  >
                    {ready ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              </div>

              {/* Friend slot */}
              <div className="flex items-center gap-3" style={{ opacity: 0.55 }}>
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    background: 'var(--neo-surface)',
                    border: 'var(--neo-border-2)',
                    borderRadius: 0,
                  }}
                >
                  <Users className="w-5 h-5 text-subtle" />
                </div>
                <div>
                  <div className="font-bold text-muted text-sm">Waiting for player…</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
                    {isHost ? 'Guest' : 'Host'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workout settings (read-only display) */}
          <div
            className="neo-card p-5 mb-6 grid grid-cols-2 gap-4"
            style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-3.5 h-3.5 text-subtle" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Exercise</span>
              </div>
              <div className="font-display text-lg font-bold text-app">{exercise}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5 text-subtle" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-subtle">Duration</span>
              </div>
              <div className="font-display text-lg font-bold text-app">{duration}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 1, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={() => setReady(r => !r)}
              className="flex-1 py-3.5 font-display font-bold uppercase tracking-wider text-sm cursor-pointer"
              style={{
                background: ready ? 'var(--neo-surface)' : '#22c55e',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
                color: ready ? 'var(--neo-black)' : '#fff',
                borderRadius: 0,
              }}
            >
              {ready ? 'Unready' : 'Ready'}
            </motion.button>

            {isHost && (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 1, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={handleStart}
                disabled={!ready}
                className="flex-1 py-3.5 font-display font-bold uppercase tracking-wider text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--neo-black)',
                  border: 'var(--neo-border)',
                  boxShadow: ready ? 'var(--neo-shadow)' : 'none',
                  color: '#fff',
                  borderRadius: 0,
                }}
              >
                Start Workout →
              </motion.button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/workout-together" className="text-xs text-subtle hover:text-muted transition-colors font-semibold">
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
