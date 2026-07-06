import { getSupabase } from '@/lib/supabase';
import { loadProgress, saveProgress } from '@/lib/progress';

const BUCKET = 'avatars';
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only PNG, JPG, JPEG, and WEBP files are allowed.';
  if (file.size > MAX_SIZE_BYTES) return 'File must be under 5 MB.';
  return null;
}

/**
 * Upload a pre-cropped blob to Supabase Storage.
 * The avatar URL is derived deterministically from userId, so we only need
 * to record a `hasAvatar: true` flag in the user's Progress (which profileSync
 * already syncs to profiles.data). No separate DB column is required.
 */
export async function uploadAvatarBlob(userId: string, blob: Blob): Promise<UploadResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase not configured.' };

  const path = `${userId}/avatar.webp`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: true });

  if (error) return { ok: false, error: error.message };

  // Mark in progress so the flag survives refresh via profileSync
  saveProgress({ ...loadProgress(), hasAvatar: true });

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  // Cache-bust so the new image loads immediately in this session
  const url = `${data.publicUrl}?t=${Date.now()}`;
  return { ok: true, url };
}

/**
 * Returns the avatar URL for userId.
 * For the current user: checks progress.hasAvatar (synced by profileSync).
 * For other users: always returns the deterministic storage URL so UserAvatar
 * can attempt to load it; onError fallback shows the letter avatar if missing.
 */
export function getAvatarUrl(userId: string, isCurrentUser = false): string | null {
  if (isCurrentUser) {
    if (typeof window === 'undefined') return null;
    const p = loadProgress();
    if (!p.hasAvatar) return null;
  }
  return getAvatarPublicUrl(userId);
}

/** Synchronous public storage URL builder — does NOT verify the file exists */
export function getAvatarPublicUrl(userId: string): string {
  const sb = getSupabase();
  if (!sb) return '';
  const { data } = sb.storage.from(BUCKET).getPublicUrl(`${userId}/avatar.webp`);
  return data.publicUrl;
}

// Keep for backwards-compat with any remaining callers
export async function loadAvatarUrlFromProfile(userId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const { loadProgress: lp } = await import('@/lib/progress');
    const p = lp();
    if (!p.hasAvatar) return null;
    return getAvatarPublicUrl(userId);
  } catch {
    return null;
  }
}
