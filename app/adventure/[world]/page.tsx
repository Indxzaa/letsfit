'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle2, ChevronRight, Clock, Zap, Coins, Star, Swords } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { WORLD_THEMES } from '@/lib/worlds';
import { getWorldStages, isStageComplete, isStageUnlocked } from '@/lib/stages';
import { getBoss, BOSS_GAME_CONFIGS, TIER_CONFIG } from '@/lib/bosses';
import { loadProgress, subscribeToProgress, type Progress } from '@/lib/progress';
import { useAuth } from '@/components/AuthProvider';
import { WorldAtmosphere } from '@/components/WorldAtmosphere';

const DEV_EMAIL = 'indyy8262@gmail.com';

const EXERCISE_LABELS: Record<string, string> = {
  'jumping-jack': 'Jumping Jacks', 'squat': 'Squats', 'pushup': 'Push-Ups',
  'lunge': 'Lunges', 'plank': 'Plank Hold', 'mountain-climber': 'Mountain Climbers',
  'high-knees': 'High Knees', 'wall-sit': 'Wall Sit', 'bird-dog': 'Bird Dog',
  'dead-bug': 'Dead Bug', 'glute-bridge': 'Glute Bridge', 'pullup': 'Pull-Ups',
};
const TIMED = new Set(['plank', 'wall-sit']);
const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const DIFF_COLOR = ['#22c55e', '#60a5fa', '#a855f7', '#f59e0b'];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function WorldPage() {
  const params = useParams();
  const world = Number(params.world);
  const theme = WORLD_THEMES[world];
  const stages = getWorldStages(world);
  const [progress, setProgress] = useState<Progress | null>(null);
  const { user } = useAuth();
  const isDev = user?.email === DEV_EMAIL;

  useEffect(() => {
    setProgress(loadProgress());
    return subscribeToProgress(() => setProgress(loadProgress()));
  }, []);

  if (!theme || !stages.length) {
    return <div className="min-h-screen bg-app flex items-center justify-center text-muted">World not found</div>;
  }

  const diffLabel = DIFFICULTY[world - 1];
  const diffColor = DIFF_COLOR[world - 1];

  return (
    <motion.div className="min-h-screen" style={{ background: theme.introBg }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <WorldAtmosphere world={world} />

      {/* Navbar blend overlay */}
      <div className="fixed top-0 left-0 right-0 h-24 pointer-events-none" style={{ zIndex: 39,
        background: `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)` }} />

      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative" style={{ zIndex: 1 }}>

        {/* Back link */}
        <Link href="/adventure" className="link-back mb-8 inline-flex"
          style={{ color: theme.primary, borderColor: `${theme.primary}40` }}>
          <ArrowLeft className="w-4 h-4" /> World Map
        </Link>

        {/* World header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: `${theme.primary}18`,
              border: `2px solid ${theme.primary}40`,
              color: theme.primary,
            }}
          >
            World {world}
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-2 uppercase leading-tight">
            {theme.name}
          </h1>
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {theme.subtitle}
          </p>

          {/* World progress bar */}
          {progress && (() => {
            const done = stages.filter(s => isStageComplete(s, progress)).length;
            const pct = stages.length > 0 ? (done / stages.length) * 100 : 0;
            return (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full"
                    style={{ background: theme.primary }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: theme.primary }}>
                  {done}/{stages.length}
                </span>
              </div>
            );
          })()}
        </motion.div>

        {/* Stage list */}
        <div className="space-y-3">
          {stages.map((stage, si) => {
            const complete = progress ? isStageComplete(stage, progress) : false;
            const unlocked = isDev || (progress ? isStageUnlocked(stage, progress) : si === 0);
            const isBoss = stage.type === 'boss';
            const boss = isBoss ? getBoss(stage.bossId!) : null;
            const bossConfig = boss ? BOSS_GAME_CONFIGS[boss.id] : null;
            const tier = boss ? TIER_CONFIG[boss.tier] : null;
            const href = isBoss
              ? `/boss/${stage.bossId}`
              : `/exercise/${stage.slug}?stageId=${stage.id}&preset=${stage.reps}`;
            const isTimed = stage.slug ? TIMED.has(stage.slug) : false;
            const xpReward = isBoss ? boss!.rewards.xp : Math.round(stage.reps * 3);
            const coinReward = isBoss ? boss!.rewards.coins : Math.round(stage.reps * 1.5);

            // ── Boss stage ──────────────────────────────────────────────
            if (isBoss && boss) {
              const accentColor = complete ? '#22c55e' : tier!.color;
              const card = (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: si * 0.07 }}
                  className="relative overflow-hidden p-6"
                  style={{
                    background: complete
                      ? 'rgba(20,40,20,0.85)'
                      : unlocked
                      ? 'rgba(10,5,20,0.88)'
                      : 'rgba(5,3,10,0.75)',
                    border: `3px solid ${complete ? '#22c55e60' : unlocked ? `${tier!.color}60` : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: unlocked
                      ? `4px 4px 0 ${complete ? '#22c55e' : tier!.color}`
                      : 'none',
                    opacity: unlocked ? 1 : 0.45,
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase"
                        style={{ background: tier!.color, border: '2px solid rgba(0,0,0,0.3)' }}
                      >
                        World Boss
                      </div>
                      <span className="text-xs font-bold uppercase" style={{ color: tier!.color }}>
                        {tier!.label}
                      </span>
                    </div>
                    {complete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    {!unlocked && <Lock className="w-5 h-5 text-white/25" />}
                  </div>

                  {/* Boss content */}
                  <div className="flex items-center gap-5">
                    {bossConfig && (
                      <img src={bossConfig.image} alt={boss.name}
                        className="w-24 h-24 object-contain shrink-0 boss-float"
                        style={{ filter: `drop-shadow(0 0 16px ${tier!.color}88)` }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-2xl font-bold text-white mb-1 uppercase">
                        {boss.name}
                      </h3>
                      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {boss.flavour}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: <Clock className="w-3.5 h-3.5" />,           label: fmt(boss.timeLimitSeconds) },
                          { icon: <Star  className="w-3.5 h-3.5" />,           label: `${boss.rounds.length} rounds` },
                          { icon: <Zap   className="w-3.5 h-3.5 text-yellow-400" />, label: `+${xpReward} XP` },
                          { icon: <Coins className="w-3.5 h-3.5 text-amber-400" />, label: `+${coinReward} coins` },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-semibold"
                            style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {item.icon} {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 flex items-center justify-between"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider"
                      style={{
                        background: `${diffColor}18`,
                        border: `2px solid ${diffColor}40`,
                        color: diffColor,
                      }}
                    >
                      {diffLabel} · Boss
                    </span>
                    {unlocked && !complete && (
                      <div className="flex items-center gap-2 text-xs font-bold" style={{ color: tier!.color }}>
                        <Swords className="w-3.5 h-3.5" /> Challenge
                      </div>
                    )}
                    {complete && (
                      <span className="text-xs font-bold text-green-400">✓ Defeated</span>
                    )}
                  </div>
                </motion.div>
              );

              return (
                <div key={stage.id}>
                  {/* Boss separator */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${tier!.color}50)` }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-3 py-1"
                      style={{
                        border: `2px solid ${tier!.color}50`,
                        color: `${tier!.color}90`,
                      }}
                    >
                      Final Challenge
                    </span>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, transparent, ${tier!.color}50)` }} />
                  </div>
                  {unlocked ? <Link href={href} className="block no-underline">{card}</Link> : card}
                </div>
              );
            }

            // ── Exercise stage card ──────────────────────────────────────
            const accentColor = complete ? '#22c55e' : unlocked ? theme.primary : 'rgba(255,255,255,0.15)';
            const card = (
              <motion.div
                className="flex items-center gap-4 p-4 sm:p-5"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, delay: si * 0.055 }}
                style={{
                  background: complete
                    ? 'rgba(20,45,20,0.82)'
                    : unlocked
                    ? 'rgba(8,5,18,0.82)'
                    : 'rgba(5,3,10,0.6)',
                  border: `2px solid ${complete ? '#22c55e40' : unlocked ? `${theme.primary}35` : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: unlocked
                    ? `3px 3px 0 ${complete ? '#22c55e' : theme.primary}`
                    : 'none',
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                {/* Stage number / status */}
                <div
                  className="w-11 h-11 flex items-center justify-center shrink-0"
                  style={{
                    background: complete
                      ? 'rgba(34,197,94,0.15)'
                      : unlocked
                      ? `${theme.primary}15`
                      : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${complete ? '#22c55e50' : unlocked ? `${theme.primary}40` : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {complete
                    ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                    : !unlocked
                    ? <Lock className="w-4 h-4 text-white/25" />
                    : <span className="font-display text-base font-bold" style={{ color: theme.primary }}>{si + 1}</span>
                  }
                </div>

                {/* Stage info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm mb-1">{stage.name}</div>
                  <div className="text-xs mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {EXERCISE_LABELS[stage.slug ?? ''] ?? stage.slug}
                    {' · '}
                    <span className="font-semibold">
                      {isTimed ? `${stage.reps}s hold` : `${stage.reps} reps`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5"
                      style={{
                        background: `${diffColor}18`,
                        border: `1.5px solid ${diffColor}40`,
                        color: diffColor,
                      }}
                    >
                      {diffLabel}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-yellow-400/70" />
                      <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        +{xpReward}
                      </span>
                      <Coins className="w-3 h-3 text-amber-400/70" />
                      <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        +{coinReward}
                      </span>
                    </div>
                  </div>
                </div>

                {unlocked && !complete && (
                  <ChevronRight className="w-5 h-5 shrink-0" style={{ color: `${theme.primary}80` }} />
                )}
              </motion.div>
            );

            return (
              <div key={stage.id}>
                {unlocked ? <Link href={href} className="block no-underline">{card}</Link> : card}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
