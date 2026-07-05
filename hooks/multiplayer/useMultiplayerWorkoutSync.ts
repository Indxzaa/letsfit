'use client';

// Runs MediaPipe pose detection locally, counts reps, and syncs only
// the final numbers to the room. Camera frames and landmarks never leave
// the device.

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  PoseLandmarker, FilesetResolver, type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { getDetectorForSlug, drawSkeleton, type Detector } from '@/lib/exerciseDetectors';
import { getExercise } from '@/lib/exercises';
import {
  subscribeWorkoutSync, broadcastWorkoutState, broadcastBothFinished,
  type ExerciseState, type PlayerWorkoutState,
} from '@/lib/multiplayer/workout-sync';

// ── Types ─────────────────────────────────────────────────────────────────

export interface MultiplayerWorkoutSyncState {
  // Local player
  myReps:          number;
  myState:         ExerciseState;
  liveFormScore:   number;
  feedback:        string;
  cameraReady:     boolean;
  // Remote player
  partnerReps:     number;
  partnerState:    ExerciseState;
  // Session
  bothFinished:    boolean;
}

// ── Throttle: only broadcast when reps change or state transitions ─────────

const THROTTLE_MS = 200; // minimum ms between broadcasts

// ── Hook ─────────────────────────────────────────────────────────────────

export function useMultiplayerWorkoutSync(params: {
  roomId:    string;
  userId:    string;
  slug:      string;
  isActive:  boolean;
  videoRef:  React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}): MultiplayerWorkoutSyncState & {
  stopDetection: () => void;
} {
  const { roomId, userId, slug, isActive, videoRef, canvasRef } = params;

  const exercise = getExercise(slug);
  const isTimed  = exercise?.isTimed ?? false;

  // ── Local state ───────────────────────────────────────────────────────

  const [myReps,        setMyReps]        = useState(0);
  const [myState,       setMyState]       = useState<ExerciseState>('idle');
  const [liveFormScore, setLiveFormScore] = useState(0);
  const [feedback,      setFeedback]      = useState('Get ready');
  const [cameraReady,   setCameraReady]   = useState(false);
  const [partnerReps,   setPartnerReps]   = useState(0);
  const [partnerState,  setPartnerState]  = useState<ExerciseState>('idle');
  const [bothFinished,  setBothFinished]  = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────

  const repCountRef      = useRef(0);
  const elapsedSecRef    = useRef(0);
  const finishedRef      = useRef(false);
  const isActiveRef      = useRef(isActive);
  const lastBroadcastRef = useRef(0);
  const lastRepSentRef   = useRef(0);
  const landmarkerRef    = useRef<PoseLandmarker | null>(null);
  const detectorRef      = useRef<Detector | null>(null);
  const animRef          = useRef<number | null>(null);
  const tickRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVideoTimeRef = useRef(-1);

  // Keep isActive ref in sync
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

  // ── Broadcast helper — throttled, only on meaningful change ──────────

  const maybeBroadcast = useCallback((reps: number, state: ExerciseState, force = false) => {
    const now = Date.now();
    if (!force && now - lastBroadcastRef.current < THROTTLE_MS) return;
    if (!force && reps === lastRepSentRef.current && state === myState) return;
    lastBroadcastRef.current = now;
    lastRepSentRef.current   = reps;
    const payload: PlayerWorkoutState = {
      userId, repCount: reps, exerciseState: state,
      finishFlag: state === 'finished', timestamp: now,
    };
    broadcastWorkoutState(roomId, payload).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId]);

  // ── Finish session ────────────────────────────────────────────────────

  const finishSession = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    const reps = isTimed ? elapsedSecRef.current : repCountRef.current;
    setMyReps(reps);
    setMyState('finished');
    maybeBroadcast(reps, 'finished', true);
  }, [isTimed, maybeBroadcast]);

  // ── MediaPipe init ────────────────────────────────────────────────────

  const ensureLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
    );
    landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
    detectorRef.current = getDetectorForSlug(slug);
  }, [slug]);

  // ── Detection loop ────────────────────────────────────────────────────

  const renderLoop = useCallback(() => {
    animRef.current = requestAnimationFrame(renderLoop);
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const lm     = landmarkerRef.current;
    const det    = detectorRef.current;
    if (!video || !canvas || !lm || !det) return;
    if (video.currentTime === lastVideoTimeRef.current) return;
    lastVideoTimeRef.current = video.currentTime;

    let result: PoseLandmarkerResult;
    try { result = lm.detectForVideo(video, performance.now()); }
    catch { return; }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (result.landmarks[0]) drawSkeleton(ctx, result.landmarks[0]);
    }

    if (!isActiveRef.current || !result.landmarks[0]) return;

    const out = det.detect(result.landmarks[0]);
    setLiveFormScore(out.formScore);
    setFeedback(out.feedback);

    if (!isTimed && out.rep) {
      repCountRef.current += 1;
      setMyReps(repCountRef.current);
      maybeBroadcast(repCountRef.current, 'working');
      // No auto-finish — session is open-ended until user exits
    }
  }, [videoRef, canvasRef, isTimed, maybeBroadcast]);

  // ── Timed exercise tick ───────────────────────────────────────────────

  const startTick = useCallback(() => {
    if (!isTimed) return;
    tickRef.current = setInterval(() => {
      if (!isActiveRef.current) return;
      elapsedSecRef.current += 1;
      setMyReps(elapsedSecRef.current);
      maybeBroadcast(elapsedSecRef.current, 'working');
      // No auto-finish — open-ended session
    }, 1000);
  }, [isTimed, maybeBroadcast]);

  // ── Camera setup + start ─────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function start() {
      await ensureLandmarker();
      if (cancelled) return;
      const video = videoRef.current;
      if (!video) return;

      if (!video.srcObject) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false,
          });
          if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
          video.srcObject = stream;
          await new Promise<void>((res, rej) => {
            video.onloadedmetadata = () => video.play().then(res).catch(rej);
          });
        } catch { return; }
      }

      if (cancelled) return;
      setCameraReady(true);
      setMyState('working');
      maybeBroadcast(0, 'working', true);
      animRef.current = requestAnimationFrame(renderLoop);
      startTick();
    }

    start();
    return () => {
      cancelled = true;
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      landmarkerRef.current?.close(); landmarkerRef.current = null;
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        video.srcObject = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Subscribe to partner state ────────────────────────────────────────

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeWorkoutSync(roomId, (event) => {
      if (event.type === 'state_update' && event.state.userId !== userId) {
        setPartnerReps(event.state.repCount);
        setPartnerState(event.state.exerciseState);
        if (event.state.finishFlag) {
          // Check if we're also finished
          if (finishedRef.current) {
            broadcastBothFinished(roomId).catch(() => {});
            setBothFinished(true);
          }
        }
      }
      if (event.type === 'both_finished') {
        setBothFinished(true);
      }
    });
    return unsub;
  }, [roomId, userId]);

  // ── Stop detection (called externally on hangup) ──────────────────────

  const stopDetection = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    landmarkerRef.current?.close(); landmarkerRef.current = null;
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  }, [videoRef]);

  return {
    myReps, myState, liveFormScore, feedback, cameraReady,
    partnerReps, partnerState, bothFinished,
    stopDetection,
  };
}
