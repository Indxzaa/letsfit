'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity, Flame, CheckCircle2, Zap, ChevronRight, Dumbbell, Coins, Clock, Swords, ArrowRight,
} from 'lucide-react';
import { BOSSES, TIER_CONFIG } from '@/lib/bosses';
import { buildCalendar, type CalendarDay } from '@/lib/dashboardMock';
import { loadProgress, levelProgress, subscribeToProgress, type Progress } from '@/lib/progress';
import { ACHIEVEMENTS, DAILY_QUESTS, getAchievement, getQuestProgress } from '@/lib/achievements';
import { getUsername } from '@/lib/profileSync';
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
        <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: 'var(--accent)' }} />
      </div>
    );
  }

  const lp = levelProgress(progress.xp);
  const completedQuests = new Set(progress.missions.completed);
  const recentAchievements = progress.unlockedAchievements.length > 0
    ? progress.unlockedAchievements.slice(-3).reverse().map(getAchievement).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-4">
            <UserAvatar progress={progress} size="lg" />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                Mission Control
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-app leading-tight">
                {greeting()}, {getUsername() ?? 'champion'}.
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-subtle">
            <Link href="/shop" className="font-semibold cursor-pointer" style={{ color: 'var(--accent)' }}>
              Customize →
            </Link>
            <span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Top bento row: Streak hero + 3 stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Streak — vibrant accent hero tile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="p-5 flex flex-col justify-between"
            style={{
              borderRadius: 24,
              background: 'var(--accent)',
              boxShadow: '0 12px 40px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-7 h-7 text-white" />
              <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Streak</span>
            </div>
            <div className="font-display text-5xl font-bold text-white leading-none">
              {progress.currentStreak}
              <span className="text-xl font-semibold text-white/70 ml-1">days</span>
            </div>
            <div className="text-white/60 text-xs mt-2">Best: {progress.longestStreak}d</div>
          </motion.div>

          <StatTile icon={Activity} label="Today's reps" value={progress.todayReps} sub="across exercises" delay={0.04} />
          <StatTile icon={Flame} label="Calories" value={progress.todayCalories} sub="estimated" delay={0.08} />
          <StatTile icon={Clock} label="Sessions" value={progress.todaySessions} sub="today" delay={0.12} />
        </div>

        {/* XP + FitCoins */}
        <div className="grid lg:grid-cols-3 gap-3 mb-4">
          <div className="lg:col-span-2 p-6" style={{
            borderRadius: 24,
            background: 'var(--surface-solid)',
            border: '1px solid var(--border)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--accent)', boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent)' }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-subtle uppercase tracking-wider">Experience</div>
                  <div className="font-display text-3xl font-bold text-app">Level {lp.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
                  {Math.round(lp.pct * 100)}%
                </div>
                <div className="text-xs text-subtle">{progress.xp.toLocaleString()} XP</div>
              </div>
            </div>
            <div className="xp-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lp.pct * 100}%` }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                className="xp-fill"
              />
            </div>
            <div className="flex justify-between text-xs text-subtle mt-2">
              <span>{lp.intoLevel.toLocaleString()} / {lp.span.toLocaleString()} XP</span>
              <span>{(lp.nextLevelXp - progress.xp).toLocaleString()} XP to Level {lp.level + 1}</span>
            </div>
          </div>

          <Link href="/shop" className="p-6 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
            style={{
              borderRadius: 24,
              background: 'color-mix(in srgb, var(--accent) 12%, var(--surface-solid))',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            }}>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                <Coins className="w-3.5 h-3.5" />
                FitCoins
              </div>
              <div className="font-display text-4xl font-bold text-app tabular-nums">
                {progress.fitCoins.toLocaleString()}
              </div>
              <div className="text-sm font-semibold mt-1" style={{ color: 'var(--accent)' }}>Open shop →</div>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent)' }}>
              <Coins className="w-7 h-7 text-white" />
            </div>
          </Link>
        </div>

        {/* Daily Quests */}
        <div className="p-6 mb-4" style={{
          borderRadius: 24,
          background: 'var(--surface-solid)',
          border: '1px solid var(--border)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
        }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-3xl font-bold text-app">Daily Quests</h2>
              <p className="text-sm text-subtle mt-0.5">
                {completedQuests.size} of {DAILY_QUESTS.length} completed · Resets at midnight
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
                color: 'var(--accent)',
              }}>
              {completedQuests.size}/{DAILY_QUESTS.length} done
            </div>
          </div>

          <div className="space-y-3">
            {DAILY_QUESTS.map((quest) => {
              const done = completedQuests.has(quest.id);
              const current = getQuestProgress(progress, quest);
              const pct = Math.min(100, (current / quest.target) * 100);
              return (
                <div
                  key={quest.id}
                  className={`p-4 ${done ? 'quest-card-done' : 'quest-card'}`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: done ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
                      }}>
                      {quest.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${done ? 'line-through text-subtle' : 'text-app'}`}>
                        {quest.name}
                      </div>
                      <div className="text-xs text-subtle">{quest.description}</div>
                    </div>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <span className="text-xs font-bold shrink-0 tabular-nums" style={{ color: 'var(--accent)' }}>
                        {current}/{quest.target}
                      </span>
                    )}
                  </div>
                  <div className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))' }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-subtle">
                    Reward: <span className="font-semibold text-app">+{quest.reward.xp} XP · +{quest.reward.coins} coins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar + Activity */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 p-6" style={{
            borderRadius: 24, background: 'var(--surface-solid)', border: '1px solid var(--border)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          }}>
            <h2 className="font-display text-2xl font-bold text-app mb-1">Weekly Activity</h2>
            <p className="text-xs text-subtle mb-5">Reps per day across all exercises.</p>
            {progress.totalReps === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))' }}>
                    <Dumbbell className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="text-sm text-subtle mb-2">No workouts yet.</p>
                  <Link href="/exercise" className="text-sm font-bold cursor-pointer" style={{ color: 'var(--accent)' }}>
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

          <div className="p-6" style={{
            borderRadius: 24, background: 'var(--surface-solid)', border: '1px solid var(--border)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          }}>
            <h2 className="font-display text-2xl font-bold text-app mb-1">Streak Calendar</h2>
            <p className="text-xs text-subtle mb-4">10 weeks of activity.</p>
            <CalendarGrid days={calendar} />
            <div className="flex items-center gap-2 text-xs text-subtle mt-4">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <div key={lvl} className="w-3.5 h-3.5 rounded-sm" style={{ background: intensityColor(lvl) }} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Boss challenge card */}
        <BossChallenge progress={progress} />

        {/* Lifetime stats + Achievements */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-6" style={{
            borderRadius: 24, background: 'var(--surface-solid)', border: '1px solid var(--border)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold text-app">Lifetime Stats</h2>
              <Link href="/exercise" className="text-sm font-bold flex items-center gap-1 cursor-pointer" style={{ color: 'var(--accent)' }}>
                Start workout <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {progress.totalSessions === 0 ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))' }}>
                  <Dumbbell className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                </div>
                <p className="text-sm text-subtle mb-3">No sessions yet.</p>
                <Link href="/exercise" className="text-sm font-bold cursor-pointer" style={{ color: 'var(--accent)' }}>
                  Start your first workout →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Sessions', value: progress.totalSessions },
                  { label: 'Total reps', value: progress.totalReps },
                  { label: 'Achievements', value: `${progress.unlockedAchievements.length}/${ACHIEVEMENTS.length}` },
                  { label: 'Best streak', value: `${progress.longestStreak}d` },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-2xl" style={{
                    background: 'color-mix(in srgb, var(--accent) 8%, var(--surface-solid))',
                    border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
                  }}>
                    <div className="text-xs text-subtle mb-1">{s.label}</div>
                    <div className="font-display text-2xl font-bold text-app tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6" style={{
            borderRadius: 24, background: 'var(--surface-solid)', border: '1px solid var(--border)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold text-app">Achievements</h2>
              <Link href="/progress" className="text-sm font-bold cursor-pointer" style={{ color: 'var(--accent)' }}>View all</Link>
            </div>
            {recentAchievements.length === 0 ? (
              <div className="py-4 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-sm text-subtle">Complete a session to earn your first badge.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAchievements.map((a) => a ? (
                  <div key={a.id} className="flex items-center gap-3 p-3.5 rounded-2xl"
                    style={{
                      background: 'color-mix(in srgb, var(--accent) 12%, var(--surface-solid))',
                      border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                      boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 20%, transparent)',
                    }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'var(--accent)' }}>
                      {a.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-app truncate">{a.name}</div>
                      <div className="text-xs text-subtle truncate">{a.description}</div>
                    </div>
                  </div>
                ) : null)}
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

function StatTile({
  icon: Icon, label, value, sub, delay = 0,
}: {
  icon: typeof Activity; label: string; value: string | number; sub: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-5"
      style={{
        borderRadius: 24,
        background: 'var(--surface-solid)',
        border: '1px solid var(--border)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex items-center gap-1.5 text-xs text-subtle mb-3">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="font-display text-4xl font-bold text-app tabular-nums leading-none">{value}</div>
      <div className="text-xs text-subtle mt-1.5">{sub}</div>
    </motion.div>
  );
}

function intensityColor(level: number): string {
  if (level === 0) return 'var(--border)';
  const pcts: Record<number, string> = { 1: '20%', 2: '42%', 3: '65%', 4: '100%' };
  return `color-mix(in srgb, var(--accent) ${pcts[level]}, transparent)`;
}

function BossChallenge({ progress }: { progress: Progress }) {
  const lp = levelProgress(progress.xp);
  const next = BOSSES.find((b) => !(progress.bossesDefeated?.includes(b.id)));
  if (!next) return null;
  const tier = TIER_CONFIG[next.tier];
  const unlocked = next.isUnlocked(progress);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="mb-4"
    >
      <Link
        href={unlocked ? `/boss/${next.id}` : '#'}
        className="flex items-center justify-between gap-4 p-5 transition-transform hover:scale-[1.01] duration-200"
        style={{
          borderRadius: 24,
          background: tier.bg,
          border: `1px solid ${tier.color}44`,
          boxShadow: `0 8px 32px ${tier.color}22`,
          pointerEvents: unlocked ? 'auto' : 'none',
          opacity: unlocked ? 1 : 0.6,
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${tier.color}22`, border: `1px solid ${tier.color}44` }}>
            <Swords className="w-7 h-7" style={{ color: tier.color }} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: tier.color }}>
              {tier.label} Boss Challenge · World {next.world}
            </div>
            <div className="font-display text-2xl font-bold text-app">{next.name}</div>
            <div className="text-sm text-muted">{next.flavour}</div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted mb-1">Reward</div>
          <div className="font-display text-xl font-bold" style={{ color: tier.color }}>
            +{next.rewards.xp}XP
          </div>
          {unlocked ? (
            <div className="flex items-center gap-1 text-sm font-bold mt-1" style={{ color: tier.color }}>
              Fight now <ArrowRight className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="text-xs text-muted mt-1">{next.unlockLabel}</div>
          )}
        </div>
      </Link>
    </motion.div>
  );
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
