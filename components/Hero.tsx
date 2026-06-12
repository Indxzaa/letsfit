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

          {/* Right — feature highlights (no fake stats) */}
          <div className="hidden lg:flex flex-col gap-4">
            {[
              { icon: Zap, title: 'XP & Leveling', desc: 'Every rep earns XP. Level up from 1 to 100.' },
              { icon: Flame, title: 'Streak System', desc: 'Train daily to build momentum and unlock milestones.' },
              { icon: Trophy, title: 'Achievements', desc: 'Earn badges across 4 rarity tiers: Common to Legendary.' },
              { icon: Star, title: 'Daily Quests', desc: 'New challenges every day with FitCoin rewards.' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4 p-5"
                style={{
                  borderRadius: 20,
                  background: 'var(--surface-solid)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--accent)', boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)' }}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-app">{f.title}</div>
                  <div className="text-xs text-muted mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
