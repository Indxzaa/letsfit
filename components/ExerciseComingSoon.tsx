'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Lock, Bell } from 'lucide-react';
import { getExercise } from '@/lib/exercises';
import Navbar from '@/components/Navbar';

export default function ExerciseComingSoon({ slug }: { slug: string }) {
  const exercise = getExercise(slug);
  if (!exercise) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-muted text-sm">Exercise not found.</div>
      </div>
    );
  }

  const Icon = exercise.icon;

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        <Link
          href="/exercise"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All exercises
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="surface rounded-2xl p-8 sm:p-10"
        >
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl accent-bg-soft flex items-center justify-center">
                <Icon className="w-6 h-6 accent-text" strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm font-medium accent-text mb-1">
                  {exercise.tagline}
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-app">
                  {exercise.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full surface text-xs text-subtle">
              <Lock className="w-3 h-3" />
              Coming soon
            </div>
          </div>

          <p className="text-muted leading-relaxed mb-8">
            {exercise.description}
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <InfoCell label="Difficulty" value={exercise.difficulty} />
            <InfoCell label="Duration" value={exercise.duration} />
            <InfoCell label="Equipment" value={exercise.equipment} />
          </div>

          <div className="p-5 rounded-xl accent-bg-soft border border-app">
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 accent-text mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-app mb-1">
                  AI detection in development
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  We&apos;re building real-time form analysis for this exercise.
                  In the meantime, try the squat session — it&apos;s fully working.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/exercise/squat"
              className="px-5 py-2.5 rounded-lg accent-bg text-white text-sm font-medium text-center transition-colors"
            >
              Try squats instead
            </Link>
            <Link
              href="/exercise"
              className="px-5 py-2.5 rounded-lg surface surface-hover text-app text-sm font-medium text-center"
            >
              Browse all exercises
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl surface">
      <div className="text-xs text-subtle mb-1">{label}</div>
      <div className="text-sm text-app font-medium">{value}</div>
    </div>
  );
}
