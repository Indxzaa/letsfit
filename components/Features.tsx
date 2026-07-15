'use client';

import { motion } from 'framer-motion';
import { Camera, Target, Calendar, TrendingUp, BookOpen, Heart } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'AI Posture Feedback',
    description: 'Real time on screen guidance corrects your form.',
    accent: true,
    iconColor: 'var(--neo-icon-green)',
  },
  {
    icon: Calendar,
    title: 'Daily Routines',
    description: '10–20 min sessions you can do between classes. No equipment.',
    accent: false,
    iconColor: 'var(--neo-icon-blue)',
  },
  {
    icon: Target,
    title: 'Habit Streaks',
    description: 'Track consistency every week. Stay on track without feeling overwhelmed.',
    accent: false,
    iconColor: 'var(--neo-icon-amber)',
  },
  {
    icon: TrendingUp,
    title: 'Progress Over Time',
    description: 'Watch your sessions, posture, and active minutes grow.',
    accent: false,
    iconColor: 'var(--neo-icon-green)',
  },
  {
    icon: BookOpen,
    title: 'Learn As You Go',
    description: 'Every exercise explains the why and what to focus on.',
    accent: false,
    iconColor: 'var(--neo-icon-blue)',
  },
  {
    icon: Heart,
    title: 'Built for Beginners',
    description: 'No fitness background needed. The app adapts to your pace.',
    accent: false,
    iconColor: 'var(--neo-icon-purple)',
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 sm:py-32"
      style={{ background: 'var(--neo-cream)' }}
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
          <div
            className="neo-badge mb-6"
            style={{ background: 'var(--neo-black)', color: 'var(--neo-white)' }}
          >
            Everything you need
          </div>
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
            YOUR FITNESS,<br />GAMIFIED.
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
            Short workouts, real rewards. LetsFit turns daily movement into a game you actually want to play.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              whileHover={{ boxShadow: 'var(--neo-shadow-lg)', y: -2, x: -2 }}
              className={`p-7 cursor-default ${f.accent ? 'neo-card-accent' : 'neo-card'}`}
              style={{ transition: 'box-shadow 0.1s ease, transform 0.1s ease' }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center mb-6"
                style={{
                  background: f.accent ? 'rgba(255,255,255,0.2)' : f.iconColor,
                  border: f.accent ? '2px solid rgba(255,255,255,0.4)' : 'var(--neo-border)',
                }}
              >
                <f.icon
                  className="w-6 h-6"
                  style={{ color: f.accent ? '#fff' : '#fff' }}
                  strokeWidth={2}
                />
              </div>
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  letterSpacing: '-0.01em',
                  color: f.accent ? '#fff' : 'var(--neo-black)',
                }}
              >
                {f.title.toUpperCase()}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: f.accent ? 'rgba(255,255,255,0.8)' : 'var(--neo-black)',
                  opacity: f.accent ? 1 : 0.65,
                }}
              >
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
