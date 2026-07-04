'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Square, Camera } from 'lucide-react';

const EXERCISE_LABELS: Record<string, string> = {
  pushup: 'Push Ups', squat: 'Squats', 'jumping-jack': 'Jumping Jacks',
  'mountain-climber': 'Mountain Climbers', 'high-knees': 'High Knees', 'slow-burpee': 'Burpees',
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function SessionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const exercise = params.get('exercise') ?? 'squat';
  const label = EXERCISE_LABELS[exercise] ?? exercise;

  const [elapsed, setElapsed] = useState(0);
  const [myReps, setMyReps] = useState(0);
  const [friendReps, setFriendReps] = useState(0);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Mock friend rep increments
  useEffect(() => {
    const id = setInterval(() => {
      setFriendReps(r => r + 1);
    }, 2800 + Math.random() * 800);
    return () => clearInterval(id);
  }, []);

  const handleStop = () => {
    router.push(`/workout-together/results?exercise=${exercise}&myReps=${myReps}&friendReps=${friendReps}`);
  };

  return (
    <div className="min-h-screen page-bg flex flex-col">

      {/* Top HUD */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3"
        style={{ background: 'var(--neo-black)', borderBottom: '3px solid var(--neo-accent)' }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Now doing
          </div>
          <div className="font-display text-lg font-bold text-white uppercase">{label}</div>
        </div>
        <div className="text-center">
          <div className="font-display text-3xl font-black tabular-nums" style={{ color: 'var(--neo-accent)' }}>
            {fmt(elapsed)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Elapsed
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleStop}
          className="flex items-center gap-2 px-4 py-2 font-display font-bold uppercase tracking-wider text-xs cursor-pointer"
          style={{
            background: '#dc2626',
            border: '3px solid #000',
            boxShadow: '3px 3px 0 #000',
            color: '#fff',
            borderRadius: 0,
          }}
        >
          <Square className="w-3.5 h-3.5" /> Stop
        </motion.button>
      </div>

      {/* Panels */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-4 p-4 sm:p-8">

        {/* You */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="neo-card flex flex-col mb-4 sm:mb-0"
          style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}
        >
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '3px solid var(--neo-black)' }}>
            <span className="font-display text-sm font-bold uppercase tracking-wider text-app">You</span>
            <div
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5"
              style={{ background: 'var(--neo-accent)', border: '2px solid #000', color: '#fff', borderRadius: 0 }}
            >
              Active
            </div>
          </div>

          {/* Camera placeholder */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 min-h-48"
            style={{
              background: '#0a0a0a',
              border: '2px dashed rgba(255,255,255,0.15)',
              margin: '12px',
            }}
          >
            <Camera className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Camera — Coming Soon
            </span>
          </div>

          {/* Rep counter + tap to add */}
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderTop: '3px solid var(--neo-black)' }}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle">Your Reps</div>
              <div className="font-display text-4xl font-black text-app tabular-nums">{myReps}</div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMyReps(r => r + 1)}
              className="px-5 py-3 font-display font-black uppercase tracking-wider text-sm cursor-pointer text-white"
              style={{
                background: 'var(--neo-accent)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
                borderRadius: 0,
              }}
            >
              + Rep
            </motion.button>
          </div>
        </motion.div>

        {/* Friend */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="neo-card flex flex-col"
          style={{ background: 'var(--card-bg-blue)', borderRadius: 0 }}
        >
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '3px solid var(--neo-black)' }}>
            <span className="font-display text-sm font-bold uppercase tracking-wider text-app">Friend</span>
            <div
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 animate-pulse"
              style={{ background: 'var(--neo-blue)', border: '2px solid #000', color: '#fff', borderRadius: 0 }}
            >
              Syncing…
            </div>
          </div>

          {/* Camera placeholder */}
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 min-h-48"
            style={{
              background: '#0a0a0e',
              border: '2px dashed rgba(255,255,255,0.12)',
              margin: '12px',
            }}
          >
            <Camera className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Friend's Camera — Coming Soon
            </span>
          </div>

          {/* Friend rep counter */}
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderTop: '3px solid var(--neo-black)' }}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-subtle">Friend's Reps</div>
              <div className="font-display text-4xl font-black text-app tabular-nums">{friendReps}</div>
            </div>
            <div
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
              style={{ background: 'var(--neo-surface)', border: 'var(--neo-border-2)', color: 'var(--neo-blue)', borderRadius: 0 }}
            >
              Mock Data
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen page-bg" />}>
      <SessionContent />
    </Suspense>
  );
}
