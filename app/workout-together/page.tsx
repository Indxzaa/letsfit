'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, ArrowRight, Zap, Trophy, Wifi, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { createRoom, joinRoom } from '@/lib/multiplayer/service';

const FEATURES = [
  { icon: <Zap className="w-4 h-4" />,    text: 'Real-time rep sync' },
  { icon: <Trophy className="w-4 h-4" />, text: 'Compete & earn rewards' },
  { icon: <Wifi className="w-4 h-4" />,   text: 'Uses Wifi' },
];

export default function WorkoutTogetherPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [joinCode, setJoinCode]     = useState('');
  const [joinError, setJoinError]   = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading]     = useState(false);
  const [createError, setCreateError]     = useState('');

  const username = (user?.user_metadata?.username as string | undefined) ?? user?.email ?? 'Player';

  const handleCreate = async () => {
    if (!user) { setCreateError('Sign in to create a room.'); return; }
    setCreateLoading(true);
    setCreateError('');
    const result = await createRoom(user.id, username);
    setCreateLoading(false);
    if (!result.ok) { setCreateError(result.error); return; }
    router.push(`/workout-together/lobby?mode=create&roomId=${result.data.room.id}&code=${result.data.code}`);
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError('Enter a room code to join.'); return; }
    if (!user) { setJoinError('Sign in to join a room.'); return; }
    setJoinLoading(true);
    setJoinError('');
    const result = await joinRoom(code, user.id, username);
    setJoinLoading(false);
    if (!result.ok) { setJoinError(result.error); return; }
    router.push(`/workout-together/lobby?mode=join&roomId=${result.data.room.id}&code=${code}`);
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar />

      {/* Dot-grid decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--neo-black) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.04,
          zIndex: 0,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20" style={{ zIndex: 1 }}>
        <Link href="/dashboard" className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-14 text-center"
        >
          <div className="neo-badge mb-6 mx-auto w-fit">Multiplayer · Phase 2</div>
          <h1
            className="font-display font-bold text-app uppercase leading-none mb-5"
            style={{ fontSize: 'clamp(3rem, 9vw, 6rem)', letterSpacing: '-0.02em' }}
          >
            Workout<br />Together
          </h1>
          <p className="text-lg text-muted max-w-sm mx-auto leading-relaxed mb-8">
            Pick an exercise. Invite a friend. Race to the finish.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {FEATURES.map(f => (
              <div
                key={f.text}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ background: 'var(--neo-surface)', border: 'var(--neo-border-2)', borderRadius: 0 }}
              >
                <span style={{ color: 'var(--neo-accent)' }}>{f.icon}</span>
                <span className="text-app">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">

          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="neo-card p-8 cursor-pointer flex flex-col gap-6"
            style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}
            onClick={!createLoading ? handleCreate : undefined}
          >
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 flex items-center justify-center neo-card-accent" style={{ borderRadius: 0 }}>
                {createLoading
                  ? <Loader2 className="w-8 h-8 text-white animate-spin" />
                  : <Users className="w-8 h-8 text-white" />}
              </div>
              <div
                className="text-[10px] font-black uppercase tracking-widest px-2 py-1"
                style={{ background: 'var(--neo-accent)', border: '2px solid #000', color: '#fff', borderRadius: 0 }}
              >
                Host
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-3xl font-bold text-app uppercase mb-3">Create Room</h2>
              <p className="text-muted text-sm leading-relaxed">
                Become the host. A unique room code is generated instantly — share it with your friend.
              </p>
              {createError && (
                <p className="text-xs font-semibold mt-3" style={{ color: 'var(--neo-red)' }}>{createError}</p>
              )}
            </div>
            <div
              className="w-full py-3.5 neo-btn neo-btn-primary flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider pointer-events-none"
              style={{ borderRadius: 0, opacity: createLoading ? 0.7 : 1 }}
            >
              {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {createLoading ? 'Creating…' : 'Create a Room'}
              {!createLoading && <ArrowRight className="w-4 h-4" />}
            </div>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="neo-card p-8 flex flex-col gap-6"
            style={{ background: 'var(--card-bg-blue)', borderRadius: 0 }}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{ background: 'var(--neo-blue)', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)', borderRadius: 0 }}
              >
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div
                className="text-[10px] font-black uppercase tracking-widest px-2 py-1"
                style={{ border: '2px solid var(--neo-blue)', color: 'var(--neo-blue)', borderRadius: 0 }}
              >
                Guest
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-display text-3xl font-bold text-app uppercase mb-3">Join Room</h2>
              <p className="text-muted text-sm leading-relaxed mb-5">
                Got a code? Enter it below to join a friend's session and start competing immediately.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  className="neo-input text-sm uppercase tracking-[0.3em] font-black"
                  placeholder="Enter code (e.g. AB7KQ2)"
                  value={joinCode}
                  onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  maxLength={8}
                  style={{ borderRadius: 0 }}
                />
                {joinError && (
                  <p className="text-xs font-semibold" style={{ color: 'var(--neo-red)' }}>{joinError}</p>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97, y: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={handleJoin}
              disabled={joinLoading}
              className="w-full py-3.5 font-display font-black uppercase tracking-wider text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'var(--neo-blue)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
                color: '#fff',
                borderRadius: 0,
              }}
            >
              {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {joinLoading ? 'Joining…' : 'Join Room'}
              {!joinLoading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </motion.div>
        </div>

        <p className="text-center text-xs text-subtle font-semibold uppercase tracking-widest">
          Live rooms · Real Supabase backend
        </p>
      </div>
    </div>
  );
}
