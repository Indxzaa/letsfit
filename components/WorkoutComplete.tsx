'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  Zap,
  Flame,
  Trophy,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { SessionResult } from '@/lib/progress';
import { getAchievement, getQuest } from '@/lib/achievements';

type Props = {
  result: SessionResult;
  reps: number;
  durationSeconds: number;
  exerciseName: string;
  onRestart: () => void;
};

export default function WorkoutComplete({
  result,
  reps,
  durationSeconds,
  exerciseName,
  onRestart,
}: Props) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const durationLabel =
    minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
      : `${seconds}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface rounded-2xl p-6 sm:p-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full accent-bg flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
      </motion.div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-app mb-2">
        Workout complete
      </h2>
      <p className="text-muted mb-8">
        Nice work — your {exerciseName.toLowerCase()} session is logged.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Reps" value={reps.toString()} />
        <Stat label="Duration" value={durationLabel} />
        <Stat label="Calories" value={`${result.caloriesBurned}`} />
        <Stat label="Streak" value={`${result.after.currentStreak} days`} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <RewardCard
          icon={Zap}
          label="XP earned"
          value={`+${result.xpGained}`}
          highlight={result.leveledUp ? 'Level up!' : null}
        />
        <RewardCard
          icon={Flame}
          label="FitCoins"
          value={`+${result.coinsGained}`}
        />
      </div>

      {result.streakBonus && (
        <div className="rounded-xl p-4 mb-4 text-left bg-[var(--accent)]/10 border border-[var(--accent)]/30">
          <div className="flex items-center gap-2 text-xs accent-text font-medium mb-2">
            <Flame className="w-3.5 h-3.5" />
            {result.streakBonus.day}-day streak bonus!
          </div>
          <div className="text-sm text-app">
            +{result.streakBonus.xp} XP · +{result.streakBonus.coins} FitCoins
          </div>
        </div>
      )}

      {result.completedQuests.length > 0 && (
        <div className="surface rounded-xl p-4 mb-4 text-left">
          <div className="flex items-center gap-2 text-xs accent-text font-medium mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Quest{result.completedQuests.length > 1 ? 's' : ''} completed
          </div>
          <div className="space-y-1.5">
            {result.completedQuests.map((id) => {
              const q = getQuest(id);
              if (!q) return null;
              return (
                <div key={id} className="text-sm text-app flex items-center gap-2">
                  <span>{q.icon}</span>
                  <span className="flex-1">{q.name}</span>
                  <span className="text-xs text-muted">
                    +{q.reward.xp} XP · +{q.reward.coins} coins
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result.newAchievements.length > 0 && (
        <div className="surface rounded-xl p-4 mb-4 text-left">
          <div className="flex items-center gap-2 text-xs accent-text font-medium mb-2">
            <Trophy className="w-3.5 h-3.5" />
            New achievement{result.newAchievements.length > 1 ? 's' : ''}
          </div>
          <div className="space-y-1.5">
            {result.newAchievements.map((id) => {
              const a = getAchievement(id);
              if (!a) return null;
              return (
                <div key={id} className="text-sm text-app flex items-center gap-2">
                  <span>{a.icon}</span>
                  <span className="flex-1">{a.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-center mt-8">
        <button
          onClick={onRestart}
          className="px-5 py-2.5 rounded-lg surface surface-hover text-app text-sm font-medium flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Do another
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg accent-bg text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          Go to dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface rounded-xl p-3">
      <div className="text-xs text-subtle mb-1">{label}</div>
      <div className="text-xl font-semibold text-app tabular-nums">{value}</div>
    </div>
  );
}

function RewardCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  highlight?: string | null;
}) {
  return (
    <div className="rounded-xl p-4 bg-[var(--accent)]/8 border border-[var(--accent)]/20 flex items-center gap-3 text-left">
      <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center">
        <Icon className="w-4 h-4 accent-text" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-lg font-semibold text-app tabular-nums">
          {value}
        </div>
        {highlight && (
          <div className="text-xs accent-text font-medium mt-0.5">{highlight}</div>
        )}
      </div>
    </div>
  );
}
