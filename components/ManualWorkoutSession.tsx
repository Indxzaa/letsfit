'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, CircleStop, Play, Pause } from 'lucide-react';
import {
  loadProgress,
  recordSession,
  type SessionResult,
} from '@/lib/progress';
import { checkAchievements, checkQuests } from '@/lib/achievements';
import { XpPopupLayer, type XpPopupItem } from '@/components/XpPopup';
import { AchievementToastLayer } from '@/components/AchievementToast';
import TargetPicker from '@/components/TargetPicker';
import WorkoutComplete from '@/components/WorkoutComplete';
import Navbar from '@/components/Navbar';
import { getExercise } from '@/lib/exercises';

type Phase = 'pick' | 'active' | 'complete';

export default function ManualWorkoutSession({ slug }: { slug: string }) {
  const exercise = getExercise(slug);
  const startTimeRef = useRef<number>(0);
  const popupIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<Phase>('pick');
  const [target, setTarget] = useState(0);
  const [reps, setReps] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [xpPopups, setXpPopups] = useState<XpPopupItem[]>([]);
  const [achievementToasts, setAchievementToasts] = useState<string[]>([]);

  const expirePopup = useCallback((id: number) => {
    setXpPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const dismissAchievement = useCallback((id: string) => {
    setAchievementToasts((prev) => prev.filter((a) => a !== id));
  }, []);

  const finishSession = useCallback(
    (finalReps: number, finalSeconds: number) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      setDuration(elapsed);

      // For timed exercises, "reps" is the seconds held
      const repsToRecord = exercise?.isTimed ? finalSeconds : finalReps;

      if (repsToRecord > 0 && exercise) {
        const before = loadProgress();
        const result = recordSession(
          before,
          repsToRecord,
          exercise.slug,
          elapsed,
          checkAchievements,
          checkQuests
        );
        setSessionResult(result);
        if (result.newAchievements.length > 0) {
          setAchievementToasts((prev) => [...prev, ...result.newAchievements]);
        }
      }
      setPhase('complete');
    },
    [exercise]
  );

  const startWorkout = (chosenTarget: number) => {
    setTarget(chosenTarget);
    setReps(0);
    setSeconds(0);
    setPaused(false);
    startTimeRef.current = Date.now();
    setPhase('active');

    if (exercise?.isTimed) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (next >= chosenTarget) {
            finishSession(0, next);
          }
          return next;
        });
      }, 1000);
    }
  };

  const togglePause = () => {
    if (!exercise?.isTimed) return;
    setPaused((p) => {
      const next = !p;
      if (next) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        intervalRef.current = setInterval(() => {
          setSeconds((s) => {
            const nx = s + 1;
            if (nx >= target) finishSession(0, nx);
            return nx;
          });
        }, 1000);
      }
      return next;
    });
  };

  const incrementRep = () => {
    setReps((r) => {
      const next = r + 1;
      const id = ++popupIdRef.current;
      setXpPopups((prev) => [...prev, { id, amount: 10 }]);
      if (next >= target) {
        finishSession(next, 0);
      }
      return next;
    });
  };

  const decrementRep = () => {
    setReps((r) => Math.max(0, r - 1));
  };

  const endEarly = () => {
    finishSession(reps, seconds);
  };

  const restart = () => {
    setSessionResult(null);
    setReps(0);
    setSeconds(0);
    setPhase('pick');
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!exercise) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-muted text-sm">Exercise not found.</div>
      </div>
    );
  }

  const Icon = exercise.icon;
  const isTimed = exercise.isTimed;
  const current = isTimed ? seconds : reps;
  const pct = (current / target) * 100;

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link
          href="/exercise"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All exercises
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl accent-bg-soft flex items-center justify-center">
            <Icon className="w-5 h-5 accent-text" strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-medium accent-text">{exercise.tagline}</div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-app">
              {exercise.name} session
            </h1>
          </div>
        </div>

        {phase === 'pick' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <TargetPicker exercise={exercise} onStart={startWorkout} />
            <div className="surface rounded-2xl p-6 sm:p-8">
              <h3 className="text-base font-semibold text-app mb-3">How to use</h3>
              <ul className="space-y-2.5 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">1.</span>
                  Pick your target {isTimed ? 'duration' : 'reps'}.
                </li>
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">2.</span>
                  {isTimed
                    ? 'The timer counts down automatically once you start.'
                    : 'Tap the + button each time you complete a rep.'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">3.</span>
                  Workout ends automatically when you reach the target.
                </li>
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">4.</span>
                  Earn XP, FitCoins, and progress toward daily quests.
                </li>
              </ul>
              {!exercise.hasAiDetection && (
                <div className="mt-5 p-3 rounded-lg surface text-xs text-muted leading-relaxed">
                  AI form detection isn&apos;t available yet for {exercise.name.toLowerCase()}s
                  — manual rep tracking is fully supported.
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'active' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 surface rounded-2xl p-6 sm:p-10 relative overflow-hidden">
              <XpPopupLayer items={xpPopups} onExpire={expirePopup} />

              <div className="text-center mb-8">
                <div className="text-xs text-subtle mb-2">
                  {isTimed ? 'Hold for' : 'Reps'}
                </div>
                <motion.div
                  key={current}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-7xl sm:text-8xl font-semibold text-app tabular-nums"
                >
                  {isTimed ? formatTime(current) : current}
                </motion.div>
                <div className="text-sm text-muted mt-2">
                  Target: {isTimed ? formatTime(target) : target}
                </div>
              </div>

              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-8">
                <motion.div
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-[var(--accent)] rounded-full"
                />
              </div>

              {isTimed ? (
                <div className="flex justify-center">
                  <button
                    onClick={togglePause}
                    className="w-20 h-20 rounded-full accent-bg flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                  >
                    {paused ? (
                      <Play className="w-8 h-8" fill="currentColor" />
                    ) : (
                      <Pause className="w-8 h-8" fill="currentColor" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={decrementRep}
                    className="w-14 h-14 rounded-full surface surface-hover flex items-center justify-center text-app"
                    aria-label="Subtract rep"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={incrementRep}
                    className="w-24 h-24 rounded-full accent-bg flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                    aria-label="Count rep"
                  >
                    <Plus className="w-10 h-10" strokeWidth={2.5} />
                  </button>
                  <div className="w-14 h-14" />
                </div>
              )}

              <p className="text-xs text-subtle text-center mt-6">
                {isTimed
                  ? 'Hold the position with good form.'
                  : 'Tap the green button to count each rep.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="surface rounded-2xl p-5">
                <div className="text-xs text-subtle mb-1">Progress</div>
                <div className="text-2xl font-semibold text-app tabular-nums">
                  {Math.round(pct)}%
                </div>
                <div className="text-xs text-subtle mt-1">
                  {isTimed
                    ? `${target - current} sec to go`
                    : `${target - current} reps to go`}
                </div>
              </div>

              <div className="surface rounded-2xl p-5">
                <div className="text-xs text-subtle mb-1">Estimated XP</div>
                <div className="text-2xl font-semibold text-app tabular-nums">
                  +{(isTimed ? 0 : current) * 10 + (current > 0 ? 25 : 0)}
                </div>
                <div className="text-xs text-subtle mt-1">earned so far</div>
              </div>

              <button
                onClick={endEarly}
                className="w-full px-4 py-3 rounded-xl surface surface-hover text-app text-sm font-medium flex items-center justify-center gap-2"
              >
                <CircleStop className="w-4 h-4" />
                End early
              </button>
            </div>
          </div>
        )}

        {phase === 'complete' && sessionResult && (
          <WorkoutComplete
            result={sessionResult}
            reps={isTimed ? seconds : reps}
            durationSeconds={duration}
            exerciseName={exercise.name}
            onRestart={restart}
          />
        )}

        {phase === 'complete' && !sessionResult && (
          <div className="surface rounded-2xl p-8 text-center">
            <p className="text-muted mb-6">
              No {isTimed ? 'time' : 'reps'} recorded. Try again?
            </p>
            <button
              onClick={restart}
              className="px-5 py-2.5 rounded-lg accent-bg text-white text-sm font-medium"
            >
              Restart
            </button>
          </div>
        )}
      </div>

      <AchievementToastLayer
        achievementIds={achievementToasts}
        onDismiss={dismissAchievement}
      />
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${r.toString().padStart(2, '0')}` : `${r}s`;
}
