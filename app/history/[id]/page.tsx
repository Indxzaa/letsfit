'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Activity, Award } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { getHistoryById } from '@/lib/history/queries';
import { getExerciseFeedback, getAccuracyTier } from '@/lib/history/feedback';
import { EXERCISES } from '@/lib/exercises';
import type { ExerciseHistory } from '@/lib/history/types';
import { formatDuration } from '@/lib/history/utils';

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const id = typeof params?.id === 'string' ? params.id : null;

  const [entry, setEntry] = useState<ExerciseHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      setError('Invalid request.');
      return;
    }

    getHistoryById(id).then((data) => {
      if (!data) setError('Workout not found.');
      else setEntry(data);
      setLoading(false);
    });
  }, [user?.id, id]);

  if (loading) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="neo-card p-6 animate-pulse"
                style={{ borderRadius: 16, background: 'var(--neo-white)' }}
              >
                <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-2/3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-card p-10 text-center"
            style={{ borderRadius: 16, background: 'var(--neo-white)' }}
          >
            <div className="text-5xl mb-4">⚠️</div>
            <p className="font-display text-lg font-bold text-app mb-2">{error || 'Workout not found'}</p>
            <p className="text-sm text-subtle mb-6">This workout may have been deleted or you may not have access to it.</p>
            <Link
              href="/history"
              className="neo-card px-5 py-2.5 text-sm font-bold inline-block"
              style={{ borderRadius: 10, background: 'var(--neo-yellow)' }}
            >
              Back to History
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const exercise = EXERCISES.find((e) => e.name === entry.exercise_name);
  const Icon = exercise?.icon ?? Activity;
  const tier = getAccuracyTier(entry.accuracy_score);
  const feedback = getExerciseFeedback(entry.exercise_name, entry.accuracy_score);

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link
            href="/history"
            aria-label="Back to history"
            className="neo-card p-2 flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ borderRadius: 10 }}
          >
            <ArrowLeft className="w-5 h-5 text-app" aria-hidden="true" />
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-app">{entry.exercise_name}</h1>
        </motion.div>

        {/* Accuracy Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neo-card p-8 text-center mb-4"
          style={{ borderRadius: 16, background: 'var(--card-bg-green)' }}
        >
          <div className="inline-flex items-center justify-center w-32 h-32 neo-card-accent mb-4"
            style={{ borderRadius: '50%' }}
            aria-hidden="true"
          >
            <Icon className="w-16 h-16 text-white" />
          </div>
          <div className="text-sm font-bold text-subtle uppercase tracking-wide mb-1">Accuracy</div>
          <div className="font-display text-5xl font-black text-app mb-2">{Math.round(entry.accuracy_score)}%</div>
          <div
            className="inline-block px-4 py-1.5 neo-card font-display text-sm font-bold"
            style={{
              borderRadius: 20,
              background: tier === 'Excellent' ? 'var(--neo-yellow)' : tier === 'Good' ? 'var(--card-bg-blue)' : tier === 'Fair' ? 'var(--card-bg-amber)' : 'var(--card-bg-purple)',
              color: 'var(--neo-black)',
            }}
          >
            {tier}
          </div>
        </motion.div>

        {/* Coaching Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="neo-card p-6 mb-4"
          style={{ borderRadius: 16, background: 'var(--neo-white)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-app" />
            <h2 className="font-display text-lg font-bold text-app">Coaching Feedback</h2>
          </div>
          <p className="text-sm text-subtle leading-relaxed">{feedback}</p>
        </motion.div>

        {/* Workout Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neo-card p-6"
          style={{ borderRadius: 16, background: 'var(--neo-white)' }}
        >
          <h2 className="font-display text-lg font-bold text-app mb-4">Workout Details</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-subtle shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-subtle mb-0.5">Completed</div>
                <div className="text-sm font-bold text-app">{formatDateTime(entry.completed_at)}</div>
              </div>
            </div>

            {entry.repetitions != null && (
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-subtle shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-subtle mb-0.5">Repetitions</div>
                  <div className="text-sm font-bold text-app">{entry.repetitions} reps</div>
                </div>
              </div>
            )}

            {entry.duration_seconds != null && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-subtle shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-subtle mb-0.5">Duration</div>
                  <div className="text-sm font-bold text-app">{formatDuration(entry.duration_seconds)}</div>
                </div>
              </div>
            )}

            {exercise && (
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-subtle shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-subtle mb-0.5">Category</div>
                  <div className="text-sm font-bold text-app">{exercise.category}</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Exercise Image (if available) */}
        {exercise?.infoImage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="neo-card p-4 mt-4 overflow-hidden"
            style={{ borderRadius: 16, background: 'var(--neo-white)' }}
          >
            <div className="relative w-full aspect-video">
              <Image
                src={exercise.infoImage}
                alt={entry.exercise_name}
                fill
                className="object-cover"
                style={{ borderRadius: 12 }}
              />
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
