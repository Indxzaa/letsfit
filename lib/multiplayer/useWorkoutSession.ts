'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  subscribeSessionEvents, broadcastSessionEvent,
  type SessionPhase, type PlayerWorkoutStatus,
} from './workoutSession';

export interface RoundResult {
  userId:          string;
  reps:            number;
  completionTimeMs: number;
}

export interface BattleScore {
  wins:    number;
  totalMs: number;
}

export interface WorkoutSessionState {
  phase:            SessionPhase;
  countdown:        number | 'GO!' | null;
  elapsed:          number;
  isPaused:         boolean;
  currentExercise:  string;
  repGoal:          number;
  roundIndex:       number;
  roundResults:     { a: RoundResult | null; b: RoundResult | null };
  myRoundDone:      boolean;
  partnerRoundDone: boolean;
  partnerLeft:      boolean;
  // Battle-mode scoreboard
  myScore:          BattleScore;
  partnerScore:     BattleScore;
  battleFinished:   boolean;
  battleWinnerId:   string | null;
}

export function useWorkoutSession(
  roomId:          string,
  userId:          string,
  isHost:          boolean,
  initialExercise: string,
  initialRepGoal:  number,
  gameMode:        'freestyle' | 'battle',
  totalBattleRounds: number,
): WorkoutSessionState & {
  hostStartCountdown:    (exercise: string, repGoal: number) => Promise<void>;
  hostSelectExercise:    (exercise: string) => Promise<void>;
  signalRoundFinished:   (reps: number) => Promise<void>;
  hostPause:             () => Promise<void>;
  hostResume:            () => Promise<void>;
  broadcastLeave:        () => Promise<void>;
} {
  const [phase,            setPhase]            = useState<SessionPhase>('selecting');
  const [countdown,        setCountdown]        = useState<number | 'GO!' | null>(null);
  const [elapsed,          setElapsed]          = useState(0);
  const [isPaused,         setIsPaused]         = useState(false);
  const [currentExercise,  setCurrentExercise]  = useState(initialExercise);
  const [repGoal,          setRepGoal]          = useState(initialRepGoal);
  const [roundIndex,       setRoundIndex]       = useState(0);
  const [roundResults,     setRoundResults]     = useState<{ a: RoundResult | null; b: RoundResult | null }>({ a: null, b: null });
  const [myRoundDone,      setMyRoundDone]      = useState(false);
  const [partnerRoundDone, setPartnerRoundDone] = useState(false);
  const [partnerLeft,      setPartnerLeft]      = useState(false);
  const [myScore,          setMyScore]          = useState<BattleScore>({ wins: 0, totalMs: 0 });
  const [partnerScore,     setPartnerScore]     = useState<BattleScore>({ wins: 0, totalMs: 0 });
  const [battleFinished,   setBattleFinished]   = useState(false);
  const [battleWinnerId,   setBattleWinnerId]   = useState<string | null>(null);

  const startedAtRef        = useRef<number>(0);
  const adjustedStartAtRef  = useRef<number>(0);
  const pausedAtRef         = useRef<number>(0);
  const roundIndexRef       = useRef<number>(0);
  const tickRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  const myFinishRef      = useRef<RoundResult | null>(null);
  const partnerFinishRef = useRef<RoundResult | null>(null);
  const myScoreRef       = useRef<BattleScore>({ wins: 0, totalMs: 0 });
  const partnerScoreRef  = useRef<BattleScore>({ wins: 0, totalMs: 0 });

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
        setRepGoal(event.repGoal);
        setPhase('active');
        setIsPaused(false);
        setCountdown(null);
        resetRound();
        if (!isHost) startTick();
      }

      if (event.type === 'exercise_change') {
        // Freestyle: next exercise selected by host
        setCurrentExercise(event.exercise);
        setRepGoal(event.repGoal);
        setRoundIndex(event.roundIndex);
        roundIndexRef.current = event.roundIndex;
        setPhase('selecting');
      }

      if (event.type === 'exercise_selected') {
        setCurrentExercise(event.exercise);
        setPhase('selecting');
      }

      if (event.type === 'round_finish') {
        const finishMs = event.completionTimeMs;
        const finish: RoundResult = { userId: event.userId, reps: event.reps, completionTimeMs: finishMs };
        if (event.userId === userId) {
          myFinishRef.current = finish;
          setMyRoundDone(true);
        } else {
          partnerFinishRef.current = finish;
          setPartnerRoundDone(true);
        }

        if (isHost && myFinishRef.current && partnerFinishRef.current) {
          stopTick();
          const a = myFinishRef.current;
          const b = partnerFinishRef.current;

          // Determine round winner for battle mode
          let winnerId: string | null = null;
          if (gameMode === 'battle') {
            if (a.completionTimeMs < b.completionTimeMs) {
              winnerId = a.userId;
            } else if (b.completionTimeMs < a.completionTimeMs) {
              winnerId = b.userId;
            }
            // Update scores
            const newMyScore   = { ...myScoreRef.current };
            const newPartScore = { ...partnerScoreRef.current };
            if (winnerId === userId) {
              newMyScore.wins++;
              newMyScore.totalMs += a.completionTimeMs;
            } else if (winnerId !== null) {
              newPartScore.wins++;
              newPartScore.totalMs += b.completionTimeMs;
            } else {
              newMyScore.totalMs   += a.completionTimeMs;
              newPartScore.totalMs += b.completionTimeMs;
            }
            myScoreRef.current      = newMyScore;
            partnerScoreRef.current = newPartScore;
          }

          await broadcastSessionEvent(roomId, { type: 'round_complete', playerA: a, playerB: b, winnerId });

          // Battle: check if all rounds done
          const nextRound = roundIndexRef.current + 1;
          if (gameMode === 'battle' && nextRound >= totalBattleRounds) {
            const myW = myScoreRef.current;
            const pW  = partnerScoreRef.current;
            let battleWinner: string | null = null;
            if (myW.wins > pW.wins) battleWinner = userId;
            else if (pW.wins > myW.wins) battleWinner = b.userId;
            else if (myW.totalMs < pW.totalMs) battleWinner = userId;
            else if (pW.totalMs < myW.totalMs) battleWinner = b.userId;
            await broadcastSessionEvent(roomId, {
              type: 'battle_result',
              winnerId: battleWinner,
              playerA: { userId: a.userId, ...myW },
              playerB: { userId: b.userId, ...pW },
            });
          }
        }
      }

      if (event.type === 'round_complete') {
        stopTick();
        setPhase('round_complete');
        setRoundResults({ a: event.playerA, b: event.playerB });
        const nextRound = roundIndexRef.current + 1;
        roundIndexRef.current = nextRound;
        setRoundIndex(nextRound);
        // Sync scores from round_complete for non-host
        if (!isHost && event.winnerId) {
          if (event.winnerId === userId) {
            setMyScore(s => ({ wins: s.wins + 1, totalMs: s.totalMs + (event.playerA.userId === userId ? event.playerA.completionTimeMs : event.playerB.completionTimeMs) }));
          } else {
            setPartnerScore(s => ({ wins: s.wins + 1, totalMs: s.totalMs + (event.playerA.userId !== userId ? event.playerA.completionTimeMs : event.playerB.completionTimeMs) }));
          }
        }
      }

      if (event.type === 'battle_result') {
        setBattleFinished(true);
        setBattleWinnerId(event.winnerId);
        setPhase('round_complete');
        if (event.playerA.userId === userId) {
          setMyScore({ wins: event.playerA.wins, totalMs: event.playerA.totalMs });
          setPartnerScore({ wins: event.playerB.wins, totalMs: event.playerB.totalMs });
        } else {
          setMyScore({ wins: event.playerB.wins, totalMs: event.playerB.totalMs });
          setPartnerScore({ wins: event.playerA.wins, totalMs: event.playerA.totalMs });
        }
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
        if (isHost && myFinishRef.current && !partnerFinishRef.current) {
          const selfResult = myFinishRef.current;
          await broadcastSessionEvent(roomId, {
            type: 'round_complete',
            playerA: selfResult,
            playerB: { userId: 'partner', reps: 0, completionTimeMs: 0 },
            winnerId: selfResult.userId,
          });
        }
      }
    });

    return () => { stopTick(); unsub(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ── Host actions ──────────────────────────────────────────────────────

  const hostStartCountdown = useCallback(async (exercise: string, rGoal: number) => {
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
    setRepGoal(rGoal);
    setPhase('active');
    setCountdown(null);
    setIsPaused(false);
    resetRound();

    await broadcastSessionEvent(roomId, { type: 'start', startedAt, exercise, repGoal: rGoal });
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
    const completionTimeMs = Date.now() - startedAtRef.current;
    const finish: RoundResult = { userId, reps, completionTimeMs };
    myFinishRef.current = finish;
    setMyRoundDone(true);
    await broadcastSessionEvent(roomId, { type: 'round_finish', userId, reps, completionTimeMs });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'round-finished' });

    if (isHost && partnerFinishRef.current) {
      stopTick();
      const b = partnerFinishRef.current;
      let winnerId: string | null = null;
      if (gameMode === 'battle') {
        winnerId = completionTimeMs < b.completionTimeMs ? userId : b.userId;
      }
      await broadcastSessionEvent(roomId, {
        type: 'round_complete',
        playerA: finish,
        playerB: b,
        winnerId,
      });
    }
  }, [roomId, userId, isHost, gameMode, stopTick]);

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
    await broadcastSessionEvent(roomId, { type: 'leave',  userId });
    await broadcastSessionEvent(roomId, { type: 'status', userId, status: 'disconnected' });
  }, [roomId, userId, stopTick]);

  return {
    phase, countdown, elapsed, isPaused, currentExercise, repGoal, roundIndex,
    roundResults, myRoundDone, partnerRoundDone, partnerLeft,
    myScore, partnerScore, battleFinished, battleWinnerId,
    hostStartCountdown, hostSelectExercise, signalRoundFinished,
    hostPause, hostResume, broadcastLeave,
  };
}
