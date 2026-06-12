'use client';

import { motion } from 'framer-motion';
import { Camera, Target, Calendar, TrendingUp, BookOpen, Heart } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'AI Posture Feedback',
    description: 'On-screen guidance helps you check your form during squats, planks, and stretches in real time.',
    accent: true,
    span: 'lg:col-span-2',
  },
  {
    icon: Calendar,
    title: 'Daily Routines',
    description: '10–20 minute sessions you can do between classes or in your dorm. No equipment required.',
    accent: false,
    span: '',
  },
  {
    icon: Target,
    title: 'Habit Streaks',
    description: 'Track consistency week by week. Gentle reminders keep you on track without being overwhelming.',
    accent: false,
    span: '',
  },
  {
    icon: TrendingUp,
    title: 'Progress Over Time',
    description: 'See how your sessions, posture, and active minutes evolve.',
    accent: false,
    span: '',
  },
  {
    icon: BookOpen,
    title: 'Learn As You Go',
    description: 'Each exercise includes a short explanation of why it matters and what to focus on.',
    accent: false,
    span: '',
  },
  {
    icon: Heart,
    title: 'Built for Beginners',
    description: 'No fitness background needed. The app meets you where you are and adapts to your pace.',
    accent: false,
    span: '',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 relative">
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
            What you get
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-app mb-4 leading-tight">
            Everything you need<br />to stay consistent.
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            LetsFit focuses on what actually matters for students — posture, consistency,
            and short routines that fit into a busy day.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`clay-sm p-6 hover:scale-[1.01] transition-transform duration-200 cursor-default ${feature.span} ${
                feature.accent
                  ? 'bg-[var(--accent)]/6 border-[var(--accent)]/20'
                  : ''
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 ${
                  feature.accent ? 'accent-bg' : 'bg-[var(--accent)]/12'
                }`}
              >
                <feature.icon
                  className={`w-5 h-5 ${feature.accent ? 'text-white' : 'accent-text'}`}
                  strokeWidth={2}
                />
              </div>
              <h3 className="font-display text-xl font-bold text-app mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
