'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Lock, CheckCircle2, Clock, Zap, Coins, Star, Swords, Shield,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { WORLD_THEMES } from '@/lib/worlds';
import { getWorldStages, isStageComplete, isStageUnlocked } from '@/lib/stages';
import { getBoss, BOSS_GAME_CONFIGS, TIER_CONFIG } from '@/lib/bosses';
import { loadProgress, subscribeToProgress, type Progress } from '@/lib/progress';
import { useAuth } from '@/components/AuthProvider';

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
const DIFF_BG    = ['rgba(34,197,94,0.12)', 'rgba(96,165,250,0.12)', 'rgba(168,85,247,0.12)', 'rgba(245,158,11,0.12)'];

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ── Boss Card ─────────────────────────────────────────────────────────────────

function BossCard({
  boss, bossConfig, tier, complete, unlocked,
  xpReward, coinReward, diffLabel, diffColor, diffBg, href, si,
}: {
  boss: NonNullable<ReturnType<typeof getBoss>>;
  bossConfig: typeof BOSS_GAME_CONFIGS[string] | null;
  tier: NonNullable<typeof TIER_CONFIG[string]>;
  complete: boolean; unlocked: boolean;
  xpReward: number; coinReward: number;
  diffLabel: string; diffColor: string; diffBg: string;
  href: string; si: number;
}) {
  const borderColor = complete ? '#22c55e' : unlocked ? tier.color : 'rgba(255,255,255,0.12)';
  const shadowColor = complete ? '#22c55e' : tier.color;

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: si * 0.07 }}
      className="relative overflow-hidden"
      style={{
        border: `4px solid ${borderColor}`,
        boxShadow: unlocked ? `6px 6px 0 ${shadowColor}` : 'none',
        opacity: unlocked ? 1 : 0.4,
        background: complete
          ? 'linear-gradient(180deg, rgba(10,30,15,0.97) 0%, rgba(5,18,8,0.99) 100%)'
          : 'linear-gradient(180deg, rgba(12,8,24,0.97) 0%, rgba(6,4,14,0.99) 100%)',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
    >
      {/* Tier-color top accent strip */}
      <div style={{ height: 6, background: complete ? '#22c55e' : tier.color }} />

      {/* Boss artwork — full-width hero zone */}
      <div
        className="relative flex items-end justify-center pt-8 pb-4"
        style={{
          background: complete
            ? `radial-gradient(ellipse at 50% 30%, rgba(34,197,94,0.18) 0%, transparent 70%)`
            : `radial-gradient(ellipse at 50% 30%, ${tier.color}28 0%, transparent 70%)`,
          minHeight: 220,
        }}
      >
        {/* Glow ring behind artwork */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 220, height: 220,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: complete
              ? 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 70%)'
              : `radial-gradient(circle, ${tier.color}20 0%, transparent 70%)`,
            filter: 'blur(12px)',
          }}
        />

        {bossConfig ? (
          <img
            src={bossConfig.image}
            alt={boss.name}
            className="boss-float relative z-10"
            style={{
              width: 180, height: 180,
              objectFit: 'contain',
              filter: `drop-shadow(0 0 32px ${complete ? '#22c55e' : tier.color}cc)
                       drop-shadow(0 8px 24px rgba(0,0,0,0.8))`,
            }}
          />
        ) : (
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              width: 160, height: 160,
              background: `${tier.color}18`,
              border: `3px solid ${tier.color}50`,
            }}
          >
            <Swords style={{ width: 64, height: 64, color: tier.color }} />
          </div>
        )}

        {/* Completion overlay badge */}
        {complete && (
          <div
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 z-20"
            style={{
              background: '#22c55e',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              color: '#fff',
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">Defeated</span>
          </div>
        )}
        {!unlocked && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <div style={{ border: '3px solid rgba(255,255,255,0.15)', padding: 16 }}>
              <Lock className="w-10 h-10 text-white/30" />
            </div>
          </div>
        )}
      </div>

      {/* Boss info block */}
      <div className="p-6">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="text-[10px] font-black tracking-widest text-white uppercase px-3 py-1"
            style={{ background: complete ? '#22c55e' : tier.color }}
          >
            World Boss
          </div>
          <div
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
            style={{
              color: tier.color,
              border: `2px solid ${tier.color}50`,
              background: `${tier.color}12`,
            }}
          >
            {tier.label}
          </div>
          <div
            className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
            style={{
              color: diffColor,
              border: `2px solid ${diffColor}50`,
              background: diffBg,
            }}
          >
            {diffLabel}
          </div>
        </div>

        {/* Boss name */}
        <h3
          className="font-display font-bold text-white uppercase leading-tight mb-3"
          style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', letterSpacing: '-0.01em' }}
        >
          {boss.name}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {boss.flavour}
        </p>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 gap-3 mb-4"
          style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: 16 }}
        >
          {[
            { icon: <Clock className="w-4 h-4" />, label: 'Time Limit', value: fmt(boss.timeLimitSeconds) },
            { icon: <Star  className="w-4 h-4" />, label: 'Rounds',     value: `${boss.rounds.length}` },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.icon}</div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {stat.label}
                </div>
                <div className="font-display text-lg font-bold text-white">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rewards row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="flex items-center gap-3 p-3"
            style={{
              background: 'rgba(253,224,71,0.08)',
              border: '2px solid rgba(253,224,71,0.25)',
            }}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-400/60">XP Reward</div>
              <div className="font-display text-lg font-bold text-yellow-300">+{xpReward}</div>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-3"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '2px solid rgba(245,158,11,0.25)',
            }}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/60">Coins</div>
              <div className="font-display text-lg font-bold text-amber-300">+{coinReward}</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        {unlocked && !complete && (
          <div
            className="w-full py-4 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest text-white"
            style={{
              background: tier.color,
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000',
              letterSpacing: '0.12em',
            }}
          >
            <Swords className="w-5 h-5" />
            Challenge Boss
          </div>
        )}
        {complete && (
          <div
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '2px solid rgba(34,197,94,0.3)',
              color: '#4ade80',
            }}
          >
            <Shield className="w-4 h-4" />
            Boss Defeated — Challenge Again
          </div>
        )}
      </div>
    </motion.div>
  );

  return unlocked ? <Link href={href} className="block no-underline group">{card}</Link> : card;
}

