'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Flame, Trophy, Activity, Target, Zap, Lock, Swords, Crown } from 'lucide-react';
import { loadProgress, levelProgress, equipItem, subscribeToProgress, type Progress } from '@/lib/progress';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { BOSSES, TIER_CONFIG } from '@/lib/bosses';
import { getWorldTheme } from '@/lib/worlds';
import { EARNED_TITLES } from '@/lib/titles';
import { RARITY_CONFIG } from '@/lib/shop';
import Navbar from '@/components/Navbar';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
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
  const unlocked = new Set(progress.unlockedAchievements);

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-6 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back home
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              color: 'var(--accent)',
            }}>
            Your journey
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-app mb-3 leading-tight">Keep showing up.</h1>
          <p className="text-xl text-muted max-w-xl">Every rep counts. Every session builds momentum. Keep going.</p>
        </div>

        {/* Level hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8 mb-6 overflow-hidden relative"
          style={{
            borderRadius: 28,
            background: 'var(--accent)',
            boxShadow: '0 16px 48px color-mix(in srgb, var(--accent) 50%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="absolute -bottom-12 -left-4 w-40 h-40 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <div className="relative flex items-start justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-1">Current Level</div>
                <div className="font-display text-7xl font-bold text-white leading-none">{lp.level}</div>
                <div className="text-white/70 text-sm mt-1">{progress.xp.toLocaleString()} XP total</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-1">Next level</div>
              <div className="font-display text-4xl font-bold text-white">
                {(lp.nextLevelXp - progress.xp).toLocaleString()}
                <span className="text-xl font-semibold text-white/70 ml-1">XP</span>
              </div>
            </div>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lp.pct * 100}%` }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 12px rgba(255,255,255,0.6)' }}
            />
          </div>
          <div className="flex justify-between text-white/60 text-xs mt-2">
            <span>Level {lp.level}</span>
            <span>{lp.intoLevel.toLocaleString()} / {lp.span.toLocaleString()} XP</span>
            <span>Level {lp.level + 1}</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Flame,    label: 'Current streak', value: `${progress.currentStreak}d`,                       sub: `Longest: ${progress.longestStreak}d`, delay: 0 },
            { icon: Activity, label: 'Total sessions',  value: String(progress.totalSessions),                     sub: 'Completed',                           delay: 0.05 },
            { icon: Target,   label: 'Total reps',      value: String(progress.totalReps),                         sub: 'Logged',                              delay: 0.1 },
            { icon: Trophy,   label: 'Achievements',    value: `${unlocked.size}/${ACHIEVEMENTS.length}`,           sub: 'Unlocked',                            delay: 0.15 },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: s.delay }}
              className="p-5"
              style={{ borderRadius: 20, background: 'var(--surface-solid)', border: '1px solid var(--border)', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))' }}>
                  <s.icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                <span className="text-xs text-subtle">{s.label}</span>
              </div>
              <div className="font-display text-3xl font-bold text-app tabular-nums">{s.value}</div>
              <div className="text-xs text-subtle mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Boss battles section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="p-6 sm:p-8 mb-6"
          style={{ borderRadius: 28, background: 'var(--surface-solid)', border: '1px solid var(--border)', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-3xl font-bold text-app">Boss Battles</h2>
              <p className="text-sm text-subtle mt-1">{progress.bossesDefeated?.length ?? 0} of {BOSSES.length} defeated</p>
            </div>
            <Link href="/exercise" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
              Challenge →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {BOSSES.map((boss) => {
              const tier = TIER_CONFIG[boss.tier];
              const defeated = progress.bossesDefeated?.includes(boss.id) ?? false;
              const unlockable = boss.isUnlocked(progress);
              return (
                <Link key={boss.id} href={unlockable ? `/boss/${boss.id}` : '#'}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-transform hover:scale-[1.01] duration-200"
                  style={{
                    background: defeated ? tier.bg : 'var(--surface)',
                    border: `1px solid ${defeated ? tier.color + '44' : 'var(--border)'}`,
                    opacity: unlockable ? 1 : 0.5,
                    pointerEvents: unlockable ? 'auto' : 'none',
                  }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${tier.color}22`, border: `1px solid ${tier.color}44` }}>
                    {unlockable ? (
                      <Swords className="w-5 h-5" style={{ color: tier.color }} />
                    ) : (
                      <Lock className="w-4 h-4" style={{ color: tier.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: tier.color }}>
                      {tier.label} · {getWorldTheme(boss.world).name}
                    </div>
                    <div className="font-semibold text-app text-sm truncate">{boss.name}</div>
                    <div className="text-xs text-muted truncate">{boss.flavour}</div>
                  </div>
                  <div className="text-xs font-bold shrink-0" style={{ color: defeated ? tier.color : 'var(--text-subtle)' }}>
                    {defeated ? '✓ Done' : unlockable ? 'Fight' : '🔒'}
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Titles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="p-6 sm:p-8 mb-6"
          style={{ borderRadius: 28, background: 'var(--surface-solid)', border: '1px solid var(--border)', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-3xl font-bold text-app">Titles</h2>
              <p className="text-sm text-subtle mt-1">
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
                  className="p-4 rounded-2xl"
                  style={earned ? {
                    background: `${rc.color}12`,
                    border: `1px solid ${rc.color}44`,
                  } : {
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    opacity: 0.6,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ color: rc.color, background: `${rc.color}22` }}
                    >
                      {t.value}
                    </span>
                    {isEquipped && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: rc.color, background: `${rc.color}22` }}>
                        Active
                      </span>
                    )}
                    {!earned && <Lock className="w-3.5 h-3.5 text-subtle shrink-0" />}
                  </div>
                  <div className="text-xs text-muted mb-3">{t.description}</div>
                  {prog && !earned && (
                    <div className="mb-3">
                      <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'var(--border)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{ background: rc.color }}
                        />
                      </div>
                      <div className="text-[10px] text-subtle tabular-nums">{prog.current} / {prog.max}</div>
                    </div>
                  )}
                  {earned && (
                    <button
                      onClick={() => {
                        const updated = equipItem(progress, 'title', isEquipped ? '' : t.id);
                        setProgress(updated);
                      }}
                      className="w-full py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                      style={isEquipped ? {
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                      } : {
                        background: rc.color,
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

        {/* Trophy wall */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 sm:p-8"
          style={{ borderRadius: 28, background: 'var(--surface-solid)', border: '1px solid var(--border)', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-app">Achievement Wall</h2>
              <p className="text-sm text-subtle mt-1">{unlocked.size} of {ACHIEVEMENTS.length} unlocked</p>
            </div>
            <div className="px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))', color: 'var(--accent)' }}>
              {Math.round((unlocked.size / ACHIEVEMENTS.length) * 100)}% complete
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const isUnlocked = unlocked.has(a.id);
              const prog = a.getProgress?.(progress);
              const pct = prog ? Math.min(100, (prog.current / prog.max) * 100) : 0;
              const rarityColors: Record<string, { bg: string; border: string; label: string; glow: string }> = {
                common:    { bg: 'color-mix(in srgb, #6b7280 12%, var(--surface-solid))', border: 'color-mix(in srgb, #6b7280 30%, transparent)', label: '#6b7280', glow: 'rgba(107,114,128,0.2)' },
                rare:      { bg: 'color-mix(in srgb, #3b82f6 12%, var(--surface-solid))', border: 'color-mix(in srgb, #3b82f6 35%, transparent)', label: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
                epic:      { bg: 'color-mix(in srgb, #8b5cf6 12%, var(--surface-solid))', border: 'color-mix(in srgb, #8b5cf6 40%, transparent)', label: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
                legendary: { bg: 'color-mix(in srgb, #f59e0b 15%, var(--surface-solid))', border: 'color-mix(in srgb, #f59e0b 50%, transparent)', label: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
              };
              const rc = rarityColors[a.rarity];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + i * 0.025 }}
                  className="p-4 relative overflow-hidden"
                  style={isUnlocked ? {
                    borderRadius: 20, background: rc.bg, border: `1px solid ${rc.border}`, boxShadow: `0 6px 24px ${rc.glow}`,
                  } : {
                    borderRadius: 20, background: 'var(--surface)', border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: isUnlocked ? rc.label : 'var(--border)', boxShadow: isUnlocked ? `0 4px 12px ${rc.glow}` : 'none' }}>
                      {isUnlocked ? a.icon : <Lock className="w-5 h-5 text-subtle" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={isUnlocked ? { background: rc.border, color: rc.label } : { background: 'var(--border)', color: 'var(--text-subtle)' }}>
                      {a.rarity}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-app mb-1">{a.name}</div>
                  <div className="text-xs text-muted leading-relaxed mb-3">{a.description}</div>

                  {/* Progress bar */}
                  {prog && !isUnlocked && (
                    <div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'var(--border)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: rc.label }}
                        />
                      </div>
                      <div className="text-[10px] text-subtle tabular-nums">{prog.current} / {prog.max}</div>
                    </div>
                  )}
                  {isUnlocked && (
                    <div className="text-xs font-bold" style={{ color: rc.label }}>✓ Unlocked</div>
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
