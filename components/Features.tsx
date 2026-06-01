'use client';

import { motion } from 'framer-motion';
import {
  Camera,
  Target,
  Calendar,
  TrendingUp,
  BookOpen,
  Heart,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Posture feedback',
    description:
      'On-screen guidance helps you check your form during simple exercises like squats, planks, and stretches.',
  },
  {
    icon: Calendar,
    title: 'Daily routines',
    description:
      'Short 10–20 minute sessions you can do between classes or in your dorm. No equipment required.',
  },
  {
    icon: Target,
    title: 'Habit streaks',
    description:
      'Track consistency week by week. Gentle reminders keep you on track without being overwhelming.',
  },
  {
    icon: TrendingUp,
    title: 'Progress over time',
    description:
      'See how your sessions, posture, and active minutes evolve. No vanity metrics — just useful data.',
  },
  {
    icon: BookOpen,
    title: 'Learn as you go',
    description:
      'Each exercise comes with a short explanation of why it matters and what to focus on.',
  },
  {
    icon: Heart,
    title: 'Built for beginners',
    description:
      'No fitness background needed. The app meets you where you are and adapts to your pace.',
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
          className="max-w-2xl mb-16"
        >
          <div className="text-sm font-medium accent-text mb-3">Features</div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-app mb-4">
            A simpler way to stay active.
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            LetsFit focuses on the basics that actually matter for students —
            posture, consistency, and short routines that fit into a busy day.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border)] rounded-2xl overflow-hidden border border-app">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-app p-8 hover:bg-surface-solid transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--border)] flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5 text-[var(--accent-soft)]" strokeWidth={2} />
              </div>
              <h3 className="text-base font-semibold text-app mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