// ── Stage Card ────────────────────────────────────────────────────────────────

function StageCard({
  stage, si, complete, unlocked, theme, isTimed,
  xpReward, coinReward, diffLabel, diffColor, diffBg, href,
}: {
  stage: { name: string; slug?: string; reps: number };
  si: number; complete: boolean; unlocked: boolean;
  theme: { primary: string };
  isTimed: boolean; xpReward: number; coinReward: number;
  diffLabel: string; diffColor: string; diffBg: string;
  href: string;
}) {
  const borderColor = complete ? '#22c55e' : unlocked ? theme.primary : 'rgba(255,255,255,0.08)';
  const shadowColor = complete ? '#22c55e' : theme.primary;

  const card = (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: si * 0.05 }}
      className="group flex items-stretch gap-0 overflow-hidden"
      style={{
        border: `3px solid ${borderColor}`,
        boxShadow: unlocked ? `4px 4px 0 ${shadowColor}` : 'none',
        opacity: unlocked ? 1 : 0.38,
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        background: complete
          ? 'rgba(14,30,16,0.90)'
          : unlocked
          ? 'rgba(10,6,20,0.90)'
          : 'rgba(5,3,10,0.75)',
      }}
    >
      {/* Stage number column */}
      <div
        className="flex flex-col items-center justify-center px-4 shrink-0"
        style={{
          minWidth: 64,
          borderRight: `3px solid ${borderColor}`,
          background: complete
            ? 'rgba(34,197,94,0.12)'
            : unlocked
            ? `${theme.primary}12`
            : 'rgba(255,255,255,0.03)',
        }}
      >
        {complete ? (
          <CheckCircle2 className="w-7 h-7 text-green-400" />
        ) : !unlocked ? (
          <Lock className="w-5 h-5 text-white/20" />
        ) : (
          <span
            className="font-display font-black leading-none"
            style={{ fontSize: 28, color: theme.primary }}
          >
            {si + 1}
          </span>
        )}
        {complete && (
          <span className="text-[9px] font-bold uppercase mt-1" style={{ color: '#4ade80' }}>Done</span>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 sm:p-5">
        {/* Stage name */}
        <div
          className="font-display font-bold mb-1.5 uppercase leading-tight"
          style={{ fontSize: 17, color: complete ? '#4ade80' : 'rgba(255,255,255,0.95)' }}
        >
          {stage.name}
        </div>

        {/* Exercise + requirement */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {EXERCISE_LABELS[stage.slug ?? ''] ?? stage.slug}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>·</span>
          <span
            className="text-xs font-bold px-2 py-0.5"
            style={{
              background: complete ? 'rgba(34,197,94,0.12)' : `${theme.primary}15`,
              border: `1.5px solid ${complete ? '#22c55e40' : `${theme.primary}40`}`,
              color: complete ? '#4ade80' : theme.primary,
            }}
          >
            {isTimed ? `${stage.reps}s hold` : `${stage.reps} reps`}
          </span>
        </div>

        {/* Bottom row: difficulty + rewards */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5"
            style={{ background: diffBg, border: `1.5px solid ${diffColor}40`, color: diffColor }}
          >
            {diffLabel}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Zap className="w-3 h-3 text-yellow-400/80" />
            <span className="text-[11px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
              +{xpReward}
            </span>
            <Coins className="w-3 h-3 text-amber-400/80 ml-1" />
            <span className="text-[11px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
              +{coinReward}
            </span>
          </div>
        </div>
      </div>

      {/* Right indicator */}
      {unlocked && !complete && (
        <div
          className="flex items-center justify-center px-3 shrink-0"
          style={{ borderLeft: `2px solid ${theme.primary}25` }}
        >
          <div
            className="text-xs font-black uppercase tracking-wider"
            style={{
              color: theme.primary,
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              letterSpacing: '0.1em',
            }}
          >
            Start
          </div>
        </div>
      )}
    </motion.div>
  );

  return unlocked ? <Link href={href} className="block no-underline">{card}</Link> : card;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorldPage() {
  const params = useParams();
  const world = Number(params.world);
  const theme = WORLD_THEMES[world];
  const stages = getWorldStages(world);
  const [progress, setProgress] = useState<Progress | null>(null);
  const { user } = useAuth();
  const isDev = user?.email === DEV_EMAIL;
  const router = useRouter();
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    // Persist the current world so /adventure can redirect back here
    localStorage.setItem('letsfit:lastWorld', String(world));
    setProgress(loadProgress());
    return subscribeToProgress(() => setProgress(loadProgress()));
  }, [world]);

  if (!theme || !stages.length) {
    return <div className="min-h-screen bg-app flex items-center justify-center text-muted">World not found</div>;
  }

  const diffLabel = DIFFICULTY[world - 1];
  const diffColor = DIFF_COLOR[world - 1];
  const diffBg    = DIFF_BG[world - 1];

  return (
    <motion.div
      className="min-h-screen"
      style={{ background: '#0a0a0a' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
    >
      {/* Background image — fixed, fills viewport */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <img
          src={theme.bgImg}
          alt=""
          aria-hidden
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            display: 'block',
          }}
        />
        {/* Readability overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.42)' }} />
      </div>

      <div className="fixed top-0 left-0 right-0 h-24 pointer-events-none" style={{ zIndex: 39,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative" style={{ zIndex: 1 }}>

        {/* Back link */}
        <button
          onClick={() => setShowExit(true)}
          className="link-back mb-8 inline-flex cursor-pointer"
          style={{ color: theme.primary, borderColor: `${theme.primary}40` }}
        >
          <ArrowLeft className="w-4 h-4" /> World Map
        </button>

        {/* World header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest"
            style={{ background: `${theme.primary}18`, border: `2px solid ${theme.primary}40`, color: theme.primary }}
          >
            World {world}
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-2 uppercase leading-tight">
            {theme.name}
          </h1>
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {theme.subtitle}
          </p>

          {/* Progress bar */}
          {progress && (() => {
            const done = stages.filter(s => isStageComplete(s, progress)).length;
            const pct = stages.length > 0 ? (done / stages.length) * 100 : 0;
            return (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-2 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full" style={{ background: theme.primary }} />
                </div>
                <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: theme.primary }}>
                  {done}/{stages.length}
                </span>
              </div>
            );
          })()}
        </motion.div>

        {/* Stage list */}
        <div className="space-y-4">
          {stages.map((stage, si) => {
            const complete  = progress ? isStageComplete(stage, progress) : false;
            const unlocked  = isDev || (progress ? isStageUnlocked(stage, progress) : si === 0);
            const isBoss    = stage.type === 'boss';
            const boss      = isBoss ? getBoss(stage.bossId!) : null;
            const bossConfig= boss ? BOSS_GAME_CONFIGS[boss.id] : null;
            const tier      = boss ? TIER_CONFIG[boss.tier] : null;
            const href      = isBoss
              ? `/boss/${stage.bossId}`
              : `/exercise/${stage.slug}?stageId=${stage.id}&preset=${stage.reps}`;
            const isTimed   = stage.slug ? TIMED.has(stage.slug) : false;
            const xpReward  = isBoss ? boss!.rewards.xp   : Math.round(stage.reps * 3);
            const coinReward= isBoss ? boss!.rewards.coins : Math.round(stage.reps * 1.5);

            if (isBoss && boss && tier) {
              return (
                <div key={stage.id}>
                  {/* Boss separator */}
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier.color}60)` }} />
                    <div
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5"
                      style={{ border: `2px solid ${tier.color}60`, color: tier.color, background: `${tier.color}12` }}
                    >
                      ⚔ Final Challenge
                    </div>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, transparent, ${tier.color}60)` }} />
                  </div>
                  <BossCard
                    boss={boss} bossConfig={bossConfig} tier={tier}
                    complete={complete} unlocked={unlocked}
                    xpReward={xpReward} coinReward={coinReward}
                    diffLabel={diffLabel} diffColor={diffColor} diffBg={diffBg}
                    href={href} si={si}
                  />
                </div>
              );
            }

            return (
              <StageCard
                key={stage.id}
                stage={stage} si={si}
                complete={complete} unlocked={unlocked}
                theme={theme} isTimed={isTimed}
                xpReward={xpReward} coinReward={coinReward}
                diffLabel={diffLabel} diffColor={diffColor} diffBg={diffBg}
                href={href}
              />
            );
          })}
        </div>
      </div>
      {/* ── Exit confirmation dialog ── */}
      <AnimatePresence>
        {showExit && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center px-4"
            style={{ zIndex: 100, background: 'rgba(0,0,0,0.72)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm"
              style={{
                background: 'var(--neo-white, #fff)',
                border: '4px solid #000',
                boxShadow: '6px 6px 0 #000',
              }}
            >
              {/* Dialog header strip */}
              <div
                className="px-6 py-4"
                style={{ borderBottom: '3px solid #000', background: 'var(--card-bg-amber, #fef3c7)' }}
              >
                <div className="font-display text-xl font-bold text-app uppercase tracking-tight">
                  Leave Adventure?
                </div>
              </div>

              {/* Dialog body */}
              <div className="px-6 py-5">
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Your progress has already been saved.
                  <br />
                  Are you sure you want to leave this journey?
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/progress')}
                    className="w-full py-3 text-sm font-black uppercase tracking-widest text-white cursor-pointer"
                    style={{
                      background: '#000',
                      border: '3px solid #000',
                      boxShadow: '3px 3px 0 #555',
                    }}
                  >
                    Leave Adventure
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('letsfit:lastWorld');
                      router.push('/adventure');
                    }}
                    className="w-full py-3 text-sm font-bold uppercase tracking-widest cursor-pointer text-app"
                    style={{
                      background: 'transparent',
                      border: '3px solid #000',
                    }}
                  >
                    Back to World Map
                  </button>
                  <button
                    onClick={() => setShowExit(false)}
                    className="w-full py-2.5 text-sm font-semibold cursor-pointer"
                    style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
                  >
                    Stay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
