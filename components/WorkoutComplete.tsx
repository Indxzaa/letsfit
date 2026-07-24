'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Zap, Coins, RotateCcw, ArrowRight, Star, Flame } from 'lucide-react';
import type { SessionResult } from '@/lib/progress';
import { getAchievement, getQuest } from '@/lib/achievements';

// ── Confetti burst ────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#22c55e','#facc15','#3b82f6','#a855f7','#ef4444','#f97316','#ffffff'];

// Fixed particle data — seeded so no hydration mismatch
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * 2 * Math.PI + (i % 3) * 0.4;
  const dist  = 120 + (i % 5) * 40;
  return {
    id: i,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist - 60,
    rotate: (i * 47) % 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + (i % 3) * 4,
    delay: (i % 5) * 0.06,
    isCircle: i % 3 === 0,
  };
});

function ConfettiBurst() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 200 }}>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4, rotate: p.rotate }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isCircle ? '50%' : 0,
          }}
        />
      ))}
    </div>
  );
}

type Props = {
  result: SessionResult;
  reps: number;
  durationSeconds: number;
  exerciseName: string;
  accuracy?: number | null;
  onRestart: () => void;
  backHref?: string;
};

export default function WorkoutComplete({
  result, reps, durationSeconds, exerciseName, accuracy, onRestart, backHref = '/dashboard',
}: Props) {
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const durationLabel = mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`;
  const accuracyColor = accuracy == null ? 'var(--text-muted)'
    : accuracy >= 80 ? 'var(--neo-accent)'
    : accuracy >= 50 ? '#d97706'
    : '#dc2626';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <ConfettiBurst />

      {/* ── Hero header ── */}
      <div className="neo-card p-8 mb-4 text-center" style={{ background: 'var(--neo-accent)', borderRadius: 0 }}>
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.08 }}
          className="w-20 h-20 mx-auto mb-5 flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.5)',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
          }}
        >
          <Trophy className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="font-display text-4xl sm:text-5xl font-bold text-white uppercase leading-tight mb-2"
        >
          Workout Complete!
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}
          className="text-white/75 text-sm font-semibold"
        >
          {exerciseName} · {durationLabel}
        </motion.p>
      </div>

      {/* ── XP + Coins reward row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="grid grid-cols-2 gap-4 mb-4"
      >
        {/* XP */}
        <div className="neo-card p-5 text-center" style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}>
          <div
            className="w-10 h-10 mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'var(--neo-accent)', border: '2px solid var(--neo-black)', boxShadow: '2px 2px 0 var(--neo-black)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            className="font-display text-4xl font-bold tabular-nums text-app"
          >
            +{result.xpGained}
          </motion.div>
          <div className="text-xs font-bold uppercase tracking-widest text-subtle mt-1">XP Earned</div>
          {result.leveledUp && (
            <div
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider text-white"
              style={{ background: 'var(--neo-accent)', border: '2px solid var(--neo-black)', boxShadow: '2px 2px 0 var(--neo-black)' }}
            >
              <Star className="w-3 h-3" fill="currentColor" /> Level Up!
            </div>
          )}
        </div>

        {/* Coins */}
        <div className="neo-card p-5 text-center" style={{ background: 'var(--card-bg-amber)', borderRadius: 0 }}>
          <div
            className="w-10 h-10 mx-auto mb-3 flex items-center justify-center"
            style={{ background: '#d97706', border: '2px solid var(--neo-black)', boxShadow: '2px 2px 0 var(--neo-black)' }}
          >
            <Coins className="w-5 h-5 text-white" />
          </div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
            className="font-display text-4xl font-bold tabular-nums"
            style={{ color: '#92400e' }}
          >
            +{result.coinsGained}
          </motion.div>
          <div className="text-xs font-bold uppercase tracking-widest text-subtle mt-1">FitCoins</div>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4"
      >
        {[
          { label: 'Reps',     value: reps.toString() },
          { label: 'Duration', value: durationLabel },
          { label: 'Calories', value: String(result.caloriesBurned) },
          { label: 'Streak',   value: `${result.after.currentStreak}d` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="neo-card p-4 text-center"
            style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-1">{label}</div>
            <div className="font-display text-2xl font-bold text-app tabular-nums">{value}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Accuracy ── */}
      {accuracy != null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="neo-card p-5 mb-4 flex items-center gap-5"
          style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
        >
          <AccuracyRing score={accuracy} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-1">Pose Accuracy</div>
            <div className="font-display text-3xl font-bold tabular-nums" style={{ color: accuracyColor }}>
              {accuracy}%
            </div>
            <div className="text-xs text-muted mt-1 font-semibold">
              {accuracy >= 80 ? 'Excellent form' : accuracy >= 60 ? 'Good form' : 'Keep practicing'}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Form Accuracy Warning ── */}
      {result.formAccuracyTooLow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="neo-card p-5 mb-4"
          style={{ background: '#fef2f2', borderRadius: 0, borderColor: '#ef4444' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
              style={{ background: '#ef4444', border: '2px solid var(--neo-black)', boxShadow: '2px 2px 0 var(--neo-black)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-black uppercase tracking-wider text-red-700 mb-1">
                Form Accuracy Too Low
              </div>
              <div className="text-sm text-red-900 leading-relaxed">
                Your average form accuracy was <strong>{result.averageFormAccuracy}%</strong>, which is below the required <strong>60%</strong> threshold.
                No XP or FitCoins were awarded for this session. Focus on maintaining proper posture throughout the entire exercise to earn rewards.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Streak bonus ── */}
      {result.streakBonus && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          className="neo-card p-4 mb-4"
          style={{ background: 'var(--card-bg-green)', borderRadius: 0, borderColor: 'var(--neo-accent)' }}
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2"
            style={{ color: 'var(--neo-accent)' }}>
            <Flame className="w-3.5 h-3.5" /> {result.streakBonus.day}-day streak bonus!
          </div>
          <div className="font-display text-lg font-bold text-app">
            +{result.streakBonus.xp} XP · +{result.streakBonus.coins} FitCoins
          </div>
        </motion.div>
      )}

      {/* ── Quests + Achievements ── */}
      {(result.completedQuests.length > 0 || result.newAchievements.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          className="neo-card p-5 mb-4 space-y-4"
          style={{ background: 'var(--neo-surface)', borderRadius: 0 }}
        >
          {result.completedQuests.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: 'var(--neo-accent)' }}>
                Quest{result.completedQuests.length > 1 ? 's' : ''} Completed
              </div>
              {result.completedQuests.map((id) => {
                const q = getQuest(id);
                if (!q) return null;
                return (
                  <div key={id} className="flex items-center gap-3 text-sm text-app py-1">
                    <span className="text-lg">{q.icon}</span>
                    <span className="flex-1 font-semibold">{q.name}</span>
                    <span className="text-xs font-bold text-subtle">+{q.reward.xp} XP · +{q.reward.coins}c</span>
                  </div>
                );
              })}
            </div>
          )}
          {result.newAchievements.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: 'var(--neo-accent)' }}>
                Achievement{result.newAchievements.length > 1 ? 's' : ''} Unlocked
              </div>
              {result.newAchievements.map((id) => {
                const a = getAchievement(id);
                if (!a) return null;
                return (
                  <div key={id} className="flex items-center gap-3 text-sm text-app py-1">
                    <span className="text-lg">{a.icon}</span>
                    <span className="font-semibold">{a.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}
        className="flex flex-col sm:flex-row gap-3 mt-6"
      >
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
          style={{
            background: 'var(--neo-white)',
            border: 'var(--neo-border)',
            boxShadow: 'var(--neo-shadow)',
            color: 'var(--neo-black)',
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--neo-shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'translate(2px,2px)'; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--neo-shadow)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
        >
          <RotateCcw className="w-4 h-4" /> Again
        </button>
        <Link
          href={backHref}
          className="flex-1 py-3.5 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
          style={{
            background: 'var(--neo-accent)',
            border: 'var(--neo-border)',
            boxShadow: 'var(--neo-shadow)',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          {backHref?.includes('/adventure') ? 'Continue Adventure' : 'Back to Dashboard'}
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
  const color = fill >= 80 ? 'var(--neo-accent)' : fill >= 50 ? '#d97706' : '#dc2626';
  return (
    <svg width="68" height="68" style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle
        cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${(fill / 100) * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
      />
    </svg>
  );
}
