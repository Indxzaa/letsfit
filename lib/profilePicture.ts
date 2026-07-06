import { getSupabase } from '@/lib/supabase';

const BUCKET = 'avatars';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only PNG, JPG, JPEG, and WEBP files are allowed.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'File must be under 5 MB.';
  }
  return null;
}

// Crop + resize the image to a square canvas at 256×256 and return a Blob
export async function cropToSquare(file: File, size = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const dim = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - dim) / 2;
      const sy = (img.naturalHeight - dim) / 2;
      ctx.drawImage(img, sx, sy, dim, dim, 0, 0, size, size);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/webp', 0.85);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase not configured.' };

  const validErr = validateAvatarFile(file);
  if (validErr) return { ok: false, error: validErr };

  let blob: Blob;
  try {
    blob = await cropToSquare(file);
  } catch {
    return { ok: false, error: 'Could not process image.' };
  }

  const path = `${userId}/avatar.webp`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: true });

  if (error) return { ok: false, error: error.message };

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  // Bust cache with timestamp so the new image loads immediately
  const url = `${data.publicUrl}?t=${Date.now()}`;
  return { ok: true, url };
}

export function getAvatarPublicUrl(userId: string): string {
  const sb = getSupabase();
  if (!sb) return '';
  const { data } = sb.storage.from(BUCKET).getPublicUrl(`${userId}/avatar.webp`);
  return data.publicUrl;
}
