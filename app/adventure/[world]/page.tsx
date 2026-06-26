'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle2, ChevronRight, Clock, Zap, Coins, Star } from 'lucide-react';
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
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative" style={{ zIndex: 1 }}>

        <Link href="/adventure" className="link-back mb-8"
          style={{ color: theme.primary }}>
          <ArrowLeft className="w-4 h-4" /> World Map
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
            style={{ background: `${theme.primary}18`, border: `1px solid ${theme.primary}35`, color: theme.primary }}>
            World {world}
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-2">{theme.name}</h1>          <p style={{ color: 'rgba(255,255,255,0.45)' }}>{theme.subtitle}</p>
        </motion.div>

        {/* Stage list */}
        <div className="space-y-4">
          {stages.map((stage, si) => {
            const complete = progress ? isStageComplete(stage, progress) : false;
            const unlocked = isDev || (progress ? isStageUnlocked(stage, progress) : si === 0);
            const isBoss = stage.type === 'boss';
            const boss = isBoss ? getBoss(stage.bossId!) : null;
            const bossConfig = boss ? BOSS_GAME_CONFIGS[boss.id] : null;
            const tier = boss ? TIER_CONFIG[boss.tier] : null;
            const accent = complete ? '#22c55e' : unlocked ? (isBoss ? (tier?.color ?? theme.primary) : theme.primary) : 'rgba(255,255,255,0.18)';
            const href = isBoss ? `/boss/${stage.bossId}` : `/exercise/${stage.slug}?stageId=${stage.id}&preset=${stage.reps}`;
            const isTimed = stage.slug ? TIMED.has(stage.slug) : false;
            const xpReward = isBoss ? boss!.rewards.xp : Math.round(stage.reps * 3);
            const coinReward = isBoss ? boss!.rewards.coins : Math.round(stage.reps * 1.5);

            if (isBoss && boss) {
              const card = (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: si * 0.07 }}
                  className="relative overflow-hidden rounded-3xl p-6"
                  style={{
                    background: complete
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(0,0,0,0.55) 100%)'
                      : unlocked
                      ? `linear-gradient(135deg, ${tier!.color}14 0%, rgba(0,0,0,0.6) 100%)`
                      : 'rgba(0,0,0,0.35)',
                    border: `2px solid ${complete ? '#22c55e40' : unlocked ? `${tier!.color}44` : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: unlocked && !complete ? `0 0 48px ${tier!.color}18` : undefined,
                    opacity: unlocked ? 1 : 0.45,
                  }}>
                  {/* Badge row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-white"
                        style={{ background: tier!.color }}>WORLD BOSS</span>
                      <span className="text-xs font-bold" style={{ color: tier!.color }}>{tier!.label}</span>
                    </div>
                    {complete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    {!unlocked && <Lock className="w-5 h-5 text-white/25" />}
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-6">
                    {bossConfig && (
                      <img src={bossConfig.image} alt={boss.name}
                        className="w-28 h-28 object-contain shrink-0 boss-float"
                        style={{ filter: `drop-shadow(0 0 20px ${tier!.color}99)` }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-2xl font-bold text-white mb-2">{boss.name}</h3>
                      <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{boss.flavour}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: <Clock className="w-3.5 h-3.5" />, label: fmt(boss.timeLimitSeconds) },
                          { icon: <Star className="w-3.5 h-3.5" />, label: `${boss.rounds.length} rounds` },
                          { icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />, label: `+${xpReward} XP` },
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

                  {/* Difficulty */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between"
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${diffColor}15`, color: diffColor }}>{diffLabel} · Boss</span>
                    {unlocked && !complete && (
                      <span className="text-xs font-bold" style={{ color: tier!.color }}>Challenge →</span>
                    )}
                    {complete && <span className="text-xs font-bold text-green-400">Defeated</span>}
                  </div>
                </motion.div>
              );
              return (
                <div key={stage.id}>
                  {/* Boss separator */}
                  <div className="flex items-center gap-3 my-6">
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${tier!.color}40)` }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${tier!.color}80` }}>Final Challenge</span>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, transparent, ${tier!.color}40)` }} />
                  </div>
                  {unlocked ? <Link href={href} className="block no-underline">{card}</Link> : card}
                </div>
              );
            }

            // Exercise stage card
            const card = (
              <motion.div className="flex items-center gap-6 p-6 rounded-2xl"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: si * 0.06 }}
                style={{
                  background: complete ? 'rgba(34,197,94,0.07)' : unlocked ? `${theme.primary}09` : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${complete ? '#22c55e28' : unlocked ? `${theme.primary}28` : 'rgba(255,255,255,0.05)'}`,
                  opacity: unlocked ? 1 : 0.4,
                }}>
                {/* Index / status icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: complete ? 'rgba(34,197,94,0.12)' : unlocked ? `${theme.primary}12` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${complete ? '#22c55e35' : unlocked ? `${theme.primary}35` : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {complete
                    ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                    : !unlocked
                    ? <Lock className="w-4 h-4 text-white/25" />
                    : <span className="font-display text-lg font-bold" style={{ color: theme.primary }}>{si + 1}</span>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm mb-2">{stage.name}</div>
                  <div className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {EXERCISE_LABELS[stage.slug ?? ''] ?? stage.slug} · {isTimed ? `${stage.reps}s hold` : `${stage.reps} reps`}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${diffColor}14`, color: diffColor }}>{diffLabel}</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      +{xpReward} XP · +{coinReward} coins
                    </span>
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
