'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Square, Mic, MicOff, Video, VideoOff, Pause, Play,
  Wifi, WifiOff, Loader2, AlertCircle, RefreshCw,
  User, UserCircle2, CheckCircle2, Trophy, Zap,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useWebRTC } from '@/lib/multiplayer/useWebRTC';
import { useWorkoutSession } from '@/lib/multiplayer/useWorkoutSession';
import { useMultiplayerWorkoutSync } from '@/hooks/multiplayer/useMultiplayerWorkoutSync';
import { EXERCISE_LABELS, MULTIPLAYER_EXERCISES } from '@/lib/multiplayer/constants';
import type { PeerConnectionState } from '@/lib/multiplayer/webrtc';

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function connLabel(s: PeerConnectionState): string {
  if (s === 'connected')    return 'Connected';
  if (s === 'connecting' || s === 'requesting-media') return 'Connecting…';
  if (s === 'reconnecting') return 'Reconnecting…';
  if (s === 'failed')       return 'Failed';
  if (s === 'disconnected') return 'Disconnected';
  if (s === 'media-denied') return 'Camera denied';
  return 'Initialising…';
}

function connColor(s: PeerConnectionState): string {
  if (s === 'connected')  return '#22c55e';
  if (['connecting','reconnecting','requesting-media'].includes(s)) return '#d97706';
  return '#ef4444';
}

function VideoEl({ stream, muted = false, mirror = false }: {
  stream: MediaStream | null; muted?: boolean; mirror?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
      if (stream) ref.current.play().catch(() => {});
    }
  }, [stream]);
  return (
    <video ref={ref} autoPlay playsInline muted={muted}
      className="w-full h-full object-cover"
      style={{ transform: mirror ? 'scaleX(-1)' : undefined }} />
  );
}

