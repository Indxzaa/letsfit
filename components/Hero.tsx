'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Flame, Trophy, Star } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                color: 'var(--accent)',
              }}
            >
              <Star className="w-4 h-4" />
              AI-powered fitness for students
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold text-app mb-6 leading-[0.9]"
            >
              Get fit.<br />
              <span style={{ color: 'var(--accent)' }}>Level up.</span><br />
              Stay consistent.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-xl text-muted mb-10 max-w-md leading-relaxed"
            >
              Real-time AI posture feedback, daily quests, XP rewards, and achievement streaks.
              10 minutes a day, no equipment needed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-col sm:flex-row items-start gap-3 mb-8"
            >
              <Link
                href={user ? '/dashboard' : '/signup'}
                className="px-8 py-4 rounded-2xl font-display text-xl font-bold text-white flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 8px 24px color-mix(in srgb, var(--accent) 45%, transparent)',
                }}
              >
                {user ? 'Go to dashboard' : 'Start for free'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl font-semibold text-app flex items-center gap-2 cursor-pointer transition-colors surface surface-hover"
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center gap-4 text-sm text-subtle flex-wrap"
            >
              {['No equipment needed', 'Works in your dorm', '10 min/day'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — floating gamification preview cards */}
          <div className="hidden lg:block relative h-[500px]">
            {/* XP Progress card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute top-0 left-0 right-12 p-6"
              style={{
                borderRadius: 24,
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-subtle uppercase tracking-wider">Current Level</div>
                    <div className="font-display text-2xl font-bold text-app">Level 12</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-bold" style={{ color: 'var(--accent)' }}>68%</div>
                  <div className="text-xs text-subtle">to Level 13</div>
                </div>
              </div>
              <div className="xp-track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                  className="xp-fill"
                />
              </div>
            </motion.div>

            {/* Streak card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="absolute top-36 right-0 w-52 p-5"
              style={{
                borderRadius: 24,
                background: 'var(--accent)',
                boxShadow: '0 12px 40px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-8 h-8 text-white" />
                <div>
                  <div className="font-display text-4xl font-bold text-white leading-none">14</div>
                  <div className="text-white/70 text-xs">day streak</div>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-full"
                    style={{ background: i < 5 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }} />
                ))}
              </div>
            </motion.div>

            {/* Achievement card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute bottom-20 left-8 w-56 p-4"
              style={{
                borderRadius: 20,
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px color-mix(in srgb, var(--accent) 25%, transparent)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))' }}>
                  🏆
                </div>
                <div>
                  <div className="text-sm font-bold text-app">First Week Done!</div>
                  <div className="text-xs" style={{ color: 'var(--accent)' }}>+500 XP · +200 coins</div>
                </div>
              </div>
            </motion.div>

            {/* Quest complete badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              className="absolute bottom-8 right-4 px-4 py-2.5 rounded-full text-sm font-bold"
              style={{
                background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
                border: '2px solid color-mix(in srgb, var(--accent) 40%, transparent)',
                color: 'var(--accent)',
              }}
            >
              <Trophy className="w-4 h-4 inline mr-1.5" />
              3/3 quests done!
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
