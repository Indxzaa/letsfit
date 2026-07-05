'use client';

import { Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Zap, Coins, ArrowRight, RotateCcw, Crown, Medal } from 'lucide-react';

const EXERCISE_LABELS: Record<string, string> = {
  pushup: 'Push Ups', squat: 'Squats', 'jumping-jack': 'Jumping Jacks',
  'mountain-climber': 'Mountain Climbers', 'high-knees': 'High Knees', 'slow-burpee': 'Burpees',
};

// Fixed confetti — no hydration mismatch
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.cos((i / 24) * 2 * Math.PI) * (100 + (i % 5) * 35),
  y: Math.sin((i / 24) * 2 * Math.PI) * (80 + (i % 4) * 30) - 60,
  rotate: (i * 53) % 360,
  color: ['#22c55e','#facc15','#3b82f6','#a855f7','#ef4444','#f97316','#ffffff'][i % 7],
  size: 6 + (i % 3) * 5,
  delay: (i % 6) * 0.05,
  circle: i % 3 === 0,
}));

function ConfettiBurst() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="pointer-events-none fixed inset-0 flex items-start justify-center pt-32" style={{ zIndex: 200 }}>
      {CONFETTI.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3, rotate: p.rotate }}
          transition={{ duration: 2, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
          style={{
            position: 'absolute',
            width: p.size, height: p.size,
            background: p.color,
            borderRadius: p.circle ? '50%' : 0,
          }}
        />
      ))}
    </div>
  );
}

function ResultsContent() {
  const params = useSearchParams();
  const exercise   = params.get('exercise') ?? 'squat';
  const myReps     = Number(params.get('myReps') ?? 24);
  const friendReps = Number(params.get('friendReps') ?? 20);
  const xp    = Math.round(myReps * 5);
  const coins = Math.round(myReps * 2);
  const label = EXERCISE_LABELS[exercise] ?? exercise;
  const won   = myReps >= friendReps;
  const diff  = Math.abs(myReps - friendReps);

  return (
    <div className="min-h-screen page-bg">
      <ConfettiBurst />
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >

          {/* ── Hero banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="neo-card p-8 text-center"
            style={{ background: 'var(--neo-accent)', borderRadius: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', borderRadius: 0 }}
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white uppercase mb-2 leading-tight">
              Workout<br />Complete!
            </h1>
            <p className="text-white/80 text-sm font-semibold">{label} · Session finished</p>
          </motion.div>

          {/* ── Winner banner ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="neo-card py-4 px-5 flex items-center gap-3"
            style={{
              background: won ? 'var(--card-bg-green)' : 'var(--card-bg-blue)',
              borderColor: won ? '#22c55e' : 'var(--neo-blue)',
              boxShadow: won ? '5px 5px 0 #22c55e' : '5px 5px 0 var(--neo-blue)',
              borderRadius: 0,
            }}
          >
            {won ? <Crown className="w-6 h-6 shrink-0" style={{ color: '#22c55e' }} /> : <Medal className="w-6 h-6 shrink-0" style={{ color: 'var(--neo-blue)' }} />}
            <div>
              <div className="font-display text-lg font-black text-app uppercase">
                {won ? 'You Won!' : 'Friend Won!'}
              </div>
              <div className="text-xs text-muted font-semibold">
                {won
                  ? `You beat your friend by ${diff} rep${diff !== 1 ? 's' : ''}`
                  : `Your friend won by ${diff} rep${diff !== 1 ? 's' : ''}`}
              </div>
            </div>
          </motion.div>

          {/* ── Score comparison ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { name: 'You',    reps: myReps,     isWinner: won,  color: 'var(--card-bg-green)', accent: '#22c55e' },
              { name: 'Friend', reps: friendReps, isWinner: !won, color: 'var(--card-bg-blue)',  accent: 'var(--neo-blue)' },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + i * 0.06 }}
                className="neo-card p-5 text-center"
                style={{
                  background: p.isWinner ? p.color : 'var(--neo-surface)',
                  borderRadius: 0,
                  borderColor: p.isWinner ? p.accent : undefined,
                  boxShadow: p.isWinner ? `4px 4px 0 ${p.accent}` : 'var(--neo-shadow)',
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-2">{p.name}</div>
                <div className="font-display font-black tabular-nums text-app" style={{ fontSize: '3rem', lineHeight: 1 }}>
                  {p.reps}
                </div>
                <div className="text-xs font-semibold text-muted mt-1">reps</div>
                {p.isWinner && (
                  <div
                    className="mt-3 inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
                    style={{ background: p.accent, border: '2px solid #000', borderRadius: 0 }}
                  >
                    🏆 Winner
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* ── Rewards ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 gap-4"
          >
            <div
              className="neo-card p-4 flex items-center gap-3"
              style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}
            >
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0"
                style={{ background: 'var(--neo-accent)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', borderRadius: 0 }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-subtle">XP Earned</div>
                <div className="font-display text-2xl font-black text-app">+{xp}</div>
              </div>
            </div>
            <div
              className="neo-card p-4 flex items-center gap-3"
              style={{ background: 'var(--card-bg-amber)', borderRadius: 0 }}
            >
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0"
                style={{ background: '#d97706', border: '2px solid #000', boxShadow: '2px 2px 0 #000', borderRadius: 0 }}
              >
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-subtle">Coins Earned</div>
                <div className="font-display text-2xl font-black text-app">+{coins}</div>
              </div>
            </div>
          </motion.div>

          {/* ── Actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="flex flex-col sm:flex-row gap-3 pt-1"
          >
            <Link
              href="/workout-together/lobby?mode=create"
              className="flex-1 py-3.5 font-display font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
              style={{
                background: 'var(--neo-white)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
                color: 'var(--neo-black)',
                textDecoration: 'none',
                borderRadius: 0,
              }}
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-3.5 font-display font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2"
              style={{
                background: 'var(--neo-accent)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow-lg)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 0,
              }}
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen page-bg" />}>
      <ResultsContent />
    </Suspense>
  );
}
