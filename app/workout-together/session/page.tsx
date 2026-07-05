'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Square, Mic, MicOff, Video, VideoOff,
  Wifi, WifiOff, Loader2, AlertCircle, RefreshCw, Plus, User, UserCircle2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useWebRTC } from '@/lib/multiplayer/useWebRTC';
import { EXERCISE_LABELS, MOCK_FRIEND_REP_INTERVAL_MS } from '@/lib/multiplayer/constants';
import type { PeerConnectionState } from '@/lib/multiplayer/webrtc';

// ── Helpers ───────────────────────────────────────────────────────────────

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function stateLabel(s: PeerConnectionState): string {
  if (s === 'idle')             return 'Initialising…';
  if (s === 'requesting-media') return 'Requesting camera…';
  if (s === 'media-denied')     return 'Camera denied';
  if (s === 'connecting')       return 'Connecting…';
  if (s === 'connected')        return 'Connected';
  if (s === 'reconnecting')     return 'Reconnecting…';
  if (s === 'disconnected')     return 'Disconnected';
  if (s === 'failed')           return 'Connection failed';
  return 'Unknown';
}

function stateColor(s: PeerConnectionState): string {
  if (s === 'connected')    return '#22c55e';
  if (s === 'connecting' || s === 'reconnecting' || s === 'requesting-media') return '#d97706';
  if (s === 'failed' || s === 'disconnected' || s === 'media-denied') return '#ef4444';
  return 'rgba(255,255,255,0.4)';
}

// ── VideoEl — mounts a MediaStream onto a <video> element ─────────────────

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
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className="w-full h-full object-cover"
      style={{ transform: mirror ? 'scaleX(-1)' : undefined }}
    />
  );
}

// ── Permission denied gate ────────────────────────────────────────────────

