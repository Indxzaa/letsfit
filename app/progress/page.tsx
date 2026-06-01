'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Activity,
  Target,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  loadProgress,
  resetProgress,
  levelProgress,
  type Progress,
} from '@/lib/progress';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'letsfit:progress:v1') setProgress(loadProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleReset = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      setProgress(resetProgress());
    }
  };

  if (!progress) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-sm text-subtle">Loading…</div>
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
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back home
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium accent-text mb-2">
                Your progress
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-app mb-3">
                Keep showing up.
              </h1>
              <p className="text-muted max-w-xl">
                Earn XP for each rep, build streaks, and unlock achievements
                as you stay consistent.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg surface surface-hover text-xs text-muted hover:text-app flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset progress
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="surface rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs text-subtle mb-2">
                <Zap className="w-3.5 h-3.5" />
                Level
              </div>
              <div className="text-5xl font-semibold text-app tabular-nums">
                {lp.level}
              </div>
              <div className="text-sm text-muted mt-1">
                {progress.xp.toLocaleString()} XP total
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-subtle mb-2">
                Next level in
              </div>
              <div className="text-2xl font-semibold text-app tabular-nums">
                {(lp.nextLevelXp - progress.xp).toLocaleString()} XP
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-subtle mb-2">
              <span>Level {lp.level}</span>
              <span>
                {lp.intoLevel} / {lp.span} XP
              </span>
              <span>Level {lp.level + 1}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lp.pct * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[var(--accent)] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Flame}
            label="Current streak"
            value={`${progress.currentStreak} ${progress.currentStreak === 1 ? 'day' : 'days'}`}
            sub={`Longest: ${progress.longestStreak}`}
            delay={0}
          />
          <StatCard
            icon={Activity}
            label="Total sessions"
            value={progress.totalSessions.toString()}
            sub="Completed sessions"
            delay={0.05}
          />
          <StatCard
            icon={Target}
            label="Total reps"
            value={progress.totalReps.toString()}
            sub="Squats logged"
            delay={0.1}
          />
          <StatCard
            icon={Trophy}
            label="Achievements"
            value={`${unlocked.size} / ${ACHIEVEMENTS.length}`}
            sub="Unlocked"
            delay={0.15}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="surface rounded-2xl p-6 sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-base font-semibold text-app mb-1">
              Achievements
            </h2>
            <p className="text-sm text-subtle">
              {unlocked.size} of {ACHIEVEMENTS.length} unlocked
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const isUnlocked = unlocked.has(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + i * 0.04 }}
                  className={`rounded-xl p-4 border transition-all ${
                    isUnlocked
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30'
                      : 'bg-[var(--surface)] border-app opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${
                      isUnlocked
                        ? 'bg-[var(--accent)]/20'
                        : 'bg-[var(--border)] grayscale'
                    }`}
                  >
                    {a.icon}
                  </div>
                  <div className="text-sm font-semibold text-app mb-1">
                    {a.name}
                  </div>
                  <div className="text-xs text-muted leading-relaxed">
                    {a.description}
                  </div>
                  {isUnlocked && (
                    <div className="text-xs accent-text mt-2 font-medium">
                      Unlocked
                    </div>
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="surface rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 text-xs text-subtle mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-2xl font-semibold text-app tabular-nums">
        {value}
      </div>
      <div className="text-xs text-subtle mt-1">{sub}</div>
    </motion.div>
  );
}
