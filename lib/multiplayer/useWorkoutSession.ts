'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  subscribeSessionEvents, broadcastSessionEvent,
  type SessionPhase, type PlayerWorkoutStatus,
} from './workoutSession';

export interface WorkoutSessionState {
  phase:         SessionPhase;
  countdown:     number | 'GO!' | null;
  elapsed:       number;       // seconds since start
  duration:      number;       // total session duration in seconds
  remaining:     number;       // duration - elapsed
  isPaused:      boolean;
  partnerStatus: PlayerWorkoutStatus | null;
  partnerLeft:   boolean;
}

/**
 * Manages the synchronized workout session state for one player.
 *
 * @param roomId    Supabase room ID (broadcast channel key)
 * @param userId    Current user's ID
 * @param isHost    Host drives timing; guests follow
 * @param exercise  Exercise slug
 * @param duration  Total workout duration in seconds
 */
export function useWorkoutSession(
  roomId: string,
  userId: string,
  isHost: boolean,
  exercise: string,
  duration: number,
): WorkoutSessionState & {
  hostStartCountdown: () => Promise<void>;
  hostPause:          () => Promise<void>;
  hostResume:         () => Promise<void>;
  broadcastLeave:     () => Promise<void>;
} {
  const [phase,         setPhase]         = useState<SessionPhase>('idle');
  const [countdown,     setCountdown]     = useState<number | 'GO!' | null>(null);
  const [elapsed,       setElapsed]       = useState(0);
  const [isPaused,      setIsPaused]      = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<PlayerWorkoutStatus | null>(null);
  const [partnerLeft,   setPartnerLeft]   = useState(false);

  const startedAtRef        = useRef<number>(0);
  const adjustedStartAtRef  = useRef<number>(0);
  const pausedAtRef         = useRef<number>(0);
  const tickRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef            = useRef<(() => void) | null>(null);

  // ── Timer helpers ───────────────────────────────────────────────────────

  const startTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const now = Date.now();
      const sec = Math.floor((now - adjustedStartAtRef.current) / 1000);
      setElapsed(Math.min(sec, duration));
      if (sec >= duration) {
        clearInterval(tickRef.current!);
        setPhase('finished');
        broadcastSessionEvent(roomId, { type: 'finish' }).catch(() => {});
      }
    }, 500);
  }, [roomId, duration]);

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  // ── Subscribe to session events ─────────────────────────────────────────

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
        setPhase('active');
        setIsPaused(false);
        setCountdown(null);
        if (!isHost) startTick(); // host already started in hostStartCountdown
      }

      if (event.type === 'pause') {
        pausedAtRef.current = event.pausedAt;
        stopTick();
        setIsPaused(true);
        setPhase('paused');
        await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'paused' });
      }

      if (event.type === 'resume') {
        adjustedStartAtRef.current = event.adjustedStartAt;
        setIsPaused(false);
        setPhase('active');
        startTick();
        await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'working-out' });
      }

      if (event.type === 'finish') {
        stopTick();
        setPhase('finished');
      }

      if (event.type === 'status' && event.userId !== userId) {
        setPartnerStatus(event.status);
        if (event.status === 'disconnected') setPartnerLeft(true);
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

  // ── Host controls ───────────────────────────────────────────────────────

  const hostStartCountdown = useCallback(async () => {
    if (!isHost) return;

    // Broadcast countdown 3 → 2 → 1 → GO! then start
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
    setCountdown(null);
    setPhase('active');
    setIsPaused(false);

    await broadcastSessionEvent(roomId, { type: 'start', startedAt, duration, exercise });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'working-out' });
    startTick();
  }, [isHost, roomId, duration, exercise, userId, startTick]);

  const hostPause = useCallback(async () => {
    if (!isHost || isPaused) return;
    const pausedAt = Date.now();
    pausedAtRef.current = pausedAt;
    stopTick();
    setIsPaused(true);
    setPhase('paused');
    await broadcastSessionEvent(roomId, { type: 'pause', pausedAt });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'paused' });
  }, [isHost, isPaused, roomId, userId, stopTick]);

  const hostResume = useCallback(async () => {
    if (!isHost || !isPaused) return;
    const pausedDuration = Date.now() - pausedAtRef.current;
    const adjustedStartAt = adjustedStartAtRef.current + pausedDuration;
    adjustedStartAtRef.current = adjustedStartAt;
    setIsPaused(false);
    setPhase('active');
    await broadcastSessionEvent(roomId, { type: 'resume', resumedAt: Date.now(), adjustedStartAt });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'working-out' });
    startTick();
  }, [isHost, isPaused, roomId, userId, startTick]);

  const broadcastLeave = useCallback(async () => {
    stopTick();
    await broadcastSessionEvent(roomId, { type: 'leave', userId });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'disconnected' });
  }, [roomId, userId, stopTick]);

  const remaining = Math.max(0, duration - elapsed);

  return {
    phase, countdown, elapsed, duration, remaining,
    isPaused, partnerStatus, partnerLeft,
    hostStartCountdown, hostPause, hostResume, broadcastLeave,
  };
}
