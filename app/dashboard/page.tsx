'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity, Flame, CheckCircle2, Zap, ChevronRight, Dumbbell, Coins, Clock, Swords, ArrowRight, Lock, Trophy, Users,
} from 'lucide-react';
import { BOSSES, TIER_CONFIG } from '@/lib/bosses';
import { getWorldTheme } from '@/lib/worlds';
import { loadProgress, saveProgress, levelProgress, subscribeToProgress, processLogin, claimCalendarDay, type Progress } from '@/lib/progress';
import { applyLoginReward } from '@/lib/loginRewards';
import { ACHIEVEMENTS, DAILY_QUESTS, getAchievement, getQuestProgress, applyNewAchievements } from '@/lib/achievements';
import { getUsername } from '@/lib/profileSync';
import { DashboardSkeleton } from '@/components/Skeleton';
import Navbar from '@/components/Navbar';
import UserAvatar from '@/components/UserAvatar';
import LoginCalendarModal from '@/components/LoginCalendarModal';
import { useAuth } from '@/components/AuthProvider';
import { getAvatarPublicUrl } from '@/lib/profilePicture';

export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(false);

  const handleClaim = (day: number) => {
    const p = loadProgress();
    const result = claimCalendarDay(p, day);
    if (!result) return;
    const final = applyNewAchievements(applyLoginReward(result.updated, result.rewardIndex + 1));
    saveProgress(final);
    setProgress(final);
  };

  useEffect(() => {
    const { updated, isNew } = processLogin(loadProgress());
    const p = applyNewAchievements(updated);
    if (isNew || p !== updated) saveProgress(p);
    setProgress(p);
    const popupKey = `letsfit:calendar:${updated.lastLoginDate}`;
    if (isNew && !sessionStorage.getItem(popupKey)) {
      setShowModal(true);
      setIsFirstOpen(true);
      sessionStorage.setItem(popupKey, '1');
    }
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  if (!progress) return <DashboardSkeleton />;

  const lp = levelProgress(progress.xp);
  const completedQuests = new Set(progress.missions.completed);
  const recentAchievements = progress.unlockedAchievements.length > 0
    ? progress.unlockedAchievements.slice(-3).reverse().map(getAchievement).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <LoginCalendarModal
        open={showModal}
        onClose={() => setShowModal(false)}
        progress={progress}
        onClaim={handleClaim}
        isFirstOpenToday={isFirstOpen}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-12">
          <div className="flex items-center gap-4">
            <UserAvatar
              photoUrl={user?.id ? getAvatarPublicUrl(user.id) : null}
              letter={(getUsername() ?? user?.email ?? '?').charAt(0)}
              size="lg"
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--neo-accent)' }}>
                Mission Control
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-app leading-tight">
                {greeting()}, {getUsername() ?? 'champion'}.
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-subtle">
            <Link href="/shop" className="link-cta">
              <span>Customize</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-subtle">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* ── Top bento row: Streak hero + 3 stat tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Streak — accent hero tile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="p-6 flex flex-col justify-between neo-card-accent"
            style={{ borderRadius: 16 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-7 h-7 text-white" />
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Streak</span>
            </div>
            <div className="font-display text-5xl font-bold text-white leading-none">
              {progress.currentStreak}
              <span className="text-xl font-semibold text-white/70 ml-1">days</span>
            </div>
            <div className="text-white/60 text-xs mt-4">Best: {progress.longestStreak}d</div>
          </motion.div>

          <StatTile icon={Activity} label="Today's reps" value={progress.todayReps} sub="across exercises" bg="var(--card-bg-blue)" delay={0.04} />
          <StatTile icon={Flame} label="Calories" value={progress.todayCalories} sub="estimated" bg="var(--card-bg-amber)" delay={0.08} />
          <StatTile icon={Clock} label="Sessions" value={progress.todaySessions} sub="today" bg="var(--card-bg-purple)" delay={0.12} />
        </div>

        {/* ── XP + FitCoins ── */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 p-6 neo-card" style={{ borderRadius: 16, background: 'var(--neo-surface)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center neo-card-accent"
                  style={{ borderRadius: 12 }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-subtle uppercase tracking-wider mb-0.5">Experience</div>
                  <div className="font-display text-3xl font-bold text-app">Level {lp.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold tabular-nums" style={{ color: 'var(--neo-accent)' }}>
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
            <div className="flex justify-between text-xs text-subtle mt-3">
              <span>{lp.intoLevel.toLocaleString()} / {lp.span.toLocaleString()} XP</span>
              <span>{(lp.nextLevelXp - progress.xp).toLocaleString()} XP to Level {lp.level + 1}</span>
            </div>
          </div>

          <Link
            href="/shop"
            className="p-6 flex items-center justify-between hover:scale-[1.01] transition-transform duration-150 cursor-pointer neo-card"
            style={{ borderRadius: 16, background: 'var(--card-bg-green)' }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--neo-accent)' }}>
                <Coins className="w-3.5 h-3.5" />
                FitCoins
              </div>
              <div className="font-display text-4xl font-bold text-app tabular-nums">
                {progress.fitCoins.toLocaleString()}
              </div>
              <div className="text-sm font-semibold mt-2">
                <span className="link-cta">
                  <span>Open shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
            <div
              className="w-14 h-14 flex items-center justify-center neo-card-accent shrink-0"
              style={{ borderRadius: 12 }}
            >
              <Coins className="w-7 h-7 text-white" />
            </div>
          </Link>
        </div>

        {/* ── Daily Quests ── */}
        <div className="p-6 mb-8 neo-card" style={{ borderRadius: 16, background: 'var(--neo-white)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-app">Daily Quests</h2>
              <p className="text-xs text-subtle mt-1">
                {completedQuests.size} of {DAILY_QUESTS.length} completed · Resets at midnight
              </p>
            </div>
            <div
              className="px-3 py-1 text-xs font-bold uppercase tracking-wider neo-card-accent"
              style={{ borderRadius: 6 }}
            >
              {completedQuests.size}/{DAILY_QUESTS.length}
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
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center text-lg shrink-0"
                      style={{
                        borderRadius: 8,
                        background: done ? 'var(--neo-accent)' : 'color-mix(in srgb, var(--neo-accent) 15%, var(--neo-surface))',
                      }}
                    >
                      {quest.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${done ? 'line-through text-subtle' : 'text-app'}`}>
                        {quest.name}
                      </div>
                      <div className="text-xs text-subtle">{quest.description}</div>
                    </div>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--neo-accent)' }} />
                    ) : (
                      <span className="text-xs font-bold shrink-0 tabular-nums" style={{ color: 'var(--neo-accent)' }}>
                        {current}/{quest.target}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--neo-accent) 15%, var(--neo-surface))' }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--neo-accent)' }}
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-subtle">
                    +{quest.reward.xp} XP · +{quest.reward.coins} coins
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Weekly Activity + Login Streak ── */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div
            className="lg:col-span-2 p-6 neo-card"
            style={{ borderRadius: 16, background: 'var(--card-bg-blue)' }}
          >
            <h2 className="font-display text-xl font-bold text-app mb-1">Weekly Activity</h2>
            <p className="text-xs text-subtle mb-6">Reps per day across all exercises.</p>
            {progress.totalReps === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="w-14 h-14 flex items-center justify-center mx-auto mb-4 neo-card-accent"
                    style={{ borderRadius: 12 }}
                  >
                    <Dumbbell className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm text-subtle mb-2">No workouts yet.</p>
                  <Link href="/exercise" className="link-cta">
                    <span>Start your first workout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-xs text-subtle">Per-day chart available after completing sessions.</p>
              </div>
            )}
          </div>

          <div
            className="p-6 cursor-pointer hover:scale-[1.01] transition-transform duration-150 neo-card"
            style={{ borderRadius: 16, background: 'var(--card-bg-amber)' }}
            onClick={() => { setIsFirstOpen(false); setShowModal(true); }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl font-bold text-app">Login Streak</h2>
              <span
                className="text-xs font-bold px-2 py-1 neo-card-accent"
                style={{ borderRadius: 6 }}
              >
                {new Date().toLocaleString('default', { month: 'short' })}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <div className="font-display text-5xl font-bold text-app leading-none tabular-nums">{progress.loginStreak}</div>
              <div className="pb-1 text-sm text-subtle">days</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-subtle mb-4">
              <Trophy className="w-3.5 h-3.5" />
              Best: {progress.highestLoginStreak} days
            </div>
            {/* Mini calendar grid */}
            {(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth();
              const todayDay = now.getDate();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstDow = new Date(year, month, 1).getDay();
              const currentMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
              const claimed = progress.calendarMonth === currentMonth ? progress.calendarClaimedDays : [];
              return (
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDow }, (_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isClaimed = claimed.includes(day);
                    const isToday = day === todayDay;
                    const isFuture = day > todayDay;
                    return (
                      <div
                        key={day}
                        className="aspect-square rounded-sm"
                        style={{
                          background: isClaimed
                            ? 'color-mix(in srgb, #ef4444 60%, transparent)'
                            : isToday
                            ? 'var(--neo-accent)'
                            : isFuture
                            ? 'var(--border)'
                            : 'color-mix(in srgb, var(--border) 60%, transparent)',
                          opacity: isFuture ? 0.3 : 1,
                          boxShadow: isToday ? '0 0 6px color-mix(in srgb, var(--neo-accent) 50%, transparent)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              );
            })()}
            {(() => {
              const now = new Date();
              const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              const claimed = progress.calendarMonth === currentMonth ? progress.calendarClaimedDays : [];
              const todayClaimed = claimed.includes(now.getDate());
              return (
                <div
                  className="mt-4 w-full py-2 text-center text-xs font-bold transition-opacity"
                  style={{
                    borderRadius: 6,
                    background: todayClaimed ? 'var(--border)' : 'var(--neo-accent)',
                    color: todayClaimed ? 'var(--text-subtle)' : '#fff',
                    opacity: todayClaimed ? 0.6 : 1,
                    border: todayClaimed ? '2px solid var(--border-strong)' : '2px solid var(--neo-accent)',
                  }}
                >
                  {todayClaimed ? '✓ Claimed today' : '🎁 Claim today\'s reward'}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Boss Challenge ── */}
        <BossChallenge progress={progress} />

        {/* ── Lifetime Stats + Achievements ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div
            className="lg:col-span-2 p-6 neo-card"
            style={{ borderRadius: 16, background: 'var(--card-bg-green)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-app">Lifetime Stats</h2>
              <Link href="/exercise" className="link-cta">
                <span>Start workout</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {progress.totalSessions === 0 ? (
              <div className="py-6 text-center">
                <div
                  className="w-14 h-14 flex items-center justify-center mx-auto mb-4 neo-card-accent"
                  style={{ borderRadius: 12 }}
                >
                  <Dumbbell className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-subtle mb-4">No sessions yet.</p>
                <Link href="/exercise" className="link-cta">
                  <span>Start your first workout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
                  <div
                    key={s.label}
                    className="p-4 neo-card"
                    style={{ borderRadius: 12, background: 'var(--neo-white)' }}
                  >
                    <div className="text-xs text-subtle mb-1">{s.label}</div>
                    <div className="font-display text-2xl font-bold text-app tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="p-6 neo-card"
            style={{ borderRadius: 16, background: 'var(--card-bg-purple)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-app">Achievements</h2>
              <Link href="/progress" className="link-cta">View all</Link>
            </div>
            {recentAchievements.length === 0 ? (
              <div className="py-4 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-sm text-subtle">Complete a session to earn your first badge.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAchievements.map((a) => a ? (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 neo-card"
                    style={{ borderRadius: 12, background: 'var(--neo-white)' }}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center text-xl shrink-0 neo-card-accent"
                      style={{ borderRadius: 10 }}
                    >
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

        {/* ── Workout Together promo ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="mt-4 neo-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
          style={{ borderRadius: 16, background: 'var(--card-bg-blue)' }}
        >
          <div
            className="w-12 h-12 flex items-center justify-center neo-card-accent shrink-0"
            style={{ borderRadius: 12 }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-app">Workout Together</h2>
            <p className="text-sm text-muted mt-0.5">Exercise with a friend in real-time. Compete, motivate each other, and earn rewards.</p>
          </div>
          <Link href="/workout-together" className="link-cta shrink-0 whitespace-nowrap">
            <span>Try it now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

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
  icon: Icon, label, value, sub, bg, delay = 0,
}: {
  icon: typeof Activity; label: string; value: string | number; sub: string; bg: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-5 neo-card"
      style={{ borderRadius: 16, background: bg }}
    >
      <div className="flex items-center gap-2 text-xs text-subtle mb-3">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="font-display text-4xl font-bold text-app tabular-nums leading-none">{value}</div>
      <div className="text-xs text-subtle mt-2">{sub}</div>
    </motion.div>
  );
}

function BossChallenge({ progress }: { progress: Progress }) {
  const next = BOSSES.find((b) => !(progress.bossesDefeated?.includes(b.id)));
  if (!next) return null;
  const tier = TIER_CONFIG[next.tier];
  const unlocked = next.isUnlocked(progress);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="mb-8"
    >
      <Link
        href={unlocked ? `/boss/${next.id}` : '#'}
        className="flex items-center justify-between gap-4 p-6 hover:scale-[1.01] transition-transform duration-150 neo-card"
        style={{
          borderRadius: 16,
          background: tier.bg,
          borderColor: `${tier.color}66`,
          boxShadow: `4px 4px 0 ${tier.color}88`,
          pointerEvents: unlocked ? 'auto' : 'none',
          opacity: unlocked ? 1 : 0.6,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 flex items-center justify-center shrink-0"
            style={{
              borderRadius: 12,
              background: `${tier.color}22`,
              border: `3px solid ${tier.color}66`,
            }}
          >
            {unlocked
              ? <Swords className="w-7 h-7" style={{ color: tier.color }} />
              : <Lock className="w-6 h-6" style={{ color: tier.color }} />
            }
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: tier.color }}>
              {tier.label} Boss · {getWorldTheme(next.world).name}
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
            <div className="flex items-center gap-1 text-sm font-bold mt-2" style={{ color: tier.color }}>
              Fight now <ArrowRight className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="text-xs text-muted mt-2">{next.unlockLabel}</div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
