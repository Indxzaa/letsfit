'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Zap, Coins, ArrowRight, RotateCcw } from 'lucide-react';

const EXERCISE_LABELS: Record<string, string> = {
  pushup: 'Push Ups', squat: 'Squats', 'jumping-jack': 'Jumping Jacks',
  'mountain-climber': 'Mountain Climbers', 'high-knees': 'High Knees', 'slow-burpee': 'Burpees',
};

function ResultsContent() {
  const params = useSearchParams();
  const exercise = params.get('exercise') ?? 'squat';
  const myReps = Number(params.get('myReps') ?? 24);
  const friendReps = Number(params.get('friendReps') ?? 20);
  const xp = Math.round(myReps * 5);
  const coins = Math.round(myReps * 2);
  const label = EXERCISE_LABELS[exercise] ?? exercise;
  const won = myReps >= friendReps;

  return (
    <div className="min-h-screen page-bg">
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

          {/* Hero banner */}
          <div
            className="neo-card p-8 mb-5 text-center"
            style={{ background: 'var(--neo-accent)', borderRadius: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.08 }}
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.5)',
                borderRadius: 0,
              }}
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="font-display text-4xl font-bold text-white uppercase mb-1">
              Workout Complete!
            </h1>
            <p className="text-white/80 text-sm font-semibold">{label} session finished</p>
          </div>

          {/* Player comparison */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="neo-card p-5 text-center"
              style={{ background: won ? 'var(--card-bg-green)' : 'var(--neo-surface)', borderRadius: 0 }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">You</div>
              <div className="font-display text-5xl font-black text-app tabular-nums mb-1">{myReps}</div>
              <div className="text-xs font-semibold text-muted">reps</div>
              {won && (
                <div
                  className="mt-3 inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ background: 'var(--neo-accent)', border: '2px solid #000', borderRadius: 0 }}
                >
                  Winner!
                </div>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neo-card p-5 text-center"
              style={{ background: !won ? 'var(--card-bg-green)' : 'var(--neo-surface)', borderRadius: 0 }}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Friend</div>
              <div className="font-display text-5xl font-black text-app tabular-nums mb-1">{friendReps}</div>
              <div className="text-xs font-semibold text-muted">reps</div>
              {!won && (
                <div
                  className="mt-3 inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ background: 'var(--neo-accent)', border: '2px solid #000', borderRadius: 0 }}
                >
                  Winner!
                </div>
              )}
            </motion.div>
          </div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div
              className="neo-card p-4 flex items-center gap-3"
              style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ background: 'var(--neo-accent)', border: '2px solid #000', boxShadow: '2px 2px 0 #000', borderRadius: 0 }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-subtle">XP Earned</div>
                <div className="font-display text-2xl font-black text-app">+{xp}</div>
              </div>
            </div>
            <div
              className="neo-card p-4 flex items-center gap-3"
              style={{ background: 'var(--card-bg-amber)', borderRadius: 0 }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ background: '#d97706', border: '2px solid #000', boxShadow: '2px 2px 0 #000', borderRadius: 0 }}
              >
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-subtle">Coins Earned</div>
                <div className="font-display text-2xl font-black text-app">+{coins}</div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="flex flex-col sm:flex-row gap-3"
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
              className="flex-1 py-3.5 font-display font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
              style={{
                background: 'var(--neo-accent)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
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
