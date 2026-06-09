'use client';

import { motion } from 'framer-motion';
import { Activity, Zap, Target, Trophy } from 'lucide-react';

export default function StatsSection() {
  return (
    <section id="progress" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <div className="text-sm font-medium accent-text mb-3">How it works</div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-app mb-4">
            Track progress. Build habits.
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            LetsFit uses AI-powered posture analysis to guide your form in real-time,
            then rewards consistency with XP, achievements, and FitCoins you can spend
            on profile customization.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="surface rounded-2xl p-6"
          >
            <div className="w-12 h-12 rounded-xl accent-bg-soft flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 accent-text" />
            </div>
            <h3 className="text-base font-semibold text-app mb-2">
              AI Posture Detection
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Real-time feedback on your form during squats, push-ups, planks, and more.
              No equipment needed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="surface rounded-2xl p-6"
          >
            <div className="w-12 h-12 rounded-xl accent-bg-soft flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 accent-text" />
            </div>
            <h3 className="text-base font-semibold text-app mb-2">
              Earn XP & Level Up
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Every rep earns XP. Level up to unlock achievements and show your progress.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="surface rounded-2xl p-6"
          >
            <div className="w-12 h-12 rounded-xl accent-bg-soft flex items-center justify-center mb-4">
              <Target className="w-6 h-6 accent-text" />
            </div>
            <h3 className="text-base font-semibold text-app mb-2">
              Build Streaks
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Track daily consistency. Rest days don't break your streak — we reward showing up.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="surface rounded-2xl p-6"
          >
            <div className="w-12 h-12 rounded-xl accent-bg-soft flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 accent-text" />
            </div>
            <h3 className="text-base font-semibold text-app mb-2">
              Unlock Rewards
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Earn FitCoins to customize your profile with avatars, badges, and themes.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
