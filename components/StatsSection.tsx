'use client';

import { motion } from 'framer-motion';
import { Activity, Zap, Target, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Activity,
    step: '01',
    title: 'AI Posture Detection',
    description: 'Real-time feedback on your form during squats, push-ups, planks, and more. No equipment needed.',
  },
  {
    icon: Zap,
    step: '02',
    title: 'Earn XP & Level Up',
    description: 'Every rep earns XP. Level up to unlock achievements and show your progress to the world.',
  },
  {
    icon: Target,
    step: '03',
    title: 'Build Streaks',
    description: 'Track daily consistency. We reward showing up every day — even on easy days.',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Unlock Rewards',
    description: 'Earn FitCoins to customize your profile with avatars, badges, and themes.',
  },
];

export default function StatsSection() {
  return (
    <section id="progress" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full accent-pill text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            How it works
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-app mb-4 leading-tight">
            Track progress.<br />Build habits.
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            LetsFit uses AI-powered posture analysis to guide your form in real time,
            then rewards consistency with XP, achievements, and FitCoins.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="clay-sm p-6 hover:scale-[1.01] transition-transform duration-200 cursor-default"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-2xl accent-bg flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className="font-display text-4xl font-bold text-[var(--border-strong)] leading-none">
                  {step.step}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-app mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
