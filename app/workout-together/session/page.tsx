'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Square, Mic, MicOff, Video, VideoOff, Pause, Play,
  Wifi, WifiOff, Loader2, AlertCircle, RefreshCw, Plus,
  User, UserCircle2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useWebRTC } from '@/lib/multiplayer/useWebRTC';
import { useWorkoutSession } from '@/lib/multiplayer/useWorkoutSession';
import { EXERCISE_LABELS } from '@/lib/multiplayer/constants';
import type { PeerConnectionState } from '@/lib/multiplayer/webrtc';

// ── Helpers ───────────────────────────────────────────────────────────────

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

// ── VideoEl ───────────────────────────────────────────────────────────────

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

// ── MediaDeniedGate ───────────────────────────────────────────────────────

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

// ── CameraPanel ───────────────────────────────────────────────────────────

function CameraPanel({ label, stream, isLocal, accent, peerState, controls }: {
  label: string; stream: MediaStream | null; isLocal: boolean;
  accent: string; peerState?: PeerConnectionState; controls?: React.ReactNode;
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
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/85">
              {connLabel(peerState)}
            </span>
          </div>
        )}
      </div>
      <div className="relative flex-1 min-h-44 bg-black">
        {hasVideo
          ? <VideoEl stream={stream} muted={isLocal} mirror={isLocal} />
          : (
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

// ── CtrlBtn ───────────────────────────────────────────────────────────────

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

// ── Countdown overlay ─────────────────────────────────────────────────────

function CountdownOverlay({ value }: { value: number | 'GO!' | null }) {
  if (value === null) return null;
  const isGo = value === 'GO!';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: isGo ? 'rgba(34,197,94,0.12)' : 'rgba(0,0,0,0.55)' }}>
      <AnimatePresence mode="wait">
        <motion.div key={String(value)}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="font-display font-black text-white text-center"
          style={{
            fontSize: isGo ? 'clamp(4rem,18vw,8rem)' : 'clamp(7rem,28vw,14rem)',
            color: isGo ? '#22c55e' : '#fff',
            textShadow: isGo ? '0 0 40px rgba(34,197,94,0.6)' : '0 4px 16px rgba(0,0,0,0.8)',
          }}>
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Partner left overlay ──────────────────────────────────────────────────

function PartnerLeftOverlay({ onContinue, onLobby }: {
  onContinue: () => void; onLobby: () => void;
}) {
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
            Your workout partner disconnected. You can continue alone or return to the lobby.
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
  const router   = useRouter();
  const params   = useSearchParams();
  const roomId   = params.get('roomId')   ?? '';
  const exercise = params.get('exercise') ?? 'squat';
  const duration = Number(params.get('duration') ?? 60);
  const mode     = params.get('mode')     ?? 'join';
  const label    = EXERCISE_LABELS[exercise] ?? exercise;

  const { user } = useAuth();
  const isHost   = mode === 'create';

  const [myReps,              setMyReps]              = useState(0);
  const [repFlash,            setRepFlash]            = useState(false);
  const [dismissedPartnerLeft,setDismissedPartnerLeft]= useState(false);

  // WebRTC video
  const enabled = !!(roomId && user?.id);
  const {
    localStream, remoteStream, peerState,
    muted, videoOff, mediaError,
    toggleMute, toggleVideo, hangUp, retryMedia,
  } = useWebRTC(roomId, user?.id ?? '', isHost, enabled);

  // Synchronized workout session
  const {
    phase, countdown, remaining, isPaused, partnerLeft,
    hostStartCountdown, hostPause, hostResume, broadcastLeave,
  } = useWorkoutSession(roomId, user?.id ?? '', isHost, exercise, duration);

  // Host auto-starts countdown on mount
  useEffect(() => {
    if (isHost && phase === 'idle') hostStartCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRep = () => {
    setMyReps(r => r + 1);
    setRepFlash(true);
    setTimeout(() => setRepFlash(false), 200);
  };

  const handleStop = async () => {
    await broadcastLeave();
    hangUp();
    router.push(`/workout-together/results?exercise=${exercise}&myReps=${myReps}&friendReps=0`);
  };

  if (peerState === 'media-denied' && mediaError) {
    return <MediaDeniedGate error={mediaError} onRetry={retryMedia} />;
  }

  const pColor    = connColor(peerState);
  const timeLabel = (phase === 'active' || phase === 'paused')
    ? fmt(remaining)
    : phase === 'finished' ? '0:00' : '--:--';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--neo-black)' }}>
      <CountdownOverlay value={countdown} />

      {partnerLeft && !dismissedPartnerLeft && (
        <PartnerLeftOverlay
          onContinue={() => setDismissedPartnerLeft(true)}
          onLobby={async () => {
            await broadcastLeave(); hangUp();
            router.push(`/workout-together/lobby?roomId=${roomId}&mode=${mode}`);
          }}
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
            {timeLabel}
          </div>
          {isPaused && <div className="text-[9px] font-bold uppercase text-amber-400 animate-pulse">Paused</div>}
        </div>
        <div className="flex items-center justify-end gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: pColor }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: pColor }}>{connLabel(peerState)}</span>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-2 font-display font-black uppercase tracking-wider text-xs cursor-pointer"
            style={{ background: '#dc2626', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', borderRadius: 0 }}>
            <Square className="w-3 h-3" /> Stop
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      {(phase === 'active' || phase === 'paused') && duration > 0 && (
        <div style={{ height: 4, background: '#1a1a1a' }}>
          <motion.div animate={{ width: `${((duration - remaining) / duration) * 100}%` }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{ height: '100%', background: isPaused ? '#d97706' : 'var(--neo-accent)' }} />
        </div>
      )}

      {/* Camera panels */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-6">

        {/* You */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }} className="flex flex-col">
          <CameraPanel label="You" stream={localStream} isLocal accent="var(--neo-accent)"
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
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Your Reps</div>
              <motion.div key={myReps} initial={{ scale: repFlash ? 1.3 : 1 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                className="font-display font-black tabular-nums"
                style={{ fontSize: '2.4rem', color: repFlash ? 'var(--neo-accent)' : '#fff', lineHeight: 1 }}>
                {myReps}
              </motion.div>
            </div>
            <motion.button whileHover={{ y: -3 }} whileTap={{ y: 2, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              onClick={addRep} disabled={phase !== 'active'}
              className="flex items-center gap-2 px-5 py-3 font-display font-black uppercase tracking-wider text-sm cursor-pointer text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--neo-accent)', border: '3px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 0 }}>
              <Plus className="w-4 h-4" /> Rep
            </motion.button>
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
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Friend's Reps</div>
              <div className="font-display font-black tabular-nums"
                style={{ fontSize: '2.4rem', color: '#fff', lineHeight: 1 }}>—</div>
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
