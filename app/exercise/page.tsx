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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full accent-pill text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            Workouts
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-app mb-3 leading-tight">
            Choose your workout.
          </h1>
          <p className="text-muted max-w-xl">
            Pick an exercise, set a target, and start a session. Track every rep and earn rewards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXERCISES.map((exercise, i) => (
            <motion.div
              key={exercise.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link href={`/exercise/${exercise.slug}`} className="block h-full cursor-pointer">
                <div className="clay-sm p-6 h-full flex flex-col hover:scale-[1.02] transition-transform duration-200">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl accent-bg flex items-center justify-center shadow-sm"
                      style={{ boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                      <exercise.icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    {exercise.hasAiDetection && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full accent-pill text-[10px] font-semibold">
                        <Sparkles className="w-3 h-3" />
                        AI detection
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-subtle mb-1 uppercase tracking-wider">{exercise.tagline}</div>
                  <h3 className="font-display text-2xl font-bold text-app mb-2">{exercise.name}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-5 flex-1">{exercise.description}</p>

                  <div className="flex items-center gap-3 text-xs text-subtle mb-4 pb-4 border-b border-app">
                    <span>{exercise.difficulty}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                    <span>{exercise.duration}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                    <span>{exercise.equipment}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-semibold accent-text">
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
