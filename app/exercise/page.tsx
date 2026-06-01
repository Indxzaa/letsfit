'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { EXERCISES } from '@/lib/exercises';
import Navbar from '@/components/Navbar';

export default function ExerciseSelectPage() {
  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>
        <div className="mb-10">
          <div className="text-sm font-medium accent-text mb-2">Exercises</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-app mb-3">
            Choose your workout.
          </h1>
          <p className="text-muted max-w-xl">
            Pick an exercise, set a target, and start a session. Track every rep
            and earn rewards as you go.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXERCISES.map((exercise, i) => (
            <motion.div
              key={exercise.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link href={`/exercise/${exercise.slug}`}>
                <div className="surface surface-hover rounded-2xl p-6 h-full flex flex-col cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl accent-bg-soft flex items-center justify-center">
                      <exercise.icon
                        className="w-5 h-5 accent-text"
                        strokeWidth={2}
                      />
                    </div>
                    {exercise.hasAiDetection && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--accent)]/10 text-[10px] font-medium accent-text border border-[var(--accent)]/20">
                        <Sparkles className="w-3 h-3" />
                        AI form detection
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-subtle mb-1">
                    {exercise.tagline}
                  </div>
                  <h3 className="text-lg font-semibold text-app mb-2">
                    {exercise.name}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-5 flex-1">
                    {exercise.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-subtle mb-4 pb-4 border-b border-app">
                    <span>{exercise.difficulty}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--text-subtle)]" />
                    <span>{exercise.duration}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--text-subtle)]" />
                    <span>{exercise.equipment}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium accent-text">
                    <span>Start session</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