function MediaDeniedGate({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--neo-black)' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }} className="w-full max-w-md"
        style={{ background: '#1a0a0a', border: '4px solid #ef4444', boxShadow: '6px 6px 0 #ef4444', borderRadius: 0 }}>
        <div style={{ height: 6, background: '#ef4444' }} />
        <div className="p-8 text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(239,68,68,0.15)', border: '3px solid #ef4444', boxShadow: '3px 3px 0 #ef4444', borderRadius: 0 }}>
            <VideoOff className="w-10 h-10" style={{ color: '#ef4444' }} />
          </div>
          <h2 className="font-display text-3xl font-bold text-white uppercase mb-3">Camera Required</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>{error}</p>
          <motion.button whileHover={{ y: -3 }} whileTap={{ y: 2, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={onRetry}
            className="flex items-center gap-2 mx-auto px-8 py-3.5 font-display font-black uppercase tracking-widest text-sm cursor-pointer"
            style={{ background: '#ef4444', border: '3px solid #000', boxShadow: '4px 4px 0 #000', color: '#fff', borderRadius: 0 }}>
            <RefreshCw className="w-4 h-4" /> Retry
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// CameraPanel now accepts an optional detectionCanvas ref to overlay on the local feed
function CameraPanel({ label, stream, isLocal, accent, peerState, controls, detectionCanvasRef }: {
  label: string; stream: MediaStream | null; isLocal: boolean;
  accent: string; peerState?: PeerConnectionState; controls?: React.ReactNode;
  detectionCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
}) {
  const hasVideo = !!stream && stream.getVideoTracks().some(t => t.enabled);
  const color = peerState ? connColor(peerState) : accent;

  return (
    <div className="flex flex-col overflow-hidden"
      style={{ border: '3px solid #000', borderRadius: 0, background: '#0a0a0a' }}>
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: accent, borderBottom: '3px solid #000' }}>
        <div className="flex items-center gap-2">
          {isLocal ? <User className="w-4 h-4 text-white" /> : <UserCircle2 className="w-4 h-4 text-white" />}
          <span className="font-display text-sm font-black text-white uppercase">{label}</span>
        </div>
        {peerState && (
          <div className="flex items-center gap-1.5">
            {peerState === 'connected'
              ? <Wifi className="w-3 h-3 text-white" />
              : <WifiOff className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />}
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/85">{connLabel(peerState)}</span>
          </div>
        )}
      </div>
      <div className="relative flex-1 min-h-44 bg-black">
        {hasVideo ? (
          <>
            <VideoEl stream={stream} muted={isLocal} mirror={isLocal} />
            {/* AI skeleton overlay — only for local panel */}
            {detectionCanvasRef && (
              <canvas
                ref={detectionCanvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 flex items-center justify-center"
              style={{ background: `${color}18`, border: `2px solid ${color}40`, borderRadius: 0 }}>
              {peerState && ['connecting','requesting-media'].includes(peerState)
                ? <Loader2 className="w-7 h-7 animate-spin" style={{ color }} />
                : <VideoOff className="w-7 h-7" style={{ color }} />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {peerState ? connLabel(peerState) : 'No video'}
            </span>
          </div>
        )}
        {controls && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">{controls}</div>
        )}
      </div>
    </div>
  );
}

function CtrlBtn({ on, icon, offIcon, onToggle, label }: {
  on: boolean; icon: React.ReactNode; offIcon: React.ReactNode;
  onToggle: () => void; label: string;
}) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onToggle} title={label}
      className="flex items-center justify-center w-9 h-9 cursor-pointer"
      style={{ background: on ? 'rgba(0,0,0,0.65)' : '#ef4444', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 0, color: '#fff' }}>
      {on ? icon : offIcon}
    </motion.button>
  );
}

function CountdownOverlay({ value }: { value: number | 'GO!' | null }) {
  if (value === null) return null;
  const isGo = value === 'GO!';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: isGo ? 'rgba(34,197,94,0.15)' : 'rgba(0,0,0,0.72)' }}>
      <AnimatePresence mode="wait">
        <motion.div key={String(value)}
          initial={{ scale: 0.5, opacity: 0, rotate: -4 }}
          animate={isGo
            ? { scale: 1, opacity: 1, rotate: 0 }
            : { scale: [1, 1.06, 0.97, 1], opacity: 1, rotate: [-3, 3, -2, 0] }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={isGo
            ? { type: 'spring', stiffness: 280, damping: 18 }
            : { duration: 0.45, ease: 'easeOut' }}
          className="text-center select-none">
          {!isGo ? (
            <div className="flex items-center justify-center"
              style={{ width: 'clamp(10rem,30vw,16rem)', height: 'clamp(10rem,30vw,16rem)', background: '#fff', border: '6px solid #000', boxShadow: '8px 8px 0 #000' }}>
              <span className="font-display font-black leading-none"
                style={{ fontSize: 'clamp(6rem,20vw,10rem)', color: '#000' }}>{value}</span>
            </div>
          ) : (
            <span className="font-display font-black"
              style={{ fontSize: 'clamp(5rem,18vw,9rem)', color: '#22c55e', textShadow: '4px 4px 0 #000' }}>
              GO!
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PartnerLeftOverlay({ onContinue, onLobby }: { onContinue: () => void; onLobby: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.72)' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="w-full max-w-sm"
        style={{ background: '#111', border: '4px solid #d97706', boxShadow: '6px 6px 0 #d97706', borderRadius: 0 }}>
        <div style={{ height: 6, background: '#d97706' }} />
        <div className="p-7 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#d97706' }} />
          <h3 className="font-display text-2xl font-bold text-white uppercase mb-3">Partner Left</h3>
          <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Your workout partner disconnected.
          </p>
          <div className="flex flex-col gap-3">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onClick={onContinue}
              className="w-full py-3.5 font-display font-black uppercase tracking-widest text-sm cursor-pointer"
              style={{ background: 'var(--neo-accent)', border: '3px solid #000', boxShadow: '4px 4px 0 #000', color: '#fff', borderRadius: 0 }}>
              Continue Alone
            </motion.button>
            <button onClick={onLobby}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none' }}>
              Return to Lobby
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── SessionContent ────────────────────────────────────────────────────────

function SessionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const roomId     = params.get('roomId')      ?? '';
  const initEx     = params.get('exercise')    ?? 'squat';
  const mode       = params.get('mode')        ?? 'join';
  const gameMode   = (params.get('gameMode')   ?? 'freestyle') as 'freestyle' | 'battle';
  const battleRounds = parseInt(params.get('battleRounds') ?? '3', 10);
  const initRepGoal  = parseInt(params.get('repGoal')      ?? '10', 10);

  const { user } = useAuth();
  const isHost = mode === 'create';

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const localCanvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedExercise,     setSelectedExercise]     = useState(initEx);
  const [dismissedPartnerLeft, setDismissedPartnerLeft] = useState(false);
  const [showExit,             setShowExit]             = useState(false);
  const [repFlash,             setRepFlash]             = useState(false);
  const [startingRound,        setStartingRound]        = useState(false);
  const prevRepRef = useRef(0);

  const enabled = !!(roomId && user?.id);
  const { localStream, remoteStream, peerState, muted, videoOff, toggleMute, toggleVideo, hangUp } =
    useWebRTC(roomId, user?.id ?? '', isHost, enabled);

  const {
    phase, countdown, elapsed, isPaused, currentExercise, repGoal,
    roundIndex, roundResults, myRoundDone, partnerRoundDone, partnerLeft,
    myScore, partnerScore, battleFinished, battleWinnerId,
    hostStartCountdown, hostSelectExercise, signalRoundFinished,
    hostPause, hostResume, broadcastLeave,
  } = useWorkoutSession(roomId, user?.id ?? '', isHost, initEx, initRepGoal, gameMode, battleRounds);

  const { myReps, partnerReps, liveFormScore, feedback, cameraReady, resetReps, stopDetection } =
    useMultiplayerWorkoutSync({
      roomId, userId: user?.id ?? '', slug: currentExercise,
      isActive: phase === 'active',
      videoRef: localVideoRef, canvasRef: localCanvasRef,
    });

  const label = EXERCISE_LABELS[currentExercise] ?? currentExercise;
  const pColor = connColor(peerState);

  // Flash on new rep
  useEffect(() => {
    if (myReps > prevRepRef.current) {
      prevRepRef.current = myReps;
      setRepFlash(true);
      setTimeout(() => setRepFlash(false), 200);
    }
  }, [myReps]);

  // Freestyle: auto-signal when reps reach goal
  useEffect(() => {
    if (gameMode !== 'freestyle') return;
    if (phase !== 'active') return;
    if (myRoundDone) return;
    if (repGoal > 0 && myReps >= repGoal) {
      signalRoundFinished(myReps);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReps, repGoal, phase, myRoundDone, gameMode]);

  const handleFinishRound = async () => {
    await signalRoundFinished(myReps);
  };

  const handleNextRound = async () => {
    if (!isHost || startingRound) return;
    setStartingRound(true);
    resetReps();
    await hostStartCountdown(selectedExercise, repGoal);
    setStartingRound(false);
  };

  const handleExitConfirm = async () => {
    stopDetection();
    await broadcastLeave();
    hangUp();
    router.push('/workout-together');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--neo-black)' }}>
      <CountdownOverlay value={countdown} />

      {/* Exit confirmation */}
      <AnimatePresence>
        {showExit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className="w-full max-w-sm"
              style={{ background: '#111', border: '4px solid #dc2626', boxShadow: '6px 6px 0 #dc2626', borderRadius: 0 }}>
              <div style={{ height: 6, background: '#dc2626' }} />
              <div className="p-7 text-center">
                <h3 className="font-display text-2xl font-bold text-white uppercase mb-3">Leave Workout?</h3>
                <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Your session will end and your partner will be notified.
                </p>
                <div className="flex flex-col gap-3">
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={handleExitConfirm}
                    className="w-full py-3.5 font-display font-black uppercase tracking-widest text-sm cursor-pointer text-white"
                    style={{ background: '#dc2626', border: '3px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 0 }}>
                    Leave Workout
                  </motion.button>
                  <button onClick={() => setShowExit(false)}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    style={{ color: 'rgba(255,255,255,0.5)', background: 'transparent', border: 'none' }}>
                    Keep Going
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round Complete / Battle Finished overlay */}
      <AnimatePresence>
        {phase === 'round_complete' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.75)' }}>
            <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-md"
              style={{ background: '#0a1a0a', border: `4px solid ${battleFinished ? '#f59e0b' : '#22c55e'}`, boxShadow: `6px 6px 0 ${battleFinished ? '#f59e0b' : '#22c55e'}`, borderRadius: 0 }}>
              <div style={{ height: 6, background: battleFinished ? '#f59e0b' : '#22c55e' }} />
              <div className="p-7">
                <h3 className="font-display text-3xl font-bold text-white uppercase mb-5 text-center">
                  {battleFinished
                    ? (battleWinnerId === user?.id ? '🏆 You Win!' : '💪 Good Game!')
                    : gameMode === 'battle' ? `Round ${roundIndex} Complete` : 'Exercise Complete 🎉'}
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: 'You',    reps: roundResults.a?.reps ?? myReps,      ms: roundResults.a?.completionTimeMs, color: '#22c55e' },
                    { label: 'Friend', reps: roundResults.b?.reps ?? partnerReps, ms: roundResults.b?.completionTimeMs, color: 'var(--neo-blue)' },
                  ].map(s => (
                    <div key={s.label} className="p-4 text-center"
                      style={{ background: `${s.color}10`, border: `2px solid ${s.color}`, borderRadius: 0 }}>
                      <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                      <div className="font-display text-4xl font-black text-white">{s.reps}</div>
                      <div className="text-[9px] text-white/50 uppercase tracking-wider mt-1">reps</div>
                      {s.ms != null && s.ms > 0 && <div className="text-[9px] text-white/40 mt-0.5">{(s.ms / 1000).toFixed(1)}s</div>}
                    </div>
                  ))}
                </div>
                {gameMode === 'battle' && (
                  <div className="flex items-center justify-between px-4 py-3 mb-4"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.15)', borderRadius: 0 }}>
                    <div className="text-center">
                      <div className="font-display text-2xl font-black text-white">{myScore.wins}</div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">Your Wins</div>
                    </div>
                    <Trophy className="w-5 h-5" style={{ color: battleFinished ? '#f59e0b' : 'rgba(255,255,255,0.3)' }} />
                    <div className="text-center">
                      <div className="font-display text-2xl font-black text-white">{partnerScore.wins}</div>
                      <div className="text-[9px] text-white/40 uppercase tracking-wider">Friend&apos;s Wins</div>
                    </div>
                  </div>
                )}
                {battleFinished ? (
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={handleExitConfirm}
                    className="w-full py-4 font-display font-black uppercase tracking-widest text-sm cursor-pointer text-white"
                    style={{ background: '#f59e0b', border: '3px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 0 }}>
                    Finish &amp; Leave
                  </motion.button>
                ) : isHost ? (
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-center mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {gameMode === 'freestyle' ? 'Choose next exercise' : `Choose exercise for round ${roundIndex + 1}`}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {MULTIPLAYER_EXERCISES.map(ex => (
                        <motion.button key={ex.slug} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          onClick={() => setSelectedExercise(ex.slug)}
                          className="flex items-center gap-2 p-2.5 cursor-pointer text-left"
                          style={{ background: selectedExercise === ex.slug ? '#22c55e' : 'rgba(255,255,255,0.06)', border: `2px solid ${selectedExercise === ex.slug ? '#000' : 'rgba(255,255,255,0.15)'}`, boxShadow: selectedExercise === ex.slug ? '3px 3px 0 #000' : 'none', borderRadius: 0 }}>
                          <span className="text-base">{ex.emoji}</span>
                          <span className="font-display text-xs font-bold uppercase" style={{ color: selectedExercise === ex.slug ? '#fff' : 'rgba(255,255,255,0.8)' }}>{ex.name}</span>
                        </motion.button>
                      ))}
                    </div>
                    <motion.button whileHover={!startingRound ? { y: -3 } : undefined} whileTap={!startingRound ? { y: 2, scale: 0.97 } : undefined}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      onClick={handleNextRound} disabled={startingRound}
                      className="w-full py-4 font-display font-black uppercase tracking-widest text-sm cursor-pointer text-white flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: '#22c55e', border: '3px solid #000', boxShadow: startingRound ? 'none' : '4px 4px 0 #000', borderRadius: 0 }}>
                      {startingRound
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                        : gameMode === 'freestyle' ? 'Next Exercise →' : `Start Round ${roundIndex + 1} →`}
                    </motion.button>
                  </div>
                ) : (
                  <p className="text-center text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Waiting for host…</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partner left */}
      {partnerLeft && !dismissedPartnerLeft && (
        <PartnerLeftOverlay
          onContinue={() => setDismissedPartnerLeft(true)}
          onLobby={async () => { await broadcastLeave(); hangUp(); router.push(`/workout-together/lobby?roomId=${roomId}&mode=${mode}`); }}
        />
      )}

      {/* Top HUD */}
      <div className="sticky top-0 z-30 grid grid-cols-3 items-center px-4 sm:px-6 py-3"
        style={{ background: '#0a0a0a', borderBottom: '3px solid var(--neo-accent)' }}>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Exercise</div>
          <div className="font-display text-sm font-bold text-white uppercase truncate">{label}</div>
        </div>
        <div className="text-center">
          <div className="font-display font-black tabular-nums"
            style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', color: isPaused ? '#d97706' : 'var(--neo-accent)' }}>
            {fmt(elapsed)}
          </div>
          {repGoal > 0 && (
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Goal: {repGoal} reps
            </div>
          )}
          {isPaused && <div className="text-[9px] font-bold uppercase text-amber-400 animate-pulse">Paused</div>}
        </div>
        <div className="flex items-center justify-end gap-2">
          {gameMode === 'battle' && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 0 }}>
              <span className="font-display text-xs font-black text-white">{myScore.wins}</span>
              <span className="text-[8px] text-white/30 mx-1">vs</span>
              <span className="font-display text-xs font-black text-white">{partnerScore.wins}</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: pColor }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: pColor }}>{connLabel(peerState)}</span>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
            onClick={() => setShowExit(true)}
            className="flex items-center gap-1.5 px-3 py-2 font-display font-black uppercase tracking-wider text-xs cursor-pointer"
            style={{ background: '#dc2626', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', borderRadius: 0 }}>
            <Square className="w-3 h-3" /> Exit
          </motion.button>
        </div>
      </div>

      {/* Feedback strip */}
      {phase === 'active' && (
        <div className="px-4 sm:px-6 py-2 flex items-center justify-between"
          style={{ background: '#0d0d0d', borderBottom: '2px solid #1a1a1a' }}>
          <div className="flex items-center gap-2">
            <div className="font-display text-sm font-black text-white uppercase tabular-nums">{myReps}</div>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>you</span>
          </div>
          <AnimatePresence mode="wait">
            {myReps > partnerReps + 2 ? (
              <motion.div key="ahead" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="px-3 py-1 font-display text-[10px] font-black uppercase tracking-wider text-white"
                style={{ background: gameMode === 'battle' ? '#f59e0b' : '#22c55e', border: '2px solid #000', borderRadius: 0 }}>
                {gameMode === 'battle' ? 'You\'re winning 🏆' : 'You\'re ahead 🔥'}
              </motion.div>
            ) : partnerReps > myReps + 2 ? (
              <motion.div key="behind" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="px-3 py-1 font-display text-[10px] font-black uppercase tracking-wider text-white"
                style={{ background: '#d97706', border: '2px solid #000', borderRadius: 0 }}>
                Keep pushing 💪
              </motion.div>
            ) : (
              <motion.div key="even" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="px-3 py-1 font-display text-[10px] font-black uppercase tracking-wider"
                style={{ background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 0 }}>
                Even pace ⚡
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>partner</span>
            <div className="font-display text-sm font-black text-white uppercase tabular-nums">{partnerReps}</div>
          </div>
        </div>
      )}

      {/* Camera panels */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-6">
        {/* You — detection canvas overlaid on WebRTC video */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }} className="flex flex-col">
          <CameraPanel label="You" stream={localStream} isLocal accent="var(--neo-accent)"
            detectionCanvasRef={localCanvasRef}
            controls={
              <>
                <CtrlBtn on={!muted}    icon={<Mic className="w-4 h-4" />}   offIcon={<MicOff className="w-4 h-4" />}   onToggle={toggleMute}  label="Mute" />
                <CtrlBtn on={!videoOff} icon={<Video className="w-4 h-4" />} offIcon={<VideoOff className="w-4 h-4" />} onToggle={toggleVideo} label="Camera" />
                {isHost && (phase === 'active' || phase === 'paused') && (
                  <CtrlBtn on={!isPaused} icon={<Pause className="w-4 h-4" />} offIcon={<Play className="w-4 h-4" />}
                    onToggle={isPaused ? hostResume : hostPause} label="Pause" />
                )}
              </>
            }
          />
          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: '#111', border: '3px solid #000', borderTop: 'none' }}>
            <div className="flex-1">
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Your Reps</div>
              <motion.div key={myReps}
                initial={{ scale: repFlash ? 1.3 : 1 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                className="font-display font-black tabular-nums"
                style={{ fontSize: '2.4rem', color: repFlash ? 'var(--neo-accent)' : '#fff', lineHeight: 1 }}>
                {myReps}
              </motion.div>
              {repGoal > 0 && (
                <div className="mt-0.5 w-full h-1.5" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 0 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (myReps / repGoal) * 100)}%`, background: myReps >= repGoal ? '#22c55e' : 'var(--neo-accent)', transition: 'width 0.3s ease' }} />
                </div>
              )}
              {liveFormScore > 0 && (
                <div className="mt-1 text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: liveFormScore >= 80 ? '#22c55e' : liveFormScore >= 50 ? '#d97706' : '#ef4444' }}>
                  Form {liveFormScore}% · {feedback}
                </div>
              )}
            </div>
            {phase === 'active' && !myRoundDone && gameMode === 'battle' ? (
              <motion.button whileHover={{ y: -3 }} whileTap={{ y: 2, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={handleFinishRound}
                className="px-4 py-3 font-display font-black uppercase tracking-wider text-xs cursor-pointer text-white flex-shrink-0"
                style={{ background: '#22c55e', border: '3px solid #000', boxShadow: '3px 3px 0 #000', borderRadius: 0 }}>
                Done ✓
              </motion.button>
            ) : myRoundDone ? (
              <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="px-3 py-2 text-[10px] font-black uppercase tracking-wider flex-shrink-0 flex items-center gap-1.5"
                style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e', color: '#22c55e', borderRadius: 0 }}>
                {partnerRoundDone
                  ? <><CheckCircle2 className="w-3 h-3" /> Both Done!</>
                  : <><Loader2 className="w-3 h-3 animate-spin" /> Waiting…</>}
              </motion.div>
            ) : (
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider"
                style={{ background: cameraReady ? 'rgba(34,197,94,0.1)' : '#1a1a1a', border: `2px solid ${cameraReady ? '#22c55e' : 'rgba(255,255,255,0.15)'}`, color: cameraReady ? '#22c55e' : 'rgba(255,255,255,0.4)', borderRadius: 0 }}>
                {cameraReady ? 'AI Active' : <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
            )}
          </div>
        </motion.div>

        {/* Friend */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }} className="flex flex-col">
          <CameraPanel label="Friend" stream={remoteStream} isLocal={false}
            accent="var(--neo-blue)" peerState={peerState} />
          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: '#111', border: '3px solid #000', borderTop: 'none' }}>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Friend&apos;s Reps</div>
              <AnimatePresence mode="wait">
                <motion.div key={partnerReps}
                  initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="font-display font-black tabular-nums"
                  style={{ fontSize: '2.4rem', color: '#fff', lineHeight: 1 }}>
                  {partnerReps}
                </motion.div>
              </AnimatePresence>
              {repGoal > 0 && (
                <div className="mt-0.5 w-32 h-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (partnerReps / repGoal) * 100)}%`, background: partnerReps >= repGoal ? '#22c55e' : 'var(--neo-blue)', transition: 'width 0.3s ease' }} />
                </div>
              )}
              {partnerRoundDone && (
                <div className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: '#22c55e' }}>Finished!</div>
              )}
            </div>
            <div className="px-3 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"
              style={{ background: '#1a1a2a', border: `2px solid ${pColor}`, color: pColor, borderRadius: 0 }}>
              {peerState === 'connected'
                ? <Wifi className="w-3.5 h-3.5" />
                : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {connLabel(peerState)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hidden video — MediaPipe reads from this, canvas overlay shows on CameraPanel */}
      <video ref={localVideoRef} className="hidden" playsInline muted />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--neo-black)' }} />}>
      <SessionContent />
    </Suspense>
  );
}