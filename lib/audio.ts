'use client';

export type SoundName =
  | 'hover' | 'click'
  | 'purchase' | 'insufficient' | 'notification'
  | 'invite' | 'ready' | 'countdown' | 'workout-start' | 'emoji-sent'
  | 'rep' | 'exercise-complete'
  | 'boss-hit' | 'victory' | 'defeat' | 'level-up';

const STORAGE_KEY = 'letsfit:sound:muted';
const SOUND_EVENT = 'letsfit:sound:changed';

// ── Mute state ────────────────────────────────────────────────────────────────

export function isMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setMuted(v: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(v));
  window.dispatchEvent(new CustomEvent(SOUND_EVENT));
}

export function toggleMuted(): void {
  setMuted(!isMuted());
}

export function subscribeMute(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SOUND_EVENT, handler);
  return () => window.removeEventListener(SOUND_EVENT, handler);
}

// ── AudioContext (lazy) ───────────────────────────────────────────────────────

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
}

export function resumeAudioContext(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

// ── Anti-spam ─────────────────────────────────────────────────────────────────

const lastPlayed = new Map<SoundName, number>();

const COOLDOWNS: Partial<Record<SoundName, number>> = {
  hover: 150,
  click: 100,
  rep: 200,
  countdown: 300,
};
const DEFAULT_COOLDOWN = 500;

function canPlay(name: SoundName): boolean {
  const now = Date.now();
  const last = lastPlayed.get(name) ?? 0;
  const cooldown = COOLDOWNS[name] ?? DEFAULT_COOLDOWN;
  if (now - last < cooldown) return false;
  lastPlayed.set(name, now);
  return true;
}

// ── Synth helpers ─────────────────────────────────────────────────────────────

function tone(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  volume: number,
  freqEnd?: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);
  }

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

function noise(
  ctx: AudioContext,
  startTime: number,
  duration: number,
  volume: number,
): void {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  source.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  source.start(startTime);
  source.stop(startTime + duration + 0.01);
}

// ── Sound definitions ─────────────────────────────────────────────────────────

const SOUNDS: Record<SoundName, (ctx: AudioContext) => void> = {
  hover(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 600, 'sine', t, 0.04, 0.03);
  },

  click(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 800, 'sine', t, 0.06, 0.06, 400);
  },

  purchase(ctx) {
    const t = ctx.currentTime;
    // C5–E5–G5 ascending chord
    tone(ctx, 523, 'sine', t,        0.12, 0.14);
    tone(ctx, 659, 'sine', t + 0.07, 0.12, 0.12);
    tone(ctx, 784, 'sine', t + 0.14, 0.16, 0.16);
  },

  insufficient(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 180, 'sawtooth', t, 0.20, 0.08, 120);
  },

  notification(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 880, 'sine', t, 0.30, 0.12);
  },

  invite(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 660, 'sine', t,        0.15, 0.12);
    tone(ctx, 880, 'sine', t + 0.15, 0.15, 0.12);
  },

  ready(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 440, 'sine', t, 0.10, 0.10, 660);
  },

  countdown(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 800, 'sine', t, 0.08, 0.12);
  },

  'workout-start'(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 200, 'sine', t, 0.35, 0.15, 900);
  },

  'emoji-sent'(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 800, 'sine', t, 0.05, 0.08, 400);
  },

  rep(ctx) {
    const t = ctx.currentTime;
    tone(ctx, 500, 'sine', t, 0.04, 0.08);
  },

  'exercise-complete'(ctx) {
    const t = ctx.currentTime;
    // C5–E5–G5–C6
    tone(ctx, 523,  'sine', t,        0.08, 0.14);
    tone(ctx, 659,  'sine', t + 0.08, 0.08, 0.14);
    tone(ctx, 784,  'sine', t + 0.16, 0.08, 0.14);
    tone(ctx, 1047, 'sine', t + 0.24, 0.14, 0.18);
  },

  'boss-hit'(ctx) {
    const t = ctx.currentTime;
    noise(ctx, t, 0.15, 0.20);
    tone(ctx, 80, 'sawtooth', t, 0.15, 0.15);
  },

  victory(ctx) {
    const t = ctx.currentTime;
    // Triumphant ascending progression
    tone(ctx, 523,  'sine', t,        0.12, 0.18);
    tone(ctx, 659,  'sine', t + 0.10, 0.12, 0.18);
    tone(ctx, 784,  'sine', t + 0.20, 0.12, 0.18);
    tone(ctx, 1047, 'sine', t + 0.30, 0.30, 0.22);
    tone(ctx, 1319, 'sine', t + 0.44, 0.20, 0.18);
  },

  defeat(ctx) {
    const t = ctx.currentTime;
    // C5→Ab4→E4→C4 descending
    tone(ctx, 523, 'sine', t,        0.15, 0.15);
    tone(ctx, 415, 'sine', t + 0.15, 0.15, 0.14);
    tone(ctx, 330, 'sine', t + 0.30, 0.15, 0.13);
    tone(ctx, 262, 'sine', t + 0.45, 0.25, 0.12);
  },

  'level-up'(ctx) {
    const t = ctx.currentTime;
    // Pentatonic sparkle run: A4-B4-D5-E5-G5-A5
    const notes = [440, 494, 587, 659, 784, 880];
    notes.forEach((freq, i) => {
      tone(ctx, freq, 'sine', t + i * 0.055, 0.12, 0.14 + i * 0.01);
    });
  },
};

// ── Public API ────────────────────────────────────────────────────────────────

export function playSound(name: SoundName): void {
  if (typeof window === 'undefined') return;
  if (isMuted()) return;
  if (!canPlay(name)) return;

  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => SOUNDS[name](ctx));
    return;
  }

  SOUNDS[name](ctx);
}
