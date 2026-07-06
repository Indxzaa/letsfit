import { getSupabase } from '@/lib/supabase';

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

/** Upload a pre-cropped blob (already 256×256 WebP) from the crop modal */
export async function uploadAvatarBlob(userId: string, blob: Blob): Promise<UploadResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase not configured.' };

  const path = `${userId}/avatar.webp`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: true });

  if (error) return { ok: false, error: error.message };

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?t=${Date.now()}`;

  // Write to dedicated avatar_url column — NOT inside profiles.data.
  // profileSync.pushRemote writes profiles.data (the progress JSONB) and
  // would silently overwrite any avatarUrl stored there. The avatar_url
  // column is never touched by profileSync, so it persists across syncs.
  const { error: updateErr } = await sb
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', userId);

  if (updateErr) {
    // Non-fatal — Storage upload succeeded; log and continue
    console.error('[uploadAvatarBlob] Failed to persist avatar_url:', updateErr.message);
  }

  return { ok: true, url };
}

/** Load the persisted avatar URL from the dedicated column */
export async function loadAvatarUrlFromProfile(userId: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data: profile } = await sb
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();
    return (profile?.avatar_url as string | null) ?? null;
  } catch {
    return null;
  }
}

/** Synchronous public storage URL — use only as a last-resort fallback */
export function getAvatarPublicUrl(userId: string): string {
  const sb = getSupabase();
  if (!sb) return '';
  const { data } = sb.storage.from(BUCKET).getPublicUrl(`${userId}/avatar.webp`);
  return data.publicUrl;
}
