'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function WorkoutTogetherPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreate = () => {
    router.push('/workout-together/lobby?mode=create');
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError('Enter a room code to join.'); return; }
    setJoinError('');
    router.push(`/workout-together/lobby?mode=join&code=${code}`);
  };

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        <Link href="/dashboard" className="link-back mb-10 inline-flex cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-12 text-center"
        >
          <div className="neo-badge mb-5 mx-auto w-fit">Multiplayer</div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-app uppercase leading-tight mb-4">
            Workout Together
          </h1>
          <p className="text-lg text-muted max-w-md mx-auto">
            Exercise with a friend in real-time. Compete, motivate each other, and earn rewards.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={handleCreate}
            className="neo-card p-8 cursor-pointer flex flex-col items-start gap-5"
            style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}
          >
            <div
              className="w-14 h-14 flex items-center justify-center neo-card-accent"
              style={{ borderRadius: 0 }}
            >
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-app uppercase mb-2">
                Create Room
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Become the host and invite a friend. Share your room code and start working out together.
              </p>
            </div>
            <div
              className="w-full py-3 neo-btn neo-btn-primary flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              style={{ borderRadius: 0 }}
            >
              Create a Room <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14 }}
            className="neo-card p-8 flex flex-col items-start gap-5"
            style={{ background: 'var(--card-bg-blue)', borderRadius: 0 }}
          >
            <div
              className="w-14 h-14 flex items-center justify-center"
              style={{
                background: 'var(--neo-blue)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
                borderRadius: 0,
              }}
            >
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 w-full">
              <h2 className="font-display text-2xl font-bold text-app uppercase mb-2">
                Join Room
              </h2>
              <p className="text-muted text-sm leading-relaxed mb-5">
                Enter a friend's room code to join their workout session.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  className="neo-input text-sm uppercase tracking-widest font-bold"
                  placeholder="Room code (e.g. LFIT42)"
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
              className="w-full py-3 font-display font-bold uppercase tracking-wider text-sm cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'var(--neo-blue)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
                color: '#fff',
                borderRadius: 0,
              }}
            >
              Join Room <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* Phase label */}
        <p className="text-center text-xs text-subtle mt-10 font-semibold uppercase tracking-widest">
          Phase 1 — UI Preview · Real-time sync coming soon
        </p>
      </div>
    </div>
  );
}
