// Pure WebRTC utilities — no React, no Supabase.
// The hook in useWebRTC.ts wires these to the component lifecycle.

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

export type PeerConnectionState =
  | 'idle'
  | 'requesting-media'
  | 'media-denied'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

/** Request camera + microphone. Returns the stream or throws with a reason. */
export async function getLocalMedia(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
    audio: { echoCancellation: true, noiseSuppression: true },
  });
}

/** Gracefully stop all tracks on a stream. */
export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach(t => t.stop());
}

/** Create a fresh RTCPeerConnection with the project STUN config. */
export function createPeer(): RTCPeerConnection {
  return new RTCPeerConnection(RTC_CONFIG);
}

/** Add all local tracks to a peer connection. */
export function addTracks(pc: RTCPeerConnection, stream: MediaStream): void {
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
}
