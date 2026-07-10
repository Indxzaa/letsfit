'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PoseLandmarker,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { createPoseLandmarker } from '@/lib/ai/mediapipe';
import { Camera, Pause, Play, Square, ArrowLeft, Sparkles, Activity, Target, Clock } from 'lucide-react';
import Link from 'next/link';
import {
  loadProgress,
  saveProgress,
  recordSession,
  type SessionResult,
} from '@/lib/progress';
import { checkAchievements, checkQuests } from '@/lib/achievements';
import { XpPopupLayer, type XpPopupItem } from '@/components/XpPopup';
import { playSound } from '@/lib/audio';
import { AchievementToastLayer } from '@/components/AchievementToast';
import TargetPicker from '@/components/TargetPicker';
import WorkoutComplete from '@/components/WorkoutComplete';
import Navbar from '@/components/Navbar';
import { getExercise } from '@/lib/exercises';
import {
  getDetectorForSlug,
  drawSkeleton,
  type Detector,
} from '@/lib/exerciseDetectors';

type Phase = 'pick' | 'loading' | 'active' | 'paused' | 'complete';

export default function AIWorkoutSession({ slug }: { slug: string }) {
  const exercise = getExercise(slug);
  const searchParams = useSearchParams();
  const stageId = searchParams.get('stageId');
  const presetStr = searchParams.get('preset');
  const preset = presetStr !== null ? Number(presetStr) : null;
  const router = useRouter();
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Refs that survive re-renders without triggering them
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const detectorRef = useRef<Detector | null>(null);
  const phaseRef = useRef<Phase>('pick');
  const repCountRef = useRef<number>(0);
  const targetRef = useRef<number>(0);
  const elapsedSecRef = useRef<number>(0); // counts only while active
  const formAccumulatorRef = useRef<{ sum: number; count: number }>({ sum: 0, count: 0 });
  const finishedRef = useRef(false);
  const popupIdRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const poseValidRef = useRef(false);
  const lastToastMsRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI state
  const [phase, setPhase] = useState<Phase>('pick');
  const [formToast, setFormToast] = useState<string | null>(null);
  const [target, setTarget] = useState(0);
  const [reps, setReps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState('Get ready');
  const [metric, setMetric] = useState<number | null>(null);
  const [metricLabel, setMetricLabel] = useState('');
  const [stance, setStance] = useState<'up' | 'down'>('up');
  const [error, setError] = useState<string | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [xpPopups, setXpPopups] = useState<XpPopupItem[]>([]);
  const [achievementToasts, setAchievementToasts] = useState<string[]>([]);
  const [liveFormScore, setLiveFormScore] = useState(0);
  const [poseDetected, setPoseDetected] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const expirePopup = useCallback((id: number) => {
    setXpPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const dismissAchievement = useCallback((id: string) => {
    setAchievementToasts((prev) => prev.filter((a) => a !== id));
  }, []);

  // ---- camera + model ----
  const ensureLandmarker = useCallback(async (): Promise<PoseLandmarker> => {
    if (landmarkerRef.current) return landmarkerRef.current;
    const lm = await createPoseLandmarker();
    landmarkerRef.current = lm;
    return lm;
  }, []);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  // ---- session lifecycle ----
  const finishSession = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    stopAnimation();
    stopTick();
    stopCamera();
    const acc = formAccumulatorRef.current.count > 0
      ? Math.round(formAccumulatorRef.current.sum / formAccumulatorRef.current.count)
      : null;
    setAccuracy(acc);
    setPhaseBoth('complete');

    if (!exercise) return;

    const completedReps = repCountRef.current;
    const seconds = elapsedSecRef.current;

    // For plank, the "reps" we record are seconds held
    const recordedReps = exercise.isTimed ? seconds : completedReps;

    if (recordedReps > 0) {
      const before = loadProgress();
      const result = recordSession(
        before,
        recordedReps,
        exercise.slug,
        seconds,
        checkAchievements,
        checkQuests
      );
      setSessionResult(result);
      playSound('exercise-complete');
      if (result.leveledUp) playSound('level-up');
      if (result.newAchievements.length > 0) {
        setAchievementToasts((prev) => [...prev, ...result.newAchievements]);
      }
      if (stageId) {
        const fresh = loadProgress();
        if (!fresh.stagesCompleted.includes(stageId)) {
          saveProgress({ ...fresh, stagesCompleted: [...fresh.stagesCompleted, stageId] });
        }
      }
    }
  }, [exercise, stopAnimation, stopTick, stopCamera, setPhaseBoth]);

  // Detection loop — runs continuously while video stream exists.
  // Detection logic is gated by phaseRef so pause works.
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    const detector = detectorRef.current;

    if (!video || !canvas) {
      animationRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    if (video.readyState < 2 || !landmarker || !detector) {
      animationRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationRef.current = requestAnimationFrame(renderLoop);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        const result: PoseLandmarkerResult = landmarker.detectForVideo(video, now);
        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          drawSkeleton(ctx, landmarks);
          setPoseDetected(true);

          // Only update detector + counters when ACTIVE
          if (phaseRef.current === 'active') {
            const out = detector.detect(landmarks);
            poseValidRef.current = out.formScore > 0;
            setLiveFormScore(out.formScore);
            if (out.formScore > 0 && out.formScore < 70 && out.feedback) {
              const now = Date.now();
              if (now - lastToastMsRef.current > 3500) {
                lastToastMsRef.current = now;
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                setFormToast(out.feedback);
                toastTimerRef.current = setTimeout(() => setFormToast(null), 2800);
              }
            }
            setStance(out.phase);
            setFeedback(out.feedback);
            setMetric(out.metric);
            setMetricLabel(out.metricLabel);

            // accumulate form score for accuracy
            if (out.formScore > 0) {
              formAccumulatorRef.current.sum += out.formScore;
              formAccumulatorRef.current.count += 1;
            }

            if (out.rep && !exercise?.isTimed) {
              repCountRef.current += 1;
              const newCount = repCountRef.current;
              setReps(newCount);
              playSound('rep');
              const id = ++popupIdRef.current;
              setXpPopups((prev) => [...prev, { id, amount: 10 }]);
              if (newCount >= targetRef.current) {
                finishSession();
                return;
              }
            }
          } else if (phaseRef.current === 'paused') {
            // Show frozen feedback in paused state
            setFeedback('Paused');
          }
        } else {
          poseValidRef.current = false;
          setPoseDetected(false);
          setLiveFormScore(0);
        }
      } catch (err) {
        console.error('Pose detection error:', err);
      }
    }

    animationRef.current = requestAnimationFrame(renderLoop);
  }, [exercise, finishSession]);

  // Time tick — only runs while active. Recreated each time we pause/resume.
  const startTick = useCallback(() => {
    stopTick();
    tickRef.current = setInterval(() => {
      if (phaseRef.current !== 'active') return;
      if (exercise?.isTimed && !poseValidRef.current) return;
      elapsedSecRef.current += 1;
      setElapsed(elapsedSecRef.current);
      if (exercise?.isTimed && elapsedSecRef.current >= targetRef.current) {
        finishSession();
      }
    }, 1000);
  }, [exercise, finishSession, stopTick]);

  const startWorkout = async (chosenTarget: number) => {
    setError(null);
    setPhaseBoth('loading');
    targetRef.current = chosenTarget;
    setTarget(chosenTarget);
    repCountRef.current = 0;
    elapsedSecRef.current = 0;
    formAccumulatorRef.current = { sum: 0, count: 0 };
    finishedRef.current = false;
    setReps(0);
    setElapsed(0);
    setStance('up');
    setFeedback('Loading camera…');

    if (exercise) {
      detectorRef.current = getDetectorForSlug(exercise.slug);
    }

    try {
      await ensureLandmarker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      });
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          video.removeEventListener('loadedmetadata', onReady);
          video.play().then(resolve).catch(reject);
        };
        video.addEventListener('loadedmetadata', onReady);
      });

      setPhaseBoth('active');
      setFeedback(exercise?.isTimed ? 'Hold the position' : `Reach ${chosenTarget} reps`);

      // Kick off the animation loop and the timer tick
      if (animationRef.current === null) {
        animationRef.current = requestAnimationFrame(renderLoop);
      }
      startTick();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not access camera. Check browser permissions.'
      );
      stopCamera();
      setPhaseBoth('pick');
    }
  };

  const pauseWorkout = () => {
    if (phaseRef.current !== 'active') return;
    setPhaseBoth('paused');
    stopTick();
    setFeedback('Paused — tap resume to continue');
  };

  const resumeWorkout = () => {
    if (phaseRef.current !== 'paused') return;
    setPhaseBoth('active');
    startTick();
    setFeedback(exercise?.isTimed ? 'Hold the position' : `${targetRef.current - repCountRef.current} to go`);
  };

  const endEarly = () => {
    finishSession();
  };

  const restart = () => {
    setSessionResult(null);
    setReps(0);
    setElapsed(0);
    setMetric(null);
    setError(null);
    setAccuracy(null);
    setLiveFormScore(0);
    setPoseDetected(false);
    setPhaseBoth('pick');
    detectorRef.current?.reset();
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      stopAnimation();
      stopTick();
      stopCamera();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [stopAnimation, stopTick, stopCamera]);

  // Auto-start when preset target is provided (Adventure mode)
  const autoStarted = useRef(false);
  useEffect(() => {
    if (preset !== null && !autoStarted.current) {
      autoStarted.current = true;
      void startWorkout(preset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!exercise) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-muted text-sm">Exercise not found.</div>
      </div>
    );
  }

  const Icon = exercise.icon;
  const isTimed = exercise.isTimed;
  const current = isTimed ? elapsed : reps;
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const showVideo = phase === 'loading' || phase === 'active' || phase === 'paused';
  const accuracyColor = liveFormScore >= 80 ? 'var(--accent)' : liveFormScore >= 50 ? '#f59e0b' : liveFormScore > 0 ? '#ef4444' : 'var(--text-subtle)';

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {stageId ? (
          <button
            onClick={() => setShowExitDialog(true)}
            className="link-back mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to adventure
          </button>
        ) : (
          <Link href="/exercise" className="link-back mb-8 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            All exercises
          </Link>
        )}

        {phase === 'pick' && preset !== null && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {phase === 'pick' && preset === null && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent)', boxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 40%, transparent)' }}>
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold accent-text uppercase tracking-wider">{exercise.category}</span>
                  {exercise.hasAiDetection && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-app">{exercise.name}</h1>
                <p className="text-sm text-muted mt-0.5">{exercise.tagline}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              <div className="neo-card p-6 sm:p-8 space-y-5" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
                <p className="text-sm text-muted leading-relaxed">{exercise.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { Icon: Activity, label: 'Difficulty', value: exercise.difficulty, bg: 'var(--card-bg-blue)' },
                    { Icon: Target, label: 'Equipment', value: exercise.equipment, bg: 'var(--card-bg-green)' },
                  ] as const).map(({ Icon: I, label, value, bg }) => (
                    <div key={label} className="neo-card p-3" style={{ background: bg, borderRadius: 0 }}>
                      <I className="w-3.5 h-3.5 mb-1.5" style={{ color: 'var(--neo-accent)' }} />
                      <div className="text-xs text-subtle">{label}</div>
                      <div className="text-sm font-semibold text-app mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-subtle mb-2.5 uppercase tracking-wide">How it works</div>
                  <ol className="space-y-2">
                    {[
                      `Pick your target ${isTimed ? 'duration' : 'reps'}.`,
                      'Allow camera. Stand 6–8 ft back, full body in frame.',
                      'AI tracks movement and counts reps automatically.',
                      'Workout ends when you reach the target.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                {error && (
                  <div className="p-3 rounded-xl text-xs text-red-400"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </div>
                )}
              </div>
              <TargetPicker exercise={exercise} onStart={startWorkout} />
            </div>
          </div>
        )}

        {/* Active / paused / loading */}
        {showVideo && (
          <div className="grid lg:grid-cols-[1fr_288px] gap-5">

            {/* Camera column */}
            <div className="space-y-3">
              <div className="relative overflow-hidden bg-black" style={{ borderRadius: 20 }}>
                <div className="relative" style={{ aspectRatio: '16/9' }}>
                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline muted />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1]" />

                  {phase === 'loading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                      <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Loading AI model…</p>
                    </div>
                  )}

                  {phase === 'paused' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.12)' }}>
                        <Pause className="w-6 h-6 text-white" fill="white" />
                      </div>
                      <span className="text-white font-semibold">Paused</span>
                    </motion.div>
                  )}

                  {/* AI status pills */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <AiStatusPill label="Camera" active={phase !== 'loading'} />
                    <AiStatusPill label="Pose" active={poseDetected} />
                    <AiStatusPill label="Tracking" active={phase === 'active' && poseDetected} />
                  </div>

                  {/* Counter pill */}
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-bold tabular-nums text-white"
                    style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
                    {isTimed ? formatTime(current) : `${current} / ${target}`}
                  </div>

                  <AnimatePresence>
                    {formToast && phase === 'active' && (
                      <motion.div key={formToast} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute bottom-4 inset-x-4 flex justify-center pointer-events-none z-20">
                        <div className="px-4 py-2 rounded-xl text-sm text-white font-medium text-center max-w-xs"
                          style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}>
                          {formToast}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <XpPopupLayer items={xpPopups} onExpire={expirePopup} />
                </div>

                {/* Animated progress bar */}
                <div className="xp-track mx-4 mb-4 mt-3" style={{ height: 8 }}>
                  <motion.div className="xp-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.35 }} />
                </div>
              </div>

              {/* Mobile stats */}
              <div className="grid grid-cols-3 gap-2 lg:hidden">
                <MiniStat label={isTimed ? 'Held' : 'Reps'} value={isTimed ? formatTime(current) : String(current)} bg="var(--card-bg-green)" />
                <MiniStat label="Duration" value={formatTime(elapsed)} bg="var(--card-bg-blue)" />
                <MiniStat label="Accuracy" value={liveFormScore > 0 ? `${liveFormScore}%` : '—'} color={liveFormScore > 0 ? accuracyColor : undefined} bg="var(--card-bg-amber)" />
              </div>

              {/* Mobile controls */}
              <div className="neo-card p-4 flex items-center justify-between gap-3 lg:hidden" style={{ background: 'var(--neo-white)', borderRadius: 0 }}>
                <AnimatePresence mode="wait">
                  <motion.p key={feedback} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-sm text-muted flex-1 min-w-0 truncate">{feedback}</motion.p>
                </AnimatePresence>
                <WorkoutControls phase={phase} onPause={pauseWorkout} onResume={resumeWorkout} onEnd={endEarly} />
              </div>
            </div>

            {/* Sidebar — desktop only */}
            <div className="hidden lg:flex flex-col gap-3">
              <div className="neo-card p-5 text-center" style={{ background: 'var(--card-bg-green)', borderRadius: 0 }}>
                <div className="text-xs font-bold uppercase tracking-wider text-subtle mb-1">{isTimed ? 'Time held' : 'Reps completed'}</div>
                <motion.div key={current} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                  className="text-5xl font-bold text-app tabular-nums">{isTimed ? formatTime(current) : current}</motion.div>
                <div className="text-xs text-muted mt-1">of {isTimed ? formatTime(target) : `${target}`}</div>
              </div>

              <div className="neo-card p-4 flex items-center gap-3" style={{ background: 'var(--card-bg-blue)', borderRadius: 0 }}>
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--neo-accent)' }} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-subtle">Duration</div>
                  <div className="text-lg font-bold tabular-nums text-app">{formatTime(elapsed)}</div>
                </div>
              </div>

              {liveFormScore > 0 && (
                <div className="neo-card p-4 flex items-center gap-3" style={{ background: 'var(--card-bg-amber)', borderRadius: 0 }}>
                  <LiveAccuracyRing score={liveFormScore} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-subtle">Pose Accuracy</div>
                    <div className="text-lg font-bold tabular-nums" style={{ color: accuracyColor }}>{liveFormScore}%</div>
                  </div>
                </div>
              )}

              {metric !== null && (
                <div className="neo-card p-4" style={{ background: 'var(--card-bg-purple)', borderRadius: 0 }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-subtle mb-0.5">{metricLabel}</div>
                  <div className="text-xl font-bold text-app tabular-nums">
                    {metric}{metricLabel.toLowerCase().includes('angle') ? '°' : ''}
                  </div>
                </div>
              )}

              <div className="neo-card p-4" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
                <div className="text-xs font-bold uppercase tracking-wider text-subtle mb-1.5">AI Feedback</div>
                <AnimatePresence mode="wait">
                  <motion.p key={feedback} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-sm font-medium text-app leading-snug">{feedback}</motion.p>
                </AnimatePresence>
              </div>

              <div className="neo-card p-4 space-y-2.5" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
                <div className="text-xs font-bold uppercase tracking-wider text-subtle mb-1">AI Status</div>
                <StatusRow label="Camera Ready" active={phase !== 'loading'} />
                <StatusRow label="Pose Detected" active={poseDetected} />
                <StatusRow label="Tracking Active" active={phase === 'active' && poseDetected} />
              </div>

              <div className="neo-card p-4" style={{ background: 'var(--neo-white)', borderRadius: 0 }}>
                <WorkoutControls phase={phase} onPause={pauseWorkout} onResume={resumeWorkout} onEnd={endEarly} />
              </div>
            </div>
          </div>
        )}

        {phase === 'complete' && sessionResult && (
          <WorkoutComplete
            result={sessionResult}
            reps={isTimed ? elapsed : reps}
            durationSeconds={elapsed}
            exerciseName={exercise.name}
            accuracy={accuracy}
            onRestart={restart}
            backHref={stageId ? '/adventure' : '/dashboard'}
          />
        )}

        {phase === 'complete' && !sessionResult && (
          <div className="neo-card p-10 text-center" style={{ background: 'var(--neo-surface)', borderRadius: 0 }}>
            <Camera className="w-8 h-8 text-subtle mx-auto mb-3" />
            <p className="text-muted mb-6">No {isTimed ? 'time' : 'reps'} recorded.</p>
            <button onClick={restart} className="neo-btn neo-btn-primary cursor-pointer">
              Try again
            </button>
          </div>
        )}
      </div>

      <AchievementToastLayer achievementIds={achievementToasts} onDismiss={dismissAchievement} />

      {/* ── Leave Adventure confirmation dialog ── */}
      <AnimatePresence>
        {showExitDialog && (
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
              {/* Header strip */}
              <div
                className="px-6 py-4"
                style={{ borderBottom: '3px solid #000', background: 'var(--card-bg-amber, #fef3c7)' }}
              >
                <div className="font-display text-xl font-bold text-app uppercase tracking-tight">
                  Quit Exercise?
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Your progress for this stage will not be completed.
                  <br />
                  Are you sure you want to quit?
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      const world = stageId ? stageId.charAt(1) : null;
                      router.push(world ? `/adventure/${world}` : '/adventure');
                    }}
                    className="w-full py-3 text-sm font-black uppercase tracking-widest text-white cursor-pointer"
                    style={{
                      background: '#000',
                      border: '3px solid #000',
                      boxShadow: '3px 3px 0 #555',
                    }}
                  >
                    Quit Exercise
                  </button>
                  <button
                    onClick={() => setShowExitDialog(false)}
                    className="w-full py-3 text-sm font-bold uppercase tracking-widest cursor-pointer text-app"
                    style={{
                      background: 'transparent',
                      border: '3px solid #000',
                    }}
                  >
                    Continue Exercise
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${r.toString().padStart(2, '0')}` : `0:${r.toString().padStart(2, '0')}`;
}

function MiniStat({ label, value, color, bg }: { label: string; value: string; color?: string; bg?: string }) {
  return (
    <div className="neo-card p-3 text-center" style={{ background: bg ?? 'var(--neo-surface)', borderRadius: 0 }}>
      <div className="text-xs font-bold uppercase tracking-wider text-subtle">{label}</div>
      <div className="text-base font-bold tabular-nums mt-0.5" style={{ color: color ?? 'var(--text)' }}>{value}</div>
    </div>
  );
}

function AiStatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: active ? 'var(--accent)' : 'rgba(255,255,255,0.5)' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: active ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }} />
      {label}
    </div>
  );
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--text-subtle)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'var(--accent)' : 'var(--text-subtle)' }} />
        {active ? 'Active' : 'Waiting'}
      </span>
    </div>
  );
}

function LiveAccuracyRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const fill = Math.max(0, Math.min(100, score));
  const color = fill >= 80 ? 'var(--accent)' : fill >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="3.5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${(fill / 100) * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.3s ease' }} />
    </svg>
  );
}

function WorkoutControls({ phase, onPause, onResume, onEnd }: {
  phase: Phase;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {phase === 'active' && (
        <button
          onClick={onPause}
          className="neo-btn neo-btn-ghost flex items-center gap-1.5 text-sm cursor-pointer"
          style={{ padding: '0.5rem 0.875rem' }}
        >
          <Pause className="w-3.5 h-3.5" /> Pause
        </button>
      )}
      {phase === 'paused' && (
        <button
          onClick={onResume}
          className="neo-btn neo-btn-primary flex items-center gap-1.5 text-sm cursor-pointer"
          style={{ padding: '0.5rem 0.875rem' }}
        >
          <Play className="w-3.5 h-3.5" fill="currentColor" /> Resume
        </button>
      )}
      <button
        onClick={onEnd}
        disabled={phase === 'loading'}
        className="neo-btn neo-btn-ghost flex items-center gap-1.5 text-sm cursor-pointer disabled:opacity-50"
        style={{ padding: '0.5rem 0.875rem' }}
      >
        <Square className="w-3.5 h-3.5" /> End
      </button>
    </div>
  );
}
