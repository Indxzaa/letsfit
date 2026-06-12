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
  Coins,
  Clock,
} from 'lucide-react';
import { buildCalendar, type CalendarDay } from '@/lib/dashboardMock';
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
        <div className="w-8 h-8 rounded-xl accent-bg animate-pulse" />
      </div>
    );
  }

  const lp = levelProgress(progress.xp);
  const completedQuests = new Set(progress.missions.completed);
  const recentAchievements =
    progress.unlockedAchievements.length > 0
      ? progress.unlockedAchievements.slice(-3).reverse().map(getAchievement).filter(Boolean)
      : [];

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar progress={progress} size="lg" />
            <div>
              <div className="text-xs font-medium accent-text mb-1 uppercase tracking-wider">Dashboard</div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-app leading-tight">
                {greeting()},<br className="sm:hidden" /> keep pushing.
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-subtle pt-1">
            <Link href="/shop" className="text-xs accent-text hover:underline cursor-pointer">
              Customize →
            </Link>
            <span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Today stats — bento */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatTile icon={Activity} label="Today's reps" value={progress.todayReps} sub="across exercises" />
          <StatTile icon={Flame} label="Calories" value={progress.todayCalories} sub="estimated" />
          <StatTile icon={Clock} label="Sessions" value={progress.todaySessions} sub="completed today" />
          <StatTile
            icon={Flame}
            label="Streak"
            value={`${progress.currentStreak}d`}
            sub={`Best: ${progress.longestStreak}d`}
            accent
          />
        </div>

        {/* XP + FitCoins */}
        <div className="grid lg:grid-cols-3 gap-3 mb-4">
          <div className="lg:col-span-2 clay-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl accent-bg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-xl font-bold text-app">Level {lp.level}</span>
              </div>
              <span className="text-xs text-subtle tabular-nums">{progress.xp.toLocaleString()} XP</span>
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
              <span>{lp.intoLevel} / {lp.span} XP</span>
              <span>{(lp.nextLevelXp - progress.xp).toLocaleString()} XP to level {lp.level + 1}</span>
            </div>
          </div>

          <Link
            href="/shop"
            className="clay-sm p-5 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs text-subtle mb-1">
                <Coins className="w-3.5 h-3.5 accent-text" />
                FitCoins
              </div>
              <div className="font-display text-3xl font-bold text-app tabular-nums">
                {progress.fitCoins.toLocaleString()}
              </div>
              <div className="text-xs accent-text mt-1 font-medium">Open shop →</div>
            </div>
            <div className="w-12 h-12 rounded-2xl accent-bg flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>

        {/* Daily Quests */}
        <div className="clay-sm p-5 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-app">Daily Quests</h2>
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
                  className={`p-3.5 rounded-2xl border transition-all ${
                    done
                      ? 'bg-[var(--accent)]/8 border-[var(--accent)]/20'
                      : 'bg-[var(--surface)] border-app'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${
                        done ? 'accent-bg' : 'bg-[var(--border)]'
                      }`}
                    >
                      {quest.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${done ? 'text-subtle line-through' : 'text-app'}`}>
                        {quest.name}
                      </div>
                      <div className="text-xs text-subtle">{quest.description}</div>
                    </div>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 accent-text shrink-0" />
                    ) : (
                      <span className="text-xs text-muted shrink-0 tabular-nums font-medium">
                        {current}/{quest.target}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                    <motion.div
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-subtle">
                    <span>Reward: <span className="text-app">+{quest.reward.xp} XP · +{quest.reward.coins} coins</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 clay-sm p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold text-app mb-1">Weekly Activity</h2>
            <p className="text-xs text-subtle mb-5">Reps per day across all exercises.</p>
            {progress.totalReps === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
                    <Dumbbell className="w-7 h-7 accent-text" />
                  </div>
                  <p className="text-sm text-subtle mb-2">No workouts yet.</p>
                  <Link href="/exercise" className="text-sm accent-text hover:underline font-medium cursor-pointer">
                    Start your first workout →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center">
                <p className="text-xs text-subtle">Per-day chart available after completing sessions.</p>
              </div>
            )}
          </div>

          <div className="clay-sm p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold text-app mb-1">Streak Calendar</h2>
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

        {/* Lifetime + Achievements */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 clay-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold text-app">Lifetime Stats</h2>
              <Link href="/exercise" className="text-xs accent-text hover:underline flex items-center gap-1 cursor-pointer">
                Start workout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {progress.totalSessions === 0 ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-7 h-7 accent-text" />
                </div>
                <p className="text-sm text-subtle mb-3">No sessions yet.</p>
                <Link href="/exercise" className="text-sm accent-text hover:underline cursor-pointer">
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
                <LifetimeStat label="Best streak" value={`${progress.longestStreak}d`} />
              </div>
            )}
          </div>

          <div className="clay-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold text-app">Achievements</h2>
              <Link href="/progress" className="text-xs accent-text hover:underline cursor-pointer">View all</Link>
            </div>
            {recentAchievements.length === 0 ? (
              <div className="py-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 accent-text" />
                </div>
                <p className="text-sm text-subtle">Complete a session to earn your first badge.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAchievements.map((a) =>
                  a ? (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--accent)]/8 border border-[var(--accent)]/20"
                    >
                      <div className="w-10 h-10 rounded-xl accent-bg flex items-center justify-center text-lg shrink-0">
                        {a.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-app truncate">{a.name}</div>
                        <div className="text-xs text-subtle truncate">{a.description}</div>
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

function LifetimeStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-app p-4">
      <div className="text-xs text-subtle mb-1">{label}</div>
      <div className="font-display text-2xl font-bold text-app tabular-nums">{value}</div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`clay-sm p-4 ${accent ? 'bg-[var(--accent)]/8 border-[var(--accent)]/25' : ''}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-subtle mb-2">
        <Icon className={`w-3.5 h-3.5 ${accent ? 'accent-text' : ''}`} />
        {label}
      </div>
      <div className={`font-display text-3xl font-bold tabular-nums ${accent ? 'accent-text' : 'text-app'}`}>
        {value}
      </div>
      <div className="text-xs text-subtle mt-0.5">{sub}</div>
    </motion.div>
  );
}

function intensityColor(level: number): string {
  if (level === 0) return 'var(--border)';
  const pcts: Record<number, string> = { 1: '20%', 2: '42%', 3: '65%', 4: '100%' };
  return `color-mix(in srgb, var(--accent) ${pcts[level]}, transparent)`;
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
                className="w-3.5 h-3.5 rounded-sm hover:scale-125 transition-transform cursor-default"
                style={{ background: intensityColor(day.intensity) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
