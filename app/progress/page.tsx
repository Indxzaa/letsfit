'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Flame, Trophy, Activity, Target, Zap, Lock, Swords, Crown, ArrowRight, Check } from 'lucide-react';
import { loadProgress, levelProgress, equipItem, subscribeToProgress, type Progress } from '@/lib/progress';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { BOSSES, TIER_CONFIG } from '@/lib/bosses';
import { getWorldTheme } from '@/lib/worlds';
import { EARNED_TITLES } from '@/lib/titles';
import { RARITY_CONFIG } from '@/lib/shop';
import { ProgressSkeleton } from '@/components/Skeleton';
import Navbar from '@/components/Navbar';

const STAT_COLORS = [
  'var(--card-bg-green)',
  'var(--card-bg-amber)',
  'var(--card-bg-blue)',
  'var(--card-bg-purple)',
];

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  if (!progress) return <ProgressSkeleton />;

  const lp = levelProgress(progress.xp);
  const unlocked = new Set(progress.unlockedAchievements);

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Header ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="link-back cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back home
            </Link>
          </div>
          <div className="neo-badge mb-5">Your Journey</div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-app mb-4 leading-tight">
            Keep showing up.
          </h1>
          <p className="text-xl text-muted max-w-xl">
            Every rep counts. Every session builds momentum. Keep going.
          </p>
        </div>

        {/* ── Level Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="neo-card-accent p-8 mb-6 overflow-hidden relative"
          style={{ borderRadius: 0, boxShadow: '6px 6px 0 var(--neo-black)' }}
        >
          <div className="relative flex items-start justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)' }}
              >
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                  Current Level
                </div>
                <div className="font-display text-7xl font-bold text-white leading-none">
                  {lp.level}
                </div>
                <div className="text-white/70 text-sm mt-1">
                  {progress.xp.toLocaleString()} XP total
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                Next level
              </div>
              <div className="font-display text-4xl font-bold text-white">
                {(lp.nextLevelXp - progress.xp).toLocaleString()}
                <span className="text-xl font-semibold text-white/70 ml-1">XP</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="relative h-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lp.pct * 100}%` }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="h-full"
              style={{ background: 'rgba(255,255,255,0.9)' }}
            />
          </div>
          <div className="flex justify-between text-white/60 text-xs mt-2 font-semibold">
            <span>Level {lp.level}</span>
            <span>{lp.intoLevel.toLocaleString()} / {lp.span.toLocaleString()} XP</span>
            <span>Level {lp.level + 1}</span>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Flame,    label: 'Current streak', value: `${progress.currentStreak}d`,                  sub: `Longest: ${progress.longestStreak}d` },
            { icon: Activity, label: 'Total sessions',  value: String(progress.totalSessions),                sub: 'Completed' },
            { icon: Target,   label: 'Total reps',      value: String(progress.totalReps),                    sub: 'Logged' },
            { icon: Trophy,   label: 'Achievements',    value: `${unlocked.size}/${ACHIEVEMENTS.length}`,     sub: 'Unlocked' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="neo-card p-5"
              style={{ borderRadius: 0, background: STAT_COLORS[i] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ background: 'var(--neo-white)', border: 'var(--neo-border-2)' }}
                >
                  <s.icon className="w-4 h-4" style={{ color: 'var(--neo-accent)' }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-subtle">{s.label}</span>
              </div>
              <div className="font-display text-3xl font-bold text-app tabular-nums">{s.value}</div>
              <div className="text-xs text-subtle mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Boss Battles ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="neo-card p-6 sm:p-8 mb-6"
          style={{ borderRadius: 0, background: 'var(--card-bg-blue)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-app">Boss Battles</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-subtle mt-1">
                {progress.bossesDefeated?.length ?? 0} of {BOSSES.length} defeated
              </p>
            </div>
            <Link href="/adventure" className="link-cta">
              <span>Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {BOSSES.map((boss) => {
              const tier = TIER_CONFIG[boss.tier];
              const defeated = progress.bossesDefeated?.includes(boss.id) ?? false;
              const unlockable = boss.isUnlocked(progress);
              return (
                <Link
                  key={boss.id}
                  href={unlockable ? `/boss/${boss.id}` : '#'}
                  className="flex items-center gap-4 p-4 neo-card hover:scale-[1.01] transition-transform duration-150"
                  style={{
                    borderRadius: 0,
                    background: defeated ? tier.bg : 'var(--neo-white)',
                    borderColor: defeated ? tier.color : undefined,
                    boxShadow: defeated ? `3px 3px 0 ${tier.color}` : 'var(--neo-shadow-sm)',
                    opacity: unlockable ? 1 : 0.5,
                    pointerEvents: unlockable ? 'auto' : 'none',
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{
                      background: `${tier.color}22`,
                      border: `3px solid ${tier.color}66`,
                    }}
                  >
                    {unlockable ? (
                      <Swords className="w-4 h-4" style={{ color: tier.color }} />
                    ) : (
                      <Lock className="w-3.5 h-3.5" style={{ color: tier.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: tier.color }}>
                      {tier.label} · {getWorldTheme(boss.world).name}
                    </div>
                    <div className="font-bold text-app text-sm truncate">{boss.name}</div>
                    <div className="text-xs text-muted truncate">{boss.flavour}</div>
                  </div>
                  <div className="text-xs font-bold shrink-0" style={{ color: defeated ? tier.color : 'var(--text-subtle)' }}>
                    {defeated ? '✓ Done' : unlockable ? 'Fight →' : '🔒'}
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* ── Titles ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="neo-card p-6 sm:p-8 mb-6"
          style={{ borderRadius: 0, background: 'var(--card-bg-amber)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-app">Titles</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-subtle mt-1">
                {EARNED_TITLES.filter((t) => t.check(progress)).length} of {EARNED_TITLES.length} earned
              </p>
            </div>
            <Crown className="w-5 h-5 text-subtle" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EARNED_TITLES.map((t) => {
              const earned = t.check(progress);
              const prog = t.getProgress?.(progress);
              const pct = prog ? Math.min(100, (prog.current / prog.max) * 100) : 0;
              const rc = RARITY_CONFIG[t.rarity];
              const isEquipped = progress.equippedItems?.title === t.id;
              return (
                <div
                  key={t.id}
                  className="neo-card p-4"
                  style={earned ? {
                    borderRadius: 0,
                    background: 'var(--neo-cream)',
                    borderColor: rc.color,
                    boxShadow: `3px 3px 0 ${rc.color}`,
                  } : {
                    borderRadius: 0,
                    background: 'var(--neo-surface)',
                    opacity: 0.65,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5"
                      style={{
                        color: rc.color,
                        background: `${rc.color}22`,
                        border: `2px solid ${rc.color}`,
                      }}
                    >
                      {t.value}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isEquipped && (
                        <span className="text-[10px] font-bold px-2 py-0.5 neo-card-accent" style={{ borderRadius: 0 }}>
                          Active
                        </span>
                      )}
                      {!earned && <Lock className="w-3.5 h-3.5 text-subtle shrink-0" />}
                    </div>
                  </div>
                  <div className="text-xs text-muted mb-3 leading-relaxed">{t.description}</div>

                  {prog && !earned && (
                    <div className="mb-3">
                      <div className="h-1.5 overflow-hidden mb-1" style={{ background: 'var(--neo-surface)', border: '1px solid var(--border)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full"
                          style={{ background: rc.color }}
                        />
                      </div>
                      <div className="text-[10px] text-subtle tabular-nums font-semibold">
                        {prog.current} / {prog.max}
                      </div>
                    </div>
                  )}

                  {earned && (
                    <button
                      onClick={() => {
                        const updated = equipItem(progress, 'title', isEquipped ? '' : t.id);
                        setProgress(updated);
                      }}
                      className="w-full py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                      style={isEquipped ? {
                        background: 'var(--neo-surface)',
                        border: 'var(--neo-border-2)',
                        color: 'var(--text-muted)',
                      } : {
                        background: rc.color,
                        border: `2px solid ${rc.color}`,
                        color: '#fff',
                      }}
                    >
                      {isEquipped ? 'Unequip' : 'Equip'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Achievement Wall ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="neo-card p-6 sm:p-8"
          style={{ borderRadius: 0, background: 'var(--card-bg-purple)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-app">Achievement Wall</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-subtle mt-1">
                {unlocked.size} of {ACHIEVEMENTS.length} unlocked
              </p>
            </div>
            <div
              className="neo-card-accent px-3 py-1.5 text-sm font-bold"
              style={{ borderRadius: 0 }}
            >
              {Math.round((unlocked.size / ACHIEVEMENTS.length) * 100)}% complete
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const isUnlocked = unlocked.has(a.id);
              const prog = a.getProgress?.(progress);
              const pct = prog ? Math.min(100, (prog.current / prog.max) * 100) : 0;

              const RARITY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
                common:    { bg: '#f0f0ee', border: '#6b7280', label: '#6b7280' },
                rare:      { bg: 'var(--card-bg-blue)',   border: '#3b82f6', label: '#3b82f6' },
                epic:      { bg: 'var(--card-bg-purple)', border: '#8b5cf6', label: '#8b5cf6' },
                legendary: { bg: 'var(--card-bg-amber)',  border: '#f59e0b', label: '#f59e0b' },
              };
              const rc = RARITY_COLORS[a.rarity] ?? RARITY_COLORS.common;

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + i * 0.02 }}
                  className="neo-card p-4 relative"
                  style={isUnlocked ? {
                    borderRadius: 0,
                    background: rc.bg,
                    borderColor: rc.border,
                    boxShadow: `3px 3px 0 ${rc.border}`,
                  } : {
                    borderRadius: 0,
                    background: 'var(--neo-white)',
                    opacity: 0.6,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-xl"
                      style={{
                        background: isUnlocked ? rc.border : 'var(--neo-surface)',
                        border: isUnlocked ? `2px solid ${rc.border}` : 'var(--neo-border-2)',
                        color: isUnlocked ? '#fff' : undefined,
                      }}
                    >
                      {isUnlocked ? a.icon : <Lock className="w-4 h-4 text-subtle" />}
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                      style={isUnlocked
                        ? { background: `${rc.border}22`, color: rc.label, border: `2px solid ${rc.border}` }
                        : { background: 'var(--neo-surface)', color: 'var(--text-subtle)', border: 'var(--neo-border-2)' }
                      }
                    >
                      {a.rarity}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-app mb-1">{a.name}</div>
                  <div className="text-xs text-muted leading-relaxed mb-3">{a.description}</div>

                  {prog && !isUnlocked && (
                    <div>
                      <div className="h-1.5 overflow-hidden mb-1" style={{ background: 'var(--neo-surface)', border: '1px solid var(--border)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full"
                          style={{ background: rc.label }}
                        />
                      </div>
                      <div className="text-[10px] text-subtle tabular-nums font-semibold">
                        {prog.current} / {prog.max}
                      </div>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: rc.label }}>
                      <Check className="w-3.5 h-3.5" /> Unlocked
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
