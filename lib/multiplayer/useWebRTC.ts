'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  getLocalMedia, stopStream, createPeer, addTracks,
  type PeerConnectionState,
} from './webrtc';
import { subscribeSignaling, sendSignal } from './signaling';

export interface UseWebRTCState {
  localStream:       MediaStream | null;
  remoteStream:      MediaStream | null;
  peerState:         PeerConnectionState;
  muted:             boolean;
  videoOff:          boolean;
  mediaError:        string | null;
}

export interface UseWebRTCActions {
  toggleMute:  () => void;
  toggleVideo: () => void;
  hangUp:      () => void;
  retryMedia:  () => void;
}

/**
 * Manages the full WebRTC lifecycle for one session.
 *
 * @param roomId   - Supabase room ID (used as signaling channel key)
 * @param userId   - Current user's ID
 * @param isHost   - Host is the "caller" (sends offer first)
 * @param enabled  - Set to true when both players are present and ready to start
 */
export function useWebRTC(
  roomId: string,
  userId: string,
  isHost: boolean,
  enabled: boolean,
): UseWebRTCState & UseWebRTCActions {
  const [localStream,  setLocalStream]  = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerState,    setPeerState]    = useState<PeerConnectionState>('idle');
  const [muted,        setMuted]        = useState(false);
  const [videoOff,     setVideoOff]     = useState(false);
  const [mediaError,   setMediaError]   = useState<string | null>(null);

  const pcRef          = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubRef       = useRef<(() => void) | null>(null);
  // Buffer ICE candidates received before remote description is set
  const iceBufRef      = useRef<RTCIceCandidateInit[]>([]);

  // ── Teardown helper ───────────────────────────────────────────────────

  const teardown = useCallback((reason?: PeerConnectionState) => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    iceBufRef.current = [];
    if (reason) setPeerState(reason);
  }, []);

  // ── Start ─────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    if (!enabled || !roomId || !userId) return;
    setPeerState('requesting-media');
    setMediaError(null);

    // 1. Get local media
    let stream: MediaStream;
    try {
      stream = await getLocalMedia();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const denied = msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission');
      setMediaError(denied
        ? 'Camera and microphone access was denied. Please allow access and retry.'
        : `Could not access camera/microphone: ${msg}`);
      setPeerState('media-denied');
      return;
    }

    localStreamRef.current = stream;
    setLocalStream(stream);
    setPeerState('connecting');

    // 2. Create peer connection
    const pc = createPeer();
    pcRef.current = pc;
    addTracks(pc, stream);

    // 3. Remote track → remote stream
    const remoteStreamObj = new MediaStream();
    setRemoteStream(remoteStreamObj);
    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach(t => remoteStreamObj.addTrack(t));
    };

    // 4. ICE candidate handler
    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        await sendSignal(roomId, { type: 'ice', candidate: e.candidate.toJSON(), fromUserId: userId });
      }
    };

    // 5. Connection state tracker
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'connected')     setPeerState('connected');
      if (s === 'disconnected')  setPeerState('reconnecting');
      if (s === 'failed')        setPeerState('failed');
      if (s === 'closed')        setPeerState('disconnected');
    };

    // 6. Subscribe to signaling
    const unsub = subscribeSignaling(roomId, async (msg) => {
      if (msg.fromUserId === userId) return; // ignore own messages

      if (msg.type === 'offer') {
        await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
        // Drain buffered ICE
        for (const c of iceBufRef.current) await pc.addIceCandidate(c);
        iceBufRef.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(roomId, { type: 'answer', sdp: answer.sdp!, fromUserId: userId });
      }

      if (msg.type === 'answer') {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
          for (const c of iceBufRef.current) await pc.addIceCandidate(c);
          iceBufRef.current = [];
        }
      }

      if (msg.type === 'ice') {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(msg.candidate).catch(() => {});
        } else {
          iceBufRef.current.push(msg.candidate);
        }
      }

      if (msg.type === 'leave') {
        setPeerState('disconnected');
      }
    });
    unsubRef.current = unsub;

    // 7. Host creates and sends offer
    if (isHost) {
      // Small delay to ensure both peers have subscribed
      await new Promise(r => setTimeout(r, 500));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(roomId, { type: 'offer', sdp: offer.sdp!, fromUserId: userId });
    }
  }, [enabled, roomId, userId, isHost, teardown]);

  // Mount / unmount
  useEffect(() => {
    if (enabled) start();
    return () => {
      // Signal leave to peer, then teardown
      if (roomId && userId) {
        sendSignal(roomId, { type: 'leave', fromUserId: userId }).catch(() => {});
      }
      teardown('idle');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ── Controls ──────────────────────────────────────────────────────────

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nowMuted = !muted;
    stream.getAudioTracks().forEach(t => { t.enabled = !nowMuted; });
    // Also disable on the RTC sender so the remote peer stops receiving audio
    pcRef.current?.getSenders()
      .filter(s => s.track?.kind === 'audio')
      .forEach(s => { if (s.track) s.track.enabled = !nowMuted; });
    setMuted(nowMuted);
  }, [muted]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nowOff = !videoOff;
    stream.getVideoTracks().forEach(t => { t.enabled = !nowOff; });
    // Also disable on the RTC sender so the remote peer stops receiving video
    pcRef.current?.getSenders()
      .filter(s => s.track?.kind === 'video')
      .forEach(s => { if (s.track) s.track.enabled = !nowOff; });
    setVideoOff(nowOff);
  }, [videoOff]);

  const hangUp = useCallback(() => {
    if (roomId && userId) {
      sendSignal(roomId, { type: 'leave', fromUserId: userId }).catch(() => {});
    }
    teardown('disconnected');
  }, [roomId, userId, teardown]);

  const retryMedia = useCallback(() => {
    setMediaError(null);
    setPeerState('idle');
    start();
  }, [start]);

  return {
    localStream, remoteStream, peerState, muted, videoOff, mediaError,
    toggleMute, toggleVideo, hangUp, retryMedia,
  };
}