function MediaDeniedGate({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--neo-black)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="w-full max-w-md"
        style={{ background: '#1a0a0a', border: '4px solid #ef4444', boxShadow: '6px 6px 0 #ef4444', borderRadius: 0 }}
      >
        <div style={{ height: 6, background: '#ef4444' }} />
        <div className="p-8 text-center">
          <div
            className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(239,68,68,0.15)', border: '3px solid #ef4444', boxShadow: '3px 3px 0 #ef4444', borderRadius: 0 }}
          >
            <VideoOff className="w-10 h-10" style={{ color: '#ef4444' }} />
          </div>
          <h2 className="font-display text-3xl font-bold text-white uppercase mb-3">Camera Required</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {error}
          </p>
          <motion.button
            whileHover={{ y: -3 }} whileTap={{ y: 2, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={onRetry}
            className="flex items-center gap-2 mx-auto px-8 py-3.5 font-display font-black uppercase tracking-widest text-sm cursor-pointer"
            style={{ background: '#ef4444', border: '3px solid #000', boxShadow: '4px 4px 0 #000', color: '#fff', borderRadius: 0 }}
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Camera panel ──────────────────────────────────────────────────────────

function CameraPanel({
  label, stream, isLocal, accentColor, connectionState, controls,
}: {
  label: string;
  stream: MediaStream | null;
  isLocal: boolean;
  accentColor: string;
  connectionState?: PeerConnectionState;
  controls?: React.ReactNode;
}) {
  const color = connectionState ? stateColor(connectionState) : accentColor;
  const hasVideo = !!stream && stream.getVideoTracks().length > 0;

  return (
    <div className="flex flex-col overflow-hidden" style={{ border: '3px solid #000', borderRadius: 0, background: '#0a0a0a' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: accentColor, borderBottom: '3px solid #000' }}
      >
        <div className="flex items-center gap-2">
          {isLocal
            ? <User className="w-4 h-4 text-white" />
            : <UserCircle2 className="w-4 h-4 text-white" />}
          <span className="font-display text-sm font-black text-white uppercase">{label}</span>
        </div>
        {connectionState && (
          <div className="flex items-center gap-1.5">
            {connectionState === 'connected'
              ? <Wifi className="w-3 h-3" style={{ color: '#fff' }} />
              : <WifiOff className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />}
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {stateLabel(connectionState)}
            </span>
          </div>
        )}
      </div>

      {/* Video area */}
      <div className="relative flex-1 min-h-44 bg-black">
        {hasVideo ? (
          <VideoEl stream={stream} muted={isLocal} mirror={isLocal} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="w-14 h-14 flex items-center justify-center"
              style={{ background: `${color}18`, border: `2px solid ${color}40`, borderRadius: 0 }}
            >
              {connectionState && ['connecting','requesting-media'].includes(connectionState)
                ? <Loader2 className="w-7 h-7 animate-spin" style={{ color }} />
                : <VideoOff className="w-7 h-7" style={{ color }} />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {connectionState ? stateLabel(connectionState) : 'No video'}
            </span>
          </div>
        )}
        {controls && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-3">
            {controls}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Control button ────────────────────────────────────────────────────────

function CtrlBtn({ on, icon, offIcon, onToggle, label }: {
  on: boolean; icon: React.ReactNode; offIcon: React.ReactNode;
  onToggle: () => void; label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      title={label}
      className="flex items-center justify-center w-9 h-9 cursor-pointer"
      style={{
        background: on ? 'rgba(0,0,0,0.65)' : '#ef4444',
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: 0,
        color: '#fff',
      }}
    >
      {on ? icon : offIcon}
    </motion.button>
  );
}

// ── SessionContent ────────────────────────────────────────────────────────

function SessionContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const exercise = params.get('exercise') ?? 'squat';
  const roomId   = params.get('roomId')   ?? '';
  const mode     = params.get('mode')     ?? 'join';
  const label    = EXERCISE_LABELS[exercise] ?? exercise;

  const { user } = useAuth();
  const isHost = mode === 'create';

  const [elapsed,    setElapsed]    = useState(0);
  const [myReps,     setMyReps]     = useState(0);
  const [friendReps, setFriendReps] = useState(0);
  const [repFlash,   setRepFlash]   = useState(false);

  const enabled = !!(roomId && user?.id);
  const {
    localStream, remoteStream, peerState,
    muted, videoOff, mediaError,
    toggleMute, toggleVideo, hangUp, retryMedia,
  } = useWebRTC(roomId, user?.id ?? '', isHost, enabled);

  useEffect(() => {
    const id = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFriendReps(r => r + 1), MOCK_FRIEND_REP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const addRep = () => {
    setMyReps(r => r + 1);
    setRepFlash(true);
    setTimeout(() => setRepFlash(false), 200);
  };

  const handleStop = () => {
    hangUp();
    router.push(`/workout-together/results?exercise=${exercise}&myReps=${myReps}&friendReps=${friendReps}`);
  };

  if (peerState === 'media-denied' && mediaError) {
    return <MediaDeniedGate error={mediaError} onRetry={retryMedia} />;
  }

  const leading   = myReps >= friendReps;
  const connColor = stateColor(peerState);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--neo-black)' }}>

      {/* Top HUD */}
      <div
        className="sticky top-0 z-30 grid grid-cols-3 items-center px-4 sm:px-6 py-3"
        style={{ background: '#0a0a0a', borderBottom: '3px solid var(--neo-accent)' }}
      >
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Exercise</div>
          <div className="font-display text-sm font-bold text-white uppercase truncate">{label}</div>
        </div>
        <div className="text-center">
          <div className="font-display font-black tabular-nums" style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', color: 'var(--neo-accent)' }}>
            {fmt(elapsed)}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: connColor }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: connColor }}>
              {stateLabel(peerState)}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-2 font-display font-black uppercase tracking-wider text-xs cursor-pointer"
            style={{ background: '#dc2626', border: '3px solid #000', boxShadow: '3px 3px 0 #000', color: '#fff', borderRadius: 0 }}
          >
            <Square className="w-3 h-3" /> Stop
          </motion.button>
        </div>
      </div>

      {/* Score bar */}
      <div className="px-4 sm:px-6 py-2 flex items-center justify-between gap-4"
        style={{ background: '#111', borderBottom: '2px solid #222' }}>
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-black text-white uppercase">You</span>
          <span className="font-display text-2xl font-black tabular-nums" style={{ color: 'var(--neo-accent)' }}>{myReps}</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1"
          style={{ background: leading ? 'var(--neo-accent)' : '#dc2626', border: '2px solid #000', color: '#fff', borderRadius: 0 }}>
          {leading ? 'Leading 🔥' : 'Behind 💪'}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-black tabular-nums" style={{ color: 'var(--neo-blue)' }}>{friendReps}</span>
          <span className="font-display text-sm font-black text-white uppercase">Friend</span>
        </div>
      </div>

      {/* Camera panels */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-6">

        {/* Local — You */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="flex flex-col">
          <CameraPanel
            label="You" stream={localStream} isLocal accentColor="var(--neo-accent)"
            controls={
              <>
                <CtrlBtn on={!muted}    icon={<Mic className="w-4 h-4" />}    offIcon={<MicOff className="w-4 h-4" />}    onToggle={toggleMute}  label="Mute" />
                <CtrlBtn on={!videoOff} icon={<Video className="w-4 h-4" />}  offIcon={<VideoOff className="w-4 h-4" />}  onToggle={toggleVideo} label="Camera" />
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
              onClick={addRep}
              className="flex items-center gap-2 px-5 py-3 font-display font-black uppercase tracking-wider text-sm cursor-pointer text-white"
              style={{ background: 'var(--neo-accent)', border: '3px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 0 }}>
              <Plus className="w-4 h-4" /> Rep
            </motion.button>
          </div>
        </motion.div>

        {/* Remote — Friend */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.08 }}
          className="flex flex-col">
          <CameraPanel
            label="Friend" stream={remoteStream} isLocal={false}
            accentColor="var(--neo-blue)" connectionState={peerState}
          />
          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: '#111', border: '3px solid #000', borderTop: 'none' }}>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Friend's Reps</div>
              <AnimatePresence>
                <motion.div key={friendReps} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="font-display font-black tabular-nums"
                  style={{ fontSize: '2.4rem', color: '#fff', lineHeight: 1 }}>
                  {friendReps}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="px-3 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"
              style={{ background: '#1a1a2a', border: `2px solid ${connColor}`, color: connColor, borderRadius: 0 }}>
              {peerState === 'connected'
                ? <Wifi className="w-3.5 h-3.5" />
                : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {stateLabel(peerState)}
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
