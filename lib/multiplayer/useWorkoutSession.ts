'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  subscribeSessionEvents, broadcastSessionEvent,
  type SessionPhase, type PlayerWorkoutStatus,
} from './workoutSession';

export interface RoundResult {
  userId: string;
  reps:   number;
}

export interface WorkoutSessionState {
  phase:           SessionPhase;
  countdown:       number | 'GO!' | null;
  elapsed:         number;
  isPaused:        boolean;
  currentExercise: string;
  roundResults:    { a: RoundResult | null; b: RoundResult | null };
  myRoundDone:     boolean;
  partnerRoundDone:boolean;
  partnerLeft:     boolean;
}

export function useWorkoutSession(
  roomId: string,
  userId: string,
  isHost: boolean,
  initialExercise: string,
): WorkoutSessionState & {
  hostStartCountdown:   (exercise: string) => Promise<void>;
  hostSelectExercise:   (exercise: string) => Promise<void>;
  signalRoundFinished:  (reps: number) => Promise<void>;
  hostPause:            () => Promise<void>;
  hostResume:           () => Promise<void>;
  broadcastLeave:       () => Promise<void>;
} {
  const [phase,            setPhase]            = useState<SessionPhase>('selecting');
  const [countdown,        setCountdown]        = useState<number | 'GO!' | null>(null);
  const [elapsed,          setElapsed]          = useState(0);
  const [isPaused,         setIsPaused]         = useState(false);
  const [currentExercise,  setCurrentExercise]  = useState(initialExercise);
  const [roundResults,     setRoundResults]     = useState<{ a: RoundResult | null; b: RoundResult | null }>({ a: null, b: null });
  const [myRoundDone,      setMyRoundDone]      = useState(false);
  const [partnerRoundDone, setPartnerRoundDone] = useState(false);
  const [partnerLeft,      setPartnerLeft]      = useState(false);

  const startedAtRef       = useRef<number>(0);
  const adjustedStartAtRef = useRef<number>(0);
  const pausedAtRef        = useRef<number>(0);
  const tickRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef           = useRef<(() => void) | null>(null);

  // Round finish cache — host checks if both players are done
  const myFinishRef      = useRef<RoundResult | null>(null);
  const partnerFinishRef = useRef<RoundResult | null>(null);

  // ── Timer ─────────────────────────────────────────────────────────────

  const startTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - adjustedStartAtRef.current) / 1000));
    }, 500);
  }, []);

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  // ── Reset round state ─────────────────────────────────────────────────

  const resetRound = useCallback(() => {
    setMyRoundDone(false);
    setPartnerRoundDone(false);
    setRoundResults({ a: null, b: null });
    myFinishRef.current      = null;
    partnerFinishRef.current = null;
    setElapsed(0);
  }, []);

  // ── Subscribe ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!roomId) return;

    const unsub = subscribeSessionEvents(roomId, async (event) => {

      if (event.type === 'countdown') {
        setPhase('countdown');
        setCountdown(event.value);
      }

      if (event.type === 'start') {
        startedAtRef.current       = event.startedAt;
        adjustedStartAtRef.current = event.startedAt;
        setCurrentExercise(event.exercise);
        setPhase('active');
        setIsPaused(false);
        setCountdown(null);
        resetRound();
        if (!isHost) startTick();
      }

      if (event.type === 'exercise_selected') {
        setCurrentExercise(event.exercise);
        setPhase('selecting');
      }

      if (event.type === 'round_finish') {
        const finish: RoundResult = { userId: event.userId, reps: event.reps };
        if (event.userId === userId) {
          myFinishRef.current = finish;
          setMyRoundDone(true);
        } else {
          partnerFinishRef.current = finish;
          setPartnerRoundDone(true);
        }

        // Host resolves when both have reported
        if (isHost && myFinishRef.current && partnerFinishRef.current) {
          stopTick();
          const a = myFinishRef.current;
          const b = partnerFinishRef.current;
          await broadcastSessionEvent(roomId, { type: 'round_complete', playerA: a, playerB: b });
        }
      }

      if (event.type === 'round_complete') {
        stopTick();
        setPhase('round_complete');
        setRoundResults({ a: event.playerA, b: event.playerB });
      }

      if (event.type === 'pause') {
        pausedAtRef.current = event.pausedAt;
        stopTick();
        setIsPaused(true);
        setPhase('paused');
      }

      if (event.type === 'resume') {
        adjustedStartAtRef.current = event.adjustedStartAt;
        setIsPaused(false);
        setPhase('active');
        startTick();
      }

      if (event.type === 'leave' && event.userId !== userId) {
        stopTick();
        setPartnerLeft(true);
        setPhase('partner-left');
      }
    });

    unsubRef.current = unsub;
    return () => { stopTick(); unsub(); unsubRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ── Host actions ──────────────────────────────────────────────────────

  const hostStartCountdown = useCallback(async (exercise: string) => {
    if (!isHost) return;
    for (const value of [3, 2, 1] as const) {
      setCountdown(value); setPhase('countdown');
      await broadcastSessionEvent(roomId, { type: 'countdown', value });
      await new Promise(r => setTimeout(r, 1000));
    }
    setCountdown('GO!');
    await broadcastSessionEvent(roomId, { type: 'countdown', value: 'GO!' });
    await new Promise(r => setTimeout(r, 900));

    const startedAt = Date.now();
    startedAtRef.current       = startedAt;
    adjustedStartAtRef.current = startedAt;

    setCurrentExercise(exercise);
    setPhase('active');
    setCountdown(null);
    setIsPaused(false);
    resetRound();

    await broadcastSessionEvent(roomId, { type: 'start', startedAt, exercise });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'working-out' });
    startTick();
  }, [isHost, roomId, userId, startTick, resetRound]);

  const hostSelectExercise = useCallback(async (exercise: string) => {
    if (!isHost) return;
    setCurrentExercise(exercise);
    setPhase('selecting');
    await broadcastSessionEvent(roomId, { type: 'exercise_selected', exercise });
  }, [isHost, roomId]);

  const signalRoundFinished = useCallback(async (reps: number) => {
    const finish: RoundResult = { userId, reps };
    myFinishRef.current = finish;
    setMyRoundDone(true);
    await broadcastSessionEvent(roomId, { type: 'round_finish', userId, reps });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'round-finished' });

    // If already saw partner finish, host resolves now
    if (isHost && partnerFinishRef.current) {
      stopTick();
      await broadcastSessionEvent(roomId, {
        type: 'round_complete',
        playerA: finish,
        playerB: partnerFinishRef.current,
      });
    }
  }, [roomId, userId, isHost, stopTick]);

  const hostPause = useCallback(async () => {
    if (!isHost || isPaused) return;
    const pausedAt = Date.now();
    pausedAtRef.current = pausedAt;
    stopTick();
    setIsPaused(true);
    setPhase('paused');
    await broadcastSessionEvent(roomId, { type: 'pause', pausedAt });
  }, [isHost, isPaused, roomId, stopTick]);

  const hostResume = useCallback(async () => {
    if (!isHost || !isPaused) return;
    const pausedDuration   = Date.now() - pausedAtRef.current;
    const adjustedStartAt  = adjustedStartAtRef.current + pausedDuration;
    adjustedStartAtRef.current = adjustedStartAt;
    setIsPaused(false);
    setPhase('active');
    await broadcastSessionEvent(roomId, { type: 'resume', resumedAt: Date.now(), adjustedStartAt });
    startTick();
  }, [isHost, isPaused, roomId, startTick]);

  const broadcastLeave = useCallback(async () => {
    stopTick();
    await broadcastSessionEvent(roomId, { type: 'leave',   userId });
    await broadcastSessionEvent(roomId, { type: 'status',  userId, status: 'disconnected' });
  }, [roomId, userId, stopTick]);

  return {
    phase, countdown, elapsed, isPaused, currentExercise,
    roundResults, myRoundDone, partnerRoundDone, partnerLeft,
    hostStartCountdown, hostSelectExercise, signalRoundFinished,
    hostPause, hostResume, broadcastLeave,
  };
}
