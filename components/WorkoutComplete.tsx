'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Zap, Flame, Trophy, ArrowRight, RotateCcw, Star } from 'lucide-react';
import type { SessionResult } from '@/lib/progress';
import { getAchievement, getQuest } from '@/lib/achievements';

type Props = {
  result: SessionResult;
  reps: number;
  durationSeconds: number;
  exerciseName: string;
  accuracy?: number | null;
  onRestart: () => void;
  backHref?: string;
};

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  },
};

export default function WorkoutComplete({
  result, reps, durationSeconds, exerciseName, accuracy, onRestart, backHref = '/dashboard',
}: Props) {
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const durationLabel = mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`;
  const accuracyColor = accuracy == null ? 'var(--text-muted)' : accuracy >= 80 ? 'var(--accent)' : accuracy >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Hero */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'var(--accent)', boxShadow: '0 12px 40px color-mix(in srgb, var(--accent) 50%, transparent)' }}>
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl font-bold text-app mb-2">
          Workout Complete
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-muted text-sm">
          {exerciseName} session logged · {durationLabel}
        </motion.p>
      </div>

      {/* XP + Coins hero row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="grid grid-cols-2 gap-3 mb-4">
        <div className="card-tinted p-5 text-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
            style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
            <Zap className="w-4.5 h-4.5 accent-text" />
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-3xl font-bold tabular-nums accent-text">
            +{result.xpGained}
          </motion.div>
          <div className="text-xs text-muted mt-1">XP earned</div>
          {result.leveledUp && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              <Star className="w-3 h-3" fill="currentColor" /> Level Up!
            </div>
          )}
        </div>
        <div className="card-tinted p-5 text-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
            style={{ background: 'color-mix(in srgb, #f59e0b 18%, transparent)' }}>
            <Flame className="w-4.5 h-4.5" style={{ color: '#f59e0b' }} />
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="text-3xl font-bold tabular-nums" style={{ color: '#f59e0b' }}>
            +{result.coinsGained}
          </motion.div>
          <div className="text-xs text-muted mt-1">FitCoins</div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {[
          { label: 'Reps', value: reps.toString() },
          { label: 'Duration', value: durationLabel },
          { label: 'Calories', value: `${result.caloriesBurned}` },
          { label: 'Streak', value: `${result.after.currentStreak}d` },
        ].map(({ label, value }) => (
          <div key={label} className="clay-sm p-3 text-center">
            <div className="text-xs text-subtle mb-0.5">{label}</div>
            <div className="text-xl font-bold text-app tabular-nums">{value}</div>
          </div>
        ))}
      </motion.div>

      {/* Accuracy */}
      {accuracy != null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="clay-sm p-4 mb-4 flex items-center gap-4">
          <AccuracyRing score={accuracy} />
          <div>
            <div className="text-xs text-subtle mb-0.5">Pose Accuracy</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: accuracyColor }}>{accuracy}%</div>
            <div className="text-xs text-muted mt-0.5">
              {accuracy >= 80 ? 'Excellent form' : accuracy >= 60 ? 'Good form' : 'Keep practicing'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Streak bonus */}
      {result.streakBonus && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-xl p-4 mb-4" style={{ background: 'var(--accent-bg)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <div className="flex items-center gap-2 text-xs font-semibold accent-text mb-1">
            <Flame className="w-3.5 h-3.5" /> {result.streakBonus.day}-day streak bonus!
          </div>
          <div className="text-sm text-app">+{result.streakBonus.xp} XP · +{result.streakBonus.coins} FitCoins</div>
        </motion.div>
      )}

      {/* Quests + Achievements */}
      {(result.completedQuests.length > 0 || result.newAchievements.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="clay-sm p-4 mb-4 space-y-3">
          {result.completedQuests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold accent-text mb-2">
                <Trophy className="w-3.5 h-3.5" /> Quest{result.completedQuests.length > 1 ? 's' : ''} completed
              </div>
              {result.completedQuests.map((id) => {
                const q = getQuest(id);
                if (!q) return null;
                return (
                  <div key={id} className="flex items-center gap-2 text-sm text-app py-1">
                    <span>{q.icon}</span>
                    <span className="flex-1">{q.name}</span>
                    <span className="text-xs text-muted">+{q.reward.xp} XP · +{q.reward.coins}c</span>
                  </div>
                );
              })}
            </div>
          )}
          {result.newAchievements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold accent-text mb-2">
                <Star className="w-3.5 h-3.5" /> Achievement{result.newAchievements.length > 1 ? 's' : ''} unlocked
              </div>
              {result.newAchievements.map((id) => {
                const a = getAchievement(id);
                if (!a) return null;
                return (
                  <div key={id} className="flex items-center gap-2 text-sm text-app py-1">
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="flex flex-col sm:flex-row gap-2 mt-6">
        <button onClick={onRestart}
          className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
          style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <RotateCcw className="w-4 h-4" /> Do another
        </button>
        <Link href={backHref}
          className="flex-1 px-5 py-3 rounded-xl btn-primary text-white text-sm font-semibold flex items-center justify-center gap-2">
          {backHref === '/adventure' ? 'Back to adventure' : 'Go to dashboard'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function AccuracyRing({ score }: { score: number }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const fill = Math.max(0, Math.min(100, score));
  const color = fill >= 80 ? 'var(--accent)' : fill >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="68" height="68" style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${(fill / 100) * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }} />
    </svg>
  );
}
