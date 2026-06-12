'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Flame, Trophy, Activity, Target, RotateCcw, Zap } from 'lucide-react';
import {
  loadProgress,
  resetProgress,
  levelProgress,
  subscribeToProgress,
  type Progress,
} from '@/lib/progress';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  const handleReset = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      setProgress(resetProgress());
    }
  };

  if (!progress) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl accent-bg animate-pulse" />
      </div>
    );
  }

  const lp = levelProgress(progress.xp);
  const unlocked = new Set(progress.unlockedAchievements);

  return (
    <div className="min-h-screen bg-app">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back home
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full accent-pill text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Your progress
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-app mb-3 leading-tight">
                Keep showing up.
              </h1>
              <p className="text-muted max-w-xl">
                Earn XP for each rep, build streaks, and unlock achievements as you stay consistent.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl surface surface-hover text-xs text-muted hover:text-app flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset progress
            </button>
          </div>
        </div>

        {/* Level card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="clay-card p-6 sm:p-8 mb-6"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl accent-bg flex items-center justify-center"
                style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 35%, transparent)' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs text-subtle mb-1 uppercase tracking-wider">Current Level</div>
                <div className="font-display text-6xl font-bold text-app tabular-nums leading-none">
                  {lp.level}
                </div>
                <div className="text-sm text-muted mt-1">{progress.xp.toLocaleString()} XP total</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-subtle mb-1 uppercase tracking-wider">Next level in</div>
              <div className="font-display text-3xl font-bold text-app tabular-nums">
                {(lp.nextLevelXp - progress.xp).toLocaleString()} XP
              </div>
            </div>
          </div>

          <div className="h-3 rounded-full bg-[var(--border)] overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lp.pct * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'var(--accent)' }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-subtle">
            <span>Level {lp.level}</span>
            <span>{lp.intoLevel} / {lp.span} XP</span>
            <span>Level {lp.level + 1}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Flame, label: 'Current streak', value: `${progress.currentStreak}d`, sub: `Longest: ${progress.longestStreak}d`, delay: 0 },
            { icon: Activity, label: 'Total sessions', value: String(progress.totalSessions), sub: 'Completed', delay: 0.05 },
            { icon: Target, label: 'Total reps', value: String(progress.totalReps), sub: 'Logged', delay: 0.1 },
            { icon: Trophy, label: 'Achievements', value: `${unlocked.size}/${ACHIEVEMENTS.length}`, sub: 'Unlocked', delay: 0.15 },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: s.delay }}
              className="clay-sm p-5"
            >
              <div className="flex items-center gap-2 text-xs text-subtle mb-3">
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
              <div className="font-display text-3xl font-bold text-app tabular-nums">{s.value}</div>
              <div className="text-xs text-subtle mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Achievements grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="clay-sm p-6 sm:p-8"
        >
          <div className="mb-6">
            <h2 className="font-display text-3xl font-bold text-app mb-1">Achievements</h2>
            <p className="text-sm text-subtle">{unlocked.size} of {ACHIEVEMENTS.length} unlocked</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const isUnlocked = unlocked.has(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + i * 0.03 }}
                  className={`rounded-2xl p-4 border transition-all ${
                    isUnlocked
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30'
                      : 'bg-[var(--surface)] border-app opacity-50'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-3 ${
                      isUnlocked ? 'accent-bg' : 'bg-[var(--border)] grayscale'
                    }`}
                  >
                    {a.icon}
                  </div>
                  <div className="text-sm font-bold text-app mb-1">{a.name}</div>
                  <div className="text-xs text-muted leading-relaxed">{a.description}</div>
                  {isUnlocked && (
                    <div className="text-xs accent-text mt-2 font-semibold">Unlocked</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
