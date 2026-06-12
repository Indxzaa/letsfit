'use client';

import { motion } from 'framer-motion';
import { Activity, Zap, Target, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Activity,
    step: '01',
    title: 'AI Posture Detection',
    description: 'Real-time form feedback during squats, push-ups, planks. No equipment needed.',
  },
  {
    icon: Zap,
    step: '02',
    title: 'Earn XP & Level Up',
    description: 'Every rep earns experience. Level up and watch your progress grow daily.',
  },
  {
    icon: Target,
    step: '03',
    title: 'Build Streaks',
    description: 'Show up every day, build momentum, and hit your longest streak yet.',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Unlock Rewards',
    description: 'Earn FitCoins for every session. Spend them on avatars, badges, and themes.',
  },
];

export default function StatsSection() {
  return (
    <section id="progress" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              color: 'var(--accent)',
            }}>
            How it works
          </div>
          <h2 className="font-display text-5xl sm:text-6xl font-bold text-app mb-4 leading-tight">
            Track progress.<br />Build habits.
          </h2>
          <p className="text-xl text-muted leading-relaxed">
            AI guides your form. XP tracks your growth. Every session makes you stronger.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="p-6 hover:scale-[1.02] transition-transform duration-200 cursor-default"
              style={{
                borderRadius: 20,
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--accent)', boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)' }}>
                  <step.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="font-display text-5xl font-bold leading-none"
                  style={{ color: 'color-mix(in srgb, var(--accent) 20%, var(--surface-solid))' }}>
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
