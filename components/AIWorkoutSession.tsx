'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { Camera, Pause, Play, Square, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
import {
  getDetectorForSlug,
  drawSkeleton,
  type Detector,
} from '@/lib/exerciseDetectors';

type Phase = 'pick' | 'loading' | 'active' | 'paused' | 'complete';

export default function AIWorkoutSession({ slug }: { slug: string }) {
  const exercise = getExercise(slug);

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

  // UI state
  const [phase, setPhase] = useState<Phase>('pick');
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
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );
    const lm = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
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
      if (result.newAchievements.length > 0) {
        setAchievementToasts((prev) => [...prev, ...result.newAchievements]);
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

          // Only update detector + counters when ACTIVE
          if (phaseRef.current === 'active') {
            const out = detector.detect(landmarks);
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
    setPhaseBoth('pick');
    detectorRef.current?.reset();
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      stopAnimation();
      stopTick();
      stopCamera();
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [stopAnimation, stopTick, stopCamera]);

  if (!exercise) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-muted text-sm">Exercise not found.</div>
      </div>
    );
  }

  const Icon = exercise.icon;
  const isTimed = exercise.isTimed;
  const current = isTimed ? elapsed : reps;
  const pct = target > 0 ? (current / target) * 100 : 0;
  const showVideo = phase === 'loading' || phase === 'active' || phase === 'paused';

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
              {phase === 'pick' && `${exercise.name} session`}
              {(phase === 'loading' || phase === 'active' || phase === 'paused') &&
                `Target: ${isTimed ? formatTime(target) : `${target} reps`}`}
              {phase === 'complete' && 'Workout complete'}
            </h1>
          </div>
        </div>

        {phase === 'pick' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <TargetPicker exercise={exercise} onStart={startWorkout} />
            <div className="surface rounded-2xl p-6 sm:p-8">
              <h3 className="text-base font-semibold text-app mb-3">How it works</h3>
              <ul className="space-y-2.5 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">1.</span>
                  Pick your target {isTimed ? 'duration' : 'reps'}.
                </li>
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">2.</span>
                  Allow camera access. Stand 6–8 feet back, full body in frame.
                </li>
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">3.</span>
                  AI tracks your movement and counts reps automatically.
                </li>
                <li className="flex items-start gap-2">
                  <span className="accent-text font-semibold">4.</span>
                  Workout ends when you reach the target.
                </li>
              </ul>
              {error && (
                <div className="mt-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active / paused / loading — keep video element mounted across all three */}
        {(phase === 'loading' || phase === 'active' || phase === 'paused') && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 surface rounded-2xl overflow-hidden">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full scale-x-[-1]"
                />

                {phase === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-[var(--accent-soft)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-muted">Loading camera and AI model…</p>
                    </div>
                  </div>
                )}

                {phase === 'paused' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center">
                      <Pause className="w-10 h-10 text-white mx-auto mb-3" />
                      <div className="text-lg font-semibold text-white mb-1">Paused</div>
                      <div className="text-sm text-white/70">
                        AI tracking is paused. Tap resume to continue.
                      </div>
                    </div>
                  </div>
                )}

                <XpPopupLayer items={xpPopups} onExpire={expirePopup} />

                {showVideo && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white tabular-nums">
                      {isTimed ? formatTime(current) : `${current} / ${target}`}
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white">
                      {phase === 'paused'
                        ? 'Paused'
                        : isTimed
                        ? 'Holding'
                        : stance === 'down'
                        ? 'Down'
                        : 'Up'}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-app">
                <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-3">
                  <motion.div
                    animate={{ width: `${Math.min(100, pct)}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-[var(--accent)] rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-muted flex-1 min-w-[200px]">{feedback}</p>
                  <div className="flex items-center gap-2">
                    {phase === 'active' && (
                      <button
                        onClick={pauseWorkout}
                        className="px-3 py-2 rounded-lg surface surface-hover text-app text-sm font-medium flex items-center gap-1.5"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </button>
                    )}
                    {phase === 'paused' && (
                      <button
                        onClick={resumeWorkout}
                        className="px-3 py-2 rounded-lg accent-bg text-white text-sm font-medium flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" fill="currentColor" />
                        Resume
                      </button>
                    )}
                    <button
                      onClick={endEarly}
                      disabled={phase === 'loading'}
                      className="px-3 py-2 rounded-lg surface surface-hover disabled:opacity-50 text-app text-sm font-medium flex items-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5" />
                      End
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="surface rounded-2xl p-5">
                <div className="text-xs text-subtle mb-1">{isTimed ? 'Time held' : 'Reps'}</div>
                <div className="text-4xl font-semibold text-app tabular-nums">
                  {isTimed ? formatTime(current) : current}
                </div>
                <div className="text-xs text-subtle mt-1">
                  of {isTimed ? formatTime(target) : `${target}`} target
                </div>
              </div>
              <div className="surface rounded-2xl p-5">
                <div className="text-xs text-subtle mb-1">Duration</div>
                <div className="text-2xl font-semibold text-app tabular-nums">
                  {formatTime(elapsed)}
                </div>
              </div>
              {metric !== null && (
                <div className="surface rounded-2xl p-5">
                  <div className="text-xs text-subtle mb-1">{metricLabel}</div>
                  <div className="text-2xl font-semibold text-app tabular-nums">
                    {metric}
                    {metricLabel.toLowerCase().includes('angle') ? '°' : ''}
                  </div>
                </div>
              )}
              <div className="surface rounded-2xl p-5">
                <div className="text-xs text-subtle mb-1">Status</div>
                <div className="text-sm text-app font-medium">{feedback}</div>
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
            onRestart={restart}
          />
        )}

        {phase === 'complete' && !sessionResult && (
          <div className="surface rounded-2xl p-8 text-center">
            <Camera className="w-8 h-8 text-subtle mx-auto mb-3" />
            <p className="text-muted mb-6">
              No {isTimed ? 'time' : 'reps'} recorded.
            </p>
            <button
              onClick={restart}
              className="px-5 py-2.5 rounded-lg accent-bg text-white text-sm font-medium"
            >
              Try again
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
  return m > 0 ? `${m}:${r.toString().padStart(2, '0')}` : `0:${r.toString().padStart(2, '0')}`;
}
