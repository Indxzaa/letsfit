'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Swords, Trophy, Plus, Minus, Play, Pause, ChevronRight } from 'lucide-react';
import { loadProgress, recordBossDefeat, subscribeToProgress, type Progress } from '@/lib/progress';
import { getBoss, TIER_CONFIG } from '@/lib/bosses';
import { checkAchievements } from '@/lib/achievements';
import { getExercise } from '@/lib/exercises';
import { AchievementToastLayer } from '@/components/AchievementToast';
import Navbar from '@/components/Navbar';

type Phase = 'intro' | 'battle' | 'victory' | 'defeat';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function BossPage() {
  const params = useParams();
  const bossId = params.id as string;
  const boss = getBoss(bossId);

  const [progress, setProgress] = useState<Progress | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [roundIndex, setRoundIndex] = useState(0);
  const [reps, setReps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundSeconds, setRoundSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [achievementToasts, setAchievementToasts] = useState<string[]>([]);
  const [bossResult, setBossResult] = useState<{ xp: number; coins: number; leveledUp: boolean } | null>(null);
  const [alreadyDefeated, setAlreadyDefeated] = useState(false);

  const overallTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  const stopTimers = useCallback(() => {
    if (overallTimer.current) { clearInterval(overallTimer.current); overallTimer.current = null; }
    if (roundTimer.current)   { clearInterval(roundTimer.current);   roundTimer.current = null; }
  }, []);

  const handleDefeat = useCallback(() => {
    stopTimers();
    setPhase('defeat');
  }, [stopTimers]);

  const advanceRound = useCallback((nextIndex: number) => {
    if (!boss) return;
    if (nextIndex >= boss.rounds.length) {
      stopTimers();
      const current = loadProgress();
      if (current.bossesDefeated?.includes(boss.id)) {
        setAlreadyDefeated(true);
        setBossResult({ xp: 0, coins: 0, leveledUp: false });
      } else {
        const result = recordBossDefeat(current, boss.id, boss.rewards.xp, boss.rewards.coins, checkAchievements);
        setBossResult({ xp: result.xpGained, coins: result.coinsGained, leveledUp: result.leveledUp });
        if (result.newAchievements.length > 0) setAchievementToasts(result.newAchievements);
        setProgress(result.after);
      }
      setPhase('victory');
      return;
    }
    setRoundIndex(nextIndex);
    setReps(0);
    const round = boss.rounds[nextIndex];
    if (round.isTimed) {
      setRoundSeconds(0);
      if (roundTimer.current) clearInterval(roundTimer.current);
      roundTimer.current = setInterval(() => {
        setRoundSeconds((s) => {
          const next = s + 1;
          if (next >= round.reps) {
            if (roundTimer.current) clearInterval(roundTimer.current);
            advanceRound(nextIndex + 1);
          }
          return next;
        });
      }, 1000);
    }
  }, [boss, stopTimers]);

  const startBattle = useCallback(() => {
    if (!boss) return;
    setPhase('battle');
    setRoundIndex(0);
    setReps(0);
    setRoundSeconds(0);
    setTimeLeft(boss.timeLimitSeconds);

    overallTimer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleDefeat(); return 0; }
        return t - 1;
      });
    }, 1000);

    const first = boss.rounds[0];
    if (first.isTimed) {
      roundTimer.current = setInterval(() => {
        setRoundSeconds((s) => {
          const next = s + 1;
          if (next >= first.reps) {
            if (roundTimer.current) clearInterval(roundTimer.current);
            advanceRound(1);
          }
          return next;
        });
      }, 1000);
    }
  }, [boss, handleDefeat, advanceRound]);

  useEffect(() => () => stopTimers(), [stopTimers]);

  if (!boss || !progress) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-muted text-sm">{!boss ? 'Boss not found.' : 'Loading...'}</div>
      </div>
    );
  }

  const tier = TIER_CONFIG[boss.tier];
  const round = boss.rounds[roundIndex];
  const ex = getExercise(round?.slug ?? '');
  const isTimed = round?.isTimed;
  const current = isTimed ? roundSeconds : reps;
  const target = round?.reps ?? 0;
  const pct = Math.min(100, (current / target) * 100);
  const timeWarning = timeLeft <= 60 && phase === 'battle';
  const isUnlocked = boss.isUnlocked(progress);
  const wasDefeated = progress.bossesDefeated?.includes(boss.id);

  const handleRep = () => {
    setReps((r) => {
      const next = r + 1;
      if (next >= target) advanceRound(roundIndex + 1);
      return next;
    });
  };

  const togglePause = () => {
    if (!isTimed) return;
    setPaused((p) => {
      if (!p) {
        if (roundTimer.current) { clearInterval(roundTimer.current); roundTimer.current = null; }
        if (overallTimer.current) { clearInterval(overallTimer.current); overallTimer.current = null; }
      } else {
        overallTimer.current = setInterval(() => setTimeLeft((t) => { if (t <= 1) { handleDefeat(); return 0; } return t - 1; }), 1000);
        roundTimer.current = setInterval(() => {
          setRoundSeconds((s) => {
            const next = s + 1;
            if (next >= target) { if (roundTimer.current) clearInterval(roundTimer.current); advanceRound(roundIndex + 1); }
            return next;
          });
        }, 1000);
      }
      return !p;
    });
  };

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link href="/exercise" className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Back to exercises
        </Link>

        {/* INTRO */}
        {phase === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="p-8 rounded-3xl mb-6" style={{ background: tier.bg, border: `1px solid ${tier.color}44` }}>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 inline-block"
                    style={{ background: `${tier.color}22`, color: tier.color }}>
                    {tier.label} Boss · World {boss.world}
                  </span>
                  <h1 className="font-display text-5xl font-bold text-app">{boss.name}</h1>
                  <p className="text-muted mt-2">{boss.flavour}</p>
                </div>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shrink-0"
                  style={{ background: `${tier.color}22`, border: `1px solid ${tier.color}44` }}>
                  <Swords className="w-9 h-9" style={{ color: tier.color }} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-subtle mb-1">Rounds</div>
                  <div className="font-display text-2xl font-bold text-app">{boss.rounds.length}</div>
                </div>
                <div className="p-3 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-subtle mb-1">Time limit</div>
                  <div className="font-display text-2xl font-bold text-app">{formatTime(boss.timeLimitSeconds)}</div>
                </div>
                <div className="p-3 rounded-2xl sm:col-span-1 col-span-2" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-subtle mb-1">Rewards</div>
                  <div className="font-display text-2xl font-bold text-app">+{boss.rewards.xp}XP · +{boss.rewards.coins}🪙</div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {boss.rounds.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: tier.color }}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-app flex-1">{r.label}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: tier.color }}>
                      {r.isTimed ? `${r.reps}s` : `${r.reps} reps`}
                    </span>
                  </div>
                ))}
              </div>

              {wasDefeated && (
                <div className="text-xs font-bold mb-4 px-3 py-2 rounded-xl" style={{ background: `${tier.color}15`, color: tier.color }}>
                  ✓ Already defeated — rewards won&apos;t stack, but you can still practice.
                </div>
              )}

              {isUnlocked ? (
                <button
                  onClick={startBattle}
                  className="w-full py-4 rounded-2xl font-display text-xl font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: tier.color, boxShadow: `0 8px 24px ${tier.color}55` }}
                >
                  Start Battle
                </button>
              ) : (
                <div className="w-full py-4 rounded-2xl text-center font-semibold text-subtle"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  🔒 {boss.unlockLabel}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* BATTLE */}
        {phase === 'battle' && round && (
          <div>
            {/* Timer bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: timeWarning ? '#ef4444' : 'var(--text-muted)' }} />
                <span className={`font-display text-3xl font-bold tabular-nums ${timeWarning ? 'text-red-500' : 'text-app'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-sm font-semibold text-muted">
                Round <span className="text-app font-bold">{roundIndex + 1}</span> / {boss.rounds.length}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-6" style={{ background: 'var(--border)' }}>
              <motion.div
                animate={{ width: `${(timeLeft / boss.timeLimitSeconds) * 100}%` }}
                className="h-full rounded-full"
                style={{ background: timeWarning ? '#ef4444' : tier.color }}
              />
            </div>

            <div className="p-8 rounded-3xl text-center" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: tier.color }}>
                {isTimed ? 'Hold for' : 'Complete'}
              </div>
              <div className="font-display text-2xl font-bold text-app mb-2">{round.label}</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ scale: 1.15, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-8xl font-bold tabular-nums mb-2"
                  style={{ color: tier.color }}
                >
                  {isTimed ? formatTime(current) : current}
                </motion.div>
              </AnimatePresence>
              <div className="text-muted mb-6">
                Target: {isTimed ? `${formatTime(target)}` : `${target} reps`}
              </div>

              <div className="h-3 rounded-full overflow-hidden mb-8" style={{ background: 'var(--border)' }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: tier.color }}
                />
              </div>

              {isTimed ? (
                <button
                  onClick={togglePause}
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white mx-auto"
                  style={{ background: tier.color, boxShadow: `0 8px 24px ${tier.color}55` }}
                >
                  {paused ? <Play className="w-10 h-10" fill="currentColor" /> : <Pause className="w-10 h-10" fill="currentColor" />}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setReps((r) => Math.max(0, r - 1))}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-app"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <Minus className="w-5 h-5" />
                  </button>
                  <button onClick={handleRep}
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white transition-transform active:scale-95"
                    style={{ background: tier.color, boxShadow: `0 8px 24px ${tier.color}55` }}>
                    <Plus className="w-10 h-10" strokeWidth={2.5} />
                  </button>
                  <div className="w-14 h-14" />
                </div>
              )}

              {!isTimed && (
                <p className="text-xs text-subtle mt-6">Tap + for each completed rep</p>
              )}
            </div>

            {/* Round progress */}
            <div className="flex gap-2 mt-4 justify-center">
              {boss.rounds.map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full max-w-16"
                  style={{ background: i < roundIndex ? tier.color : i === roundIndex ? `${tier.color}88` : 'var(--border)' }} />
              ))}
            </div>
          </div>
        )}

        {/* VICTORY */}
        {phase === 'victory' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="text-center py-8">
            <div className="text-7xl mb-4">{alreadyDefeated ? '💪' : '🏆'}</div>
            <h2 className="font-display text-5xl font-bold text-app mb-2">
              {alreadyDefeated ? 'Still a champ.' : 'Boss defeated!'}
            </h2>
            <p className="text-muted mb-8">{alreadyDefeated ? 'Great practice run.' : boss.flavour}</p>
            {bossResult && !alreadyDefeated && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="p-4 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-subtle mb-1">XP Earned</div>
                  <div className="font-display text-3xl font-bold" style={{ color: tier.color }}>+{bossResult.xp}</div>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-subtle mb-1">FitCoins</div>
                  <div className="font-display text-3xl font-bold" style={{ color: tier.color }}>+{bossResult.coins}</div>
                </div>
                {bossResult.leveledUp && (
                  <div className="p-4 rounded-2xl" style={{ background: tier.bg, border: `1px solid ${tier.color}44` }}>
                    <div className="text-xs font-bold mb-1" style={{ color: tier.color }}>LEVEL UP!</div>
                    <div className="font-display text-3xl font-bold" style={{ color: tier.color }}>⬆</div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setPhase('intro'); setRoundIndex(0); setReps(0); setRoundSeconds(0); setBossResult(null); }}
                className="px-6 py-3 rounded-2xl font-semibold text-white"
                style={{ background: tier.color }}>
                Play again
              </button>
              <Link href="/exercise" className="px-6 py-3 rounded-2xl font-semibold text-app"
                style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                Back to exercises
              </Link>
            </div>
          </motion.div>
        )}

        {/* DEFEAT */}
        {phase === 'defeat' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="text-center py-8">
            <div className="text-7xl mb-4">⏱️</div>
            <h2 className="font-display text-5xl font-bold text-app mb-2">Time&apos;s up.</h2>
            <p className="text-muted mb-8">You completed {roundIndex}/{boss.rounds.length} rounds. Train more and try again.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { stopTimers(); setPhase('intro'); setRoundIndex(0); setReps(0); setRoundSeconds(0); setTimeLeft(0); }}
                className="px-6 py-3 rounded-2xl font-semibold text-white"
                style={{ background: tier.color }}>
                Try again
              </button>
              <Link href="/exercise" className="px-6 py-3 rounded-2xl font-semibold text-app"
                style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                Back
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <AchievementToastLayer achievementIds={achievementToasts} onDismiss={(id) => setAchievementToasts((p) => p.filter((a) => a !== id))} />
    </div>
  );
}
