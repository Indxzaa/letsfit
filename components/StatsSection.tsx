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
    description: 'Earn FitCoins for every session. Spend them on avatars, badges, and more.',
  },
];

export default function StatsSection() {
  return (
    <section
      id="progress"
      className="py-24 sm:py-32"
      style={{ background: 'var(--neo-cream)', borderTop: '4px solid var(--neo-black)' }}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mb-16"
        >
          <div className="neo-badge mb-6">How it works</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: 'var(--neo-black)',
              marginBottom: '1.25rem',
            }}
          >
            TRACK PROGRESS.<br />BUILD HABITS.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.125rem',
              lineHeight: 1.65,
              color: 'var(--neo-black)',
              opacity: 0.65,
            }}
          >
            AI guides your form. XP tracks your growth. Every session makes you stronger.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              whileHover={{ boxShadow: 'var(--neo-shadow-lg)', y: -2, x: -2 }}
              className="p-6 neo-card cursor-default"
              style={{ transition: 'box-shadow 0.1s ease, transform 0.1s ease' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-11 h-11 flex items-center justify-center shrink-0"
                  style={{ background: 'var(--neo-accent)', border: 'var(--neo-border)' }}
                >
                  <step.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3.5rem',
                    lineHeight: 1,
                    color: 'var(--neo-accent)',
                    opacity: 0.15,
                    userSelect: 'none',
                  }}
                >
                  {step.step}
                </span>
              </div>
              <h3
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  color: 'var(--neo-black)',
                  letterSpacing: '-0.01em',
                }}
              >
                {step.title.toUpperCase()}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--neo-black)', opacity: 0.6 }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
