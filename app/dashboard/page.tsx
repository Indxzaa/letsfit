'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  Flame,
  CheckCircle2,
  Zap,
  ChevronRight,
  Dumbbell,
  ShoppingBag,
  Clock,
} from 'lucide-react';
import {
  buildCalendar,
  type CalendarDay,
} from '@/lib/dashboardMock';
import {
  loadProgress,
  levelProgress,
  subscribeToProgress,
  type Progress,
} from '@/lib/progress';
import {
  ACHIEVEMENTS,
  DAILY_QUESTS,
  getAchievement,
  getQuestProgress,
} from '@/lib/achievements';
import Navbar from '@/components/Navbar';
import UserAvatar from '@/components/UserAvatar';

export default function DashboardPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);

  useEffect(() => {
    setProgress(loadProgress());
    setCalendar(buildCalendar(10));
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-sm text-subtle">Loading…</div>
      </div>
    );
  }

  const lp = levelProgress(progress.xp);
  const completedQuests = new Set(progress.missions.completed);
  const recentAchievements =
    progress.unlockedAchievements.length > 0
      ? progress.unlockedAchievements
          .slice(-3)
          .reverse()
          .map(getAchievement)
          .filter(Boolean)
      : [];

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar progress={progress} size="lg" />
            <div>
              <div className="text-sm font-medium accent-text mb-1">Dashboard</div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-app">
                {greeting()}, keep it up.
              </h1>
              {progress.equippedItems.badge &&
                progress.equippedItems.badge !== 'badge-none' && (
                  <div className="mt-2">
                    <UserAvatar progress={progress} size="sm" showBadge />
                  </div>
                )}
            </div>
          </div>
          <div className="text-xs text-subtle pt-1 flex items-center gap-3">
            <Link
              href="/shop"
              className="text-xs accent-text hover:underline"
            >
              Customize →
            </Link>
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Today panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="surface rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-subtle mb-2">
              <Activity className="w-3.5 h-3.5" />
              Today's reps
            </div>
            <div className="text-2xl font-semibold text-app tabular-nums">
              {progress.todayReps}
            </div>
            <div className="text-xs text-subtle mt-0.5">across all exercises</div>
          </div>
          <div className="surface rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-subtle mb-2">
              <Flame className="w-3.5 h-3.5" />
              Today's calories
            </div>
            <div className="text-2xl font-semibold text-app tabular-nums">
              {progress.todayCalories}
            </div>
            <div className="text-xs text-subtle mt-0.5">estimated</div>
          </div>
          <div className="surface rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-subtle mb-2">
              <Clock className="w-3.5 h-3.5" />
              Sessions today
            </div>
            <div className="text-2xl font-semibold text-app tabular-nums">
              {progress.todaySessions}
            </div>
            <div className="text-xs text-subtle mt-0.5">completed</div>
          </div>
          <div className="surface rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-subtle mb-2">
              <Flame className="w-3.5 h-3.5" />
              Streak
            </div>
            <div className="text-2xl font-semibold text-app tabular-nums">
              {progress.currentStreak}
              <span className="text-sm font-normal text-subtle ml-1">
                {progress.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="text-xs text-subtle mt-0.5">
              Best: {progress.longestStreak}
            </div>
          </div>
        </div>

        {/* XP + FitCoins row */}
        <div className="grid lg:grid-cols-3 gap-3 mb-6">
          <div className="lg:col-span-2 surface rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-subtle">
                <Zap className="w-3.5 h-3.5" />
                Level {lp.level}
              </div>
              <span className="text-xs text-subtle tabular-nums">
                {progress.xp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lp.pct * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[var(--accent)] rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-subtle">
              <span>
                {lp.intoLevel} / {lp.span} XP
              </span>
              <span>
                {(lp.nextLevelXp - progress.xp).toLocaleString()} XP to level{' '}
                {lp.level + 1}
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="surface surface-hover rounded-2xl p-5 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs text-subtle mb-1">
                <span className="text-base">🪙</span>
                FitCoins
              </div>
              <div className="text-2xl font-semibold text-app tabular-nums">
                {progress.fitCoins.toLocaleString()}
              </div>
              <div className="text-xs accent-text mt-0.5">Open shop →</div>
            </div>
            <ShoppingBag className="w-8 h-8 text-subtle" />
          </Link>
        </div>

        {/* Daily Quests */}
        <div className="surface rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-app">Daily quests</h2>
              <p className="text-xs text-subtle mt-0.5">
                {completedQuests.size} of {DAILY_QUESTS.length} completed · Resets at midnight
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {DAILY_QUESTS.map((quest) => {
              const done = completedQuests.has(quest.id);
              const current = getQuestProgress(progress, quest);
              const pct = (current / quest.target) * 100;
              return (
                <div
                  key={quest.id}
                  className={`p-3 rounded-xl border transition-all ${
                    done
                      ? 'bg-[var(--accent)]/8 border-[var(--accent)]/20'
                      : 'bg-[var(--surface)] border-app'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${
                        done ? 'bg-[var(--accent)]/15' : 'bg-[var(--border)]'
                      }`}
                    >
                      {quest.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          done ? 'text-subtle line-through' : 'text-app'
                        }`}
                      >
                        {quest.name}
                      </div>
                      <div className="text-xs text-subtle">{quest.description}</div>
                    </div>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 accent-text shrink-0" />
                    ) : (
                      <span className="text-xs text-muted shrink-0 tabular-nums">
                        {current} / {quest.target}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                    <motion.div
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full bg-[var(--accent)] rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-subtle">
                    <span>
                      Reward:{' '}
                      <span className="text-app">
                        +{quest.reward.xp} XP · +{quest.reward.coins} coins
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 surface rounded-2xl p-5 sm:p-6">
            <h2 className="text-base font-semibold text-app mb-1">Weekly activity</h2>
            <p className="text-xs text-subtle mb-5">Reps per day across all exercises.</p>
            {progress.totalReps === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <div className="text-center">
                  <Dumbbell className="w-8 h-8 text-subtle mx-auto mb-3" />
                  <p className="text-sm text-subtle">No workouts completed yet.</p>
                  <Link href="/exercise" className="text-sm accent-text hover:underline mt-2 inline-block">
                    Start your first workout →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-52">
                <p className="text-xs text-subtle text-center pt-20">
                  Per-day chart available after completing sessions.
                </p>
              </div>
            )}
          </div>

          <div className="surface rounded-2xl p-5 sm:p-6">
            <h2 className="text-base font-semibold text-app mb-1">
              Streak calendar
            </h2>
            <p className="text-xs text-subtle mb-4">10 weeks of activity.</p>
            <CalendarGrid days={calendar} />
            <div className="flex items-center gap-2 text-xs text-subtle mt-4">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: intensityColor(lvl) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Lifetime stats + Achievements */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 surface rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-app">Lifetime stats</h2>
              <Link
                href="/exercise"
                className="text-xs accent-text hover:underline flex items-center gap-1"
              >
                Start workout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {progress.totalSessions === 0 ? (
              <div className="py-8 text-center">
                <Dumbbell className="w-8 h-8 text-subtle mx-auto mb-3" />
                <p className="text-sm text-subtle mb-3">No sessions yet.</p>
                <Link
                  href="/exercise"
                  className="text-sm accent-text hover:underline"
                >
                  Start your first workout →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <LifetimeStat label="Sessions" value={progress.totalSessions} />
                <LifetimeStat label="Total reps" value={progress.totalReps} />
                <LifetimeStat
                  label="Achievements"
                  value={`${progress.unlockedAchievements.length}/${ACHIEVEMENTS.length}`}
                />
                <LifetimeStat label="Best streak" value={`${progress.longestStreak} days`} />
              </div>
            )}
          </div>

          <div className="surface rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-app">Achievements</h2>
              <Link
                href="/progress"
                className="text-xs accent-text hover:underline"
              >
                View all
              </Link>
            </div>
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-subtle">
                Complete a session to earn your first badge.
              </p>
            ) : (
              <div className="space-y-2">
                {recentAchievements.map((a) =>
                  a ? (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--accent)]/8 border border-[var(--accent)]/20"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center text-lg shrink-0">
                        {a.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-app truncate">
                          {a.name}
                        </div>
                        <div className="text-xs text-subtle truncate">
                          {a.description}
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function LifetimeStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-[var(--surface)] border border-app p-4">
      <div className="text-xs text-subtle mb-1">{label}</div>
      <div className="text-xl font-semibold text-app tabular-nums">{value}</div>
    </div>
  );
}

function intensityColor(level: number): string {
  const colors = [
    'var(--border)',
    'rgba(34,197,94,0.25)',
    'rgba(34,197,94,0.45)',
    'rgba(34,197,94,0.7)',
    'rgba(34,197,94,0.95)',
  ];
  return colors[level] ?? colors[0];
}

function CalendarGrid({ days }: { days: CalendarDay[] }) {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date} · ${day.active ? 'active' : 'rest'}`}
                className="w-3.5 h-3.5 rounded-sm hover:scale-125 transition-transform"
                style={{ background: intensityColor(day.intensity) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
