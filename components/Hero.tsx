'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Flame, Trophy } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-[var(--accent)]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full accent-pill text-xs font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              AI-powered fitness · Built for students
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-app mb-6 leading-[0.95]"
            >
              Move smarter.
              <br />
              <span className="accent-text">Level up faster.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-lg text-muted mb-8 max-w-md leading-relaxed"
            >
              Real-time AI posture feedback, XP rewards, and daily quests — designed
              for students who want results in 10 minutes a day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-col sm:flex-row items-start gap-3 mb-8"
            >
              <Link
                href={user ? '/dashboard' : '/signup'}
                className="px-6 py-3.5 rounded-2xl accent-bg text-white font-semibold text-sm flex items-center gap-2 transition-colors shadow-lg cursor-pointer"
                style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 35%, transparent)' }}
              >
                {user ? 'Go to dashboard' : 'Start for free'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 rounded-2xl surface surface-hover text-app font-medium text-sm flex items-center gap-2 cursor-pointer"
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center gap-5 text-xs text-subtle"
            >
              <span>No equipment needed</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
              <span>Works in your dorm</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
              <span>10 min/day</span>
            </motion.div>
          </div>

          {/* Right — floating stat cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="hidden lg:block relative h-[480px]"
          >
            {/* Main card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="clay-card p-6 absolute top-8 left-0 right-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-subtle mb-1">Daily Progress</div>
                  <div className="font-display text-3xl font-bold text-app">Level 12</div>
                </div>
                <div className="w-12 h-12 rounded-2xl accent-bg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--border)] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: '68%', background: 'var(--accent)' }}
                />
              </div>
              <div className="flex justify-between text-xs text-subtle">
                <span>3,400 XP</span>
                <span>5,000 XP to Level 13</span>
              </div>
            </motion.div>

            {/* Streak card */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="clay-sm p-4 absolute bottom-24 left-4 w-44"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl accent-bg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-app">14</div>
                  <div className="text-xs text-subtle -mt-0.5">day streak</div>
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full"
                    style={{ background: i < 5 ? 'var(--accent)' : 'var(--border)' }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Achievement card */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="clay-sm p-4 absolute bottom-20 right-0 w-52"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                  <Trophy className="w-5 h-5 accent-text" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-app">First Week!</div>
                  <div className="text-xs text-subtle">Achievement unlocked</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
