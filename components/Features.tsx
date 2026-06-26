'use client';

import { motion } from 'framer-motion';
import { Camera, Target, Calendar, TrendingUp, BookOpen, Heart } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'AI Posture Feedback',
    description: 'Real-time on-screen guidance corrects your form during squats, planks, and push-ups.',
    accent: true,
    span: 'sm:col-span-2 lg:col-span-2',
  },
  {
    icon: Calendar,
    title: 'Daily Routines',
    description: '10–20 min sessions you can do between classes. No equipment.',
    accent: false,
    span: '',
  },
  {
    icon: Target,
    title: 'Habit Streaks',
    description: 'Track consistency every week. Stay on track without feeling overwhelmed.',
    accent: false,
    span: '',
  },
  {
    icon: TrendingUp,
    title: 'Progress Over Time',
    description: 'Watch your sessions, posture, and active minutes grow.',
    accent: false,
    span: '',
  },
  {
    icon: BookOpen,
    title: 'Learn As You Go',
    description: 'Every exercise explains the why and what to focus on.',
    accent: false,
    span: '',
  },
  {
    icon: Heart,
    title: 'Built for Beginners',
    description: 'No fitness background needed. The app adapts to your pace.',
    accent: false,
    span: '',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              color: 'var(--accent)',
            }}>
            Everything you need
          </div>
          <h2 className="font-display text-5xl sm:text-6xl font-bold text-app mb-6 leading-tight">

            Your fitness,<br />gamified.
          </h2>
          <p className="text-xl text-muted leading-relaxed">
            Short workouts, real rewards. LetsFit turns daily movement into a game you actually want to play.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`p-7 hover:scale-[1.02] transition-transform duration-200 cursor-default ${f.span}`}              style={f.accent ? {
                borderRadius: 24,
                background: 'var(--accent)',
                boxShadow: '0 12px 40px color-mix(in srgb, var(--accent) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)',
              } : {
                borderRadius: 20,
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: f.accent ? 'rgba(255,255,255,0.2)' : 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
                }}>
                <f.icon className="w-6 h-6" style={{ color: f.accent ? '#fff' : 'var(--accent)' }} strokeWidth={2} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4"
                style={{ color: f.accent ? '#fff' : 'var(--text)' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed"
                style={{ color: f.accent ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
