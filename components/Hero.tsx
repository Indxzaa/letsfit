'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Flame, Trophy, Star } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

const featureItems = [
  { icon: Zap, title: 'XP & Leveling', desc: 'Every rep earns XP. Level up from 1 to 100.' },
  { icon: Flame, title: 'Streak System', desc: 'Train daily to build momentum and unlock milestones.' },
  { icon: Trophy, title: 'Achievements', desc: 'Earn badges across 4 rarity tiers: Common to Legendary.' },
  { icon: Star, title: 'Daily Quests', desc: 'New challenges every day with FitCoin rewards.' },
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="neo-badge mb-8"
            >
              <Star className="w-3.5 h-3.5" />
              AI-powered fitness for students
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.02em',
                color: 'var(--neo-black)',
                marginBottom: '2rem',
              }}
            >
              GET FIT.<br />
              <span style={{ color: 'var(--neo-accent)' }}>LEVEL UP.</span><br />
              STAY<br />CONSISTENT.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.125rem',
                lineHeight: 1.65,
                color: 'var(--neo-black)',
                opacity: 0.7,
                maxWidth: '26rem',
                marginBottom: '2.5rem',
              }}
            >
              Real-time AI posture feedback, daily quests, XP rewards, and achievement streaks.
              10 minutes a day, no equipment needed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
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
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center gap-5 flex-wrap"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--neo-black)', opacity: 0.6 }}
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
                transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
                whileHover={{ boxShadow: 'var(--neo-shadow-lg)', transform: 'translate(-2px, -2px)' }}
                transition={{ duration: 0.1 }}
                className="flex items-center gap-4 p-5 neo-card cursor-default"
                style={{ transition: 'box-shadow 0.1s ease, transform 0.1s ease' }}
              >
                <div
                  className="w-11 h-11 shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--neo-accent)', border: 'var(--neo-border)' }}
                >
                  <f.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <div
                    className="text-sm font-bold uppercase"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--neo-black)', marginBottom: '0.2rem' }}
                  >
                    {f.title}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)', opacity: 0.6 }}
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
