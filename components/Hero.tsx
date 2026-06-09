'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full surface text-xs text-muted mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-soft)]" />
            Built for students. Designed for habits.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-app mb-6 leading-[1.1]"
          >
            Move better.
            <br />
            <span className="text-muted">Build healthier habits.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted mb-10 max-w-xl mx-auto leading-relaxed"
          >
            LetsFit helps students improve posture, stay consistent with short
            workouts, and build a sustainable wellness routine — guided by
            simple, on-screen feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="w-full sm:w-auto px-6 py-3 rounded-lg accent-bg text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {user ? 'Go to dashboard' : 'Get started free'}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3 rounded-lg surface surface-hover text-app font-medium text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-xs text-subtle mt-6"
          >
            No equipment needed · Works in your dorm · Takes 10 minutes a day
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden surface p-1.5">
            <div className="rounded-xl bg-surface-solid p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="surface rounded-lg p-4">
                  <div className="text-xs text-subtle mb-2">AI Posture Analysis</div>
                  <div className="text-sm font-medium text-app mb-1">Real-time feedback</div>
                  <div className="text-xs text-muted">Guides your form during exercises</div>
                </div>
                <div className="surface rounded-lg p-4">
                  <div className="text-xs text-subtle mb-2">Progress Tracking</div>
                  <div className="text-sm font-medium text-app mb-1">XP & Achievements</div>
                  <div className="text-xs text-muted">Earn rewards for consistency</div>
                </div>
                <div className="surface rounded-lg p-4">
                  <div className="text-xs text-subtle mb-2">Habit Building</div>
                  <div className="text-sm font-medium text-app mb-1">Daily streaks</div>
                  <div className="text-xs text-muted">Build sustainable routines</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
