'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Square, Camera, Wifi, User, UserCircle2, Plus } from 'lucide-react';

const EXERCISE_LABELS: Record<string, string> = {
  pushup: 'Push Ups', squat: 'Squats', 'jumping-jack': 'Jumping Jacks',
  'mountain-climber': 'Mountain Climbers', 'high-knees': 'High Knees', 'slow-burpee': 'Burpees',
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function CameraPlaceholder({ label, icon, color }: { label: string; icon: React.ReactNode; color: string }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-4 min-h-44 relative"
      style={{ background: '#0c0c0c', border: `3px solid ${color}`, borderRadius: 0 }}
    >
      {/* Pulse dot */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: color }}
        />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Live</span>
      </div>

      <div
        className="w-16 h-16 flex items-center justify-center"
        style={{ background: `${color}18`, border: `2px solid ${color}40`, borderRadius: 0 }}
      >
        {icon}
      </div>
      <div className="text-center px-4">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {label}
        </div>
        <div className="text-[10px] font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Camera · Phase 2
        </div>
      </div>
    </div>
  );
}

function SessionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const exercise = params.get('exercise') ?? 'squat';
  const label = EXERCISE_LABELS[exercise] ?? exercise;

  const [elapsed, setElapsed] = useState(0);
  const [myReps, setMyReps] = useState(0);
  const [friendReps, setFriendReps] = useState(0);
  const [repFlash, setRepFlash] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFriendReps(r => r + 1), 2800);
    return () => clearInterval(id);
  }, []);

  const addRep = () => {
    setMyReps(r => r + 1);
    setRepFlash(true);
    setTimeout(() => setRepFlash(false), 200);
  };

  const handleStop = () => {
    router.push(`/workout-together/results?exercise=${exercise}&myReps=${myReps}&friendReps=${friendReps}`);
  };

  const leading = myReps >= friendReps;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--neo-black)' }}>

      {/* ── Top HUD ── */}
      <div
        className="sticky top-0 z-30 grid grid-cols-3 items-center px-4 sm:px-6 py-3"
        style={{ background: '#0a0a0a', borderBottom: '3px solid var(--neo-accent)' }}
      >
        {/* Left: exercise */}
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Exercise
          </div>
          <div className="font-display text-sm font-bold text-white uppercase truncate">{label}</div>
        </div>

        {/* Center: timer */}
        <div className="text-center">
          <div
            className="font-display font-black tabular-nums"
            style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: 'var(--neo-accent)' }}
          >
            {fmt(elapsed)}
          </div>
        </div>

        {/* Right: stop + connection */}
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <Wifi className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Mock
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-2 font-display font-black uppercase tracking-wider text-xs cursor-pointer"
            style={{ background: '#dc2626', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', borderRadius: 0 }}
          >
            <Square className="w-3 h-3" /> Stop
          </motion.button>
        </div>
      </div>

      {/* ── Score bar ── */}
      <div
        className="px-4 sm:px-6 py-2 flex items-center justify-between gap-4"
        style={{ background: '#111', borderBottom: '2px solid #222' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-black text-white uppercase">You</span>
          <span
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: 'var(--neo-accent)' }}
          >
            {myReps}
          </span>
        </div>
        <div
          className="text-[10px] font-black uppercase tracking-widest px-3 py-1"
          style={{
            background: leading ? 'var(--neo-accent)' : '#dc2626',
            border: '2px solid #000',
            color: '#fff',
            borderRadius: 0,
          }}
        >
          {leading ? 'Leading 🔥' : 'Behind 💪'}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: 'var(--neo-blue)' }}
          >
            {friendReps}
          </span>
          <span className="font-display text-sm font-black text-white uppercase">Friend</span>
        </div>
      </div>

      {/* ── Camera panels ── */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-6">

        {/* You */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-0 overflow-hidden"
          style={{ border: '3px solid var(--neo-black)', borderRadius: 0, background: '#0c0c0c' }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: 'var(--neo-accent)', borderBottom: '3px solid #000' }}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-white" />
              <span className="font-display text-sm font-black text-white uppercase">You</span>
            </div>
            <div
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 0 }}
            >
              Active
            </div>
          </div>

          <CameraPlaceholder
            label="Your camera"
            icon={<Camera className="w-8 h-8" style={{ color: 'var(--neo-accent)' }} />}
            color="#22c55e"
          />

          {/* Rep counter */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '3px solid var(--neo-black)', background: '#111' }}
          >
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Your Reps
              </div>
              <motion.div
                key={myReps}
                initial={{ scale: repFlash ? 1.3 : 1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                className="font-display font-black tabular-nums"
                style={{ fontSize: '2.4rem', color: repFlash ? 'var(--neo-accent)' : '#fff', lineHeight: 1 }}
              >
                {myReps}
              </motion.div>
            </div>
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ y: 2, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              onClick={addRep}
              className="flex items-center gap-2 px-5 py-3 font-display font-black uppercase tracking-wider text-sm cursor-pointer text-white"
              style={{
                background: 'var(--neo-accent)',
                border: '3px solid #000',
                boxShadow: '4px 4px 0 #000',
                borderRadius: 0,
              }}
            >
              <Plus className="w-4 h-4" /> Rep
            </motion.button>
          </div>
        </motion.div>

        {/* Friend */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex flex-col gap-0 overflow-hidden"
          style={{ border: '3px solid var(--neo-black)', borderRadius: 0, background: '#0c0c10' }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: 'var(--neo-blue)', borderBottom: '3px solid #000' }}
          >
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-4 h-4 text-white" />
              <span className="font-display text-sm font-black text-white uppercase">Friend</span>
            </div>
            <div
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 0 }}
            >
              Syncing
            </div>
          </div>

          <CameraPlaceholder
            label="Friend's camera"
            icon={<Camera className="w-8 h-8" style={{ color: 'var(--neo-blue)' }} />}
            color="#3b82f6"
          />

          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '3px solid var(--neo-black)', background: '#111' }}
          >
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Friend's Reps
              </div>
              <AnimatePresence>
                <motion.div
                  key={friendReps}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="font-display font-black tabular-nums"
                  style={{ fontSize: '2.4rem', color: '#fff', lineHeight: 1 }}
                >
                  {friendReps}
                </motion.div>
              </AnimatePresence>
            </div>
            <div
              className="px-4 py-2 text-[10px] font-black uppercase tracking-wider"
              style={{
                background: '#1a1a2a',
                border: '2px solid var(--neo-blue)',
                color: 'var(--neo-blue)',
                borderRadius: 0,
              }}
            >
              Auto
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--neo-black)' }} />}>
      <SessionContent />
    </Suspense>
  );
}
