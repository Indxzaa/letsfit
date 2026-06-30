'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Flame, Trophy, Star } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

const featureItems = [
  {
    icon: Zap,
    title: 'XP & Leveling',
    desc: 'Every rep earns XP. Level up from 1 to 100.',
    iconBg: 'var(--neo-icon-green)',
  },
  {
    icon: Flame,
    title: 'Streak System',
    desc: 'Train daily to build momentum and unlock milestones.',
    iconBg: 'var(--neo-icon-amber)',
  },
  {
    icon: Trophy,
    title: 'Achievements',
    desc: 'Earn badges across 4 rarity tiers: Common to Legendary.',
    iconBg: 'var(--neo-icon-purple)',
  },
  {
    icon: Star,
    title: 'Daily Quests',
    desc: 'New challenges every day with FitCoin rewards.',
    iconBg: 'var(--neo-icon-blue)',
  },
];

export default function Hero() {
  const { user } = useAuth();

  return (
    <section
      className="min-h-screen flex items-center pt-20 pb-20"
      style={{ background: 'var(--neo-cream)' }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — headline + CTA */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.75rem, 6vw, 4.75rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: 'var(--neo-black)',
                marginBottom: '2rem',
              }}
            >
              GET FIT.<br />
              <span style={{ color: 'var(--neo-accent)' }}>LEVEL UP.</span><br />
              STAY CONSISTENT.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.125rem',
                lineHeight: 1.65,
                color: 'var(--neo-black)',
                opacity: 0.7,
                maxWidth: '28rem',
                marginBottom: '2.5rem',
              }}
            >
              Real-time AI posture analysis, immersive gamified workouts, Adventure Mode,
              achievements, and daily challenges — making fitness more engaging every day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-10"
            >
              <Link
                href={user ? '/dashboard' : '/signup'}
                className="neo-btn neo-btn-primary"
                style={{ fontSize: '1.0625rem' }}
              >
                {user ? 'Go to Dashboard' : 'Start for Free'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="neo-btn neo-btn-ghost"
                style={{ border: 'var(--neo-border)', fontSize: '1.0625rem', color: 'var(--neo-black)' }}
              >
                See how it works
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex items-center gap-5 flex-wrap"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--neo-black)',
                opacity: 0.6,
              }}
            >
              {['No equipment needed', 'Works in your dorm', '10 min / day'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2"
                    style={{ background: 'var(--neo-accent)', display: 'inline-block' }}
                  />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — feature highlight cards */}
          <div className="hidden lg:flex flex-col gap-3">
            {featureItems.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + i * 0.07 }}
                whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', y: -3 }}
                className="flex items-center gap-5 cursor-default"
                style={{
                  background: 'var(--neo-white)',
                  border: '2px solid var(--neo-black)',
                  borderRadius: '20px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  padding: '1.25rem 1.5rem',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    background: f.iconBg,
                    borderRadius: '14px',
                    border: 'none',
                  }}
                >
                  <f.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9375rem',
                      color: 'var(--neo-black)',
                      marginBottom: '0.25rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.55,
                      color: 'var(--neo-black)',
                      opacity: 0.6,
                    }}
                  >
                    {f.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
