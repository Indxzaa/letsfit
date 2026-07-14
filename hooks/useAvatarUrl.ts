'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadProgress, subscribeToProgress } from '@/lib/progress';
import { getAvatarPublicUrl } from '@/lib/profilePicture';
import { useAuth } from '@/components/AuthProvider';

// Module-level broadcast so all instances update together when a photo is uploaded
const listeners = new Set<(url: string | null) => void>();
let sessionOverride: string | null = null; // cache-busted URL set right after upload

export function broadcastAvatarUrl(url: string | null) {
  sessionOverride = url;
  listeners.forEach(fn => fn(url));
}

function resolveUrl(userId: string | null, isCurrentUser: boolean): string | null {
  if (!userId) return null;
  // For other users: always return the deterministic storage URL.
  // UserAvatar's onError handles 404 → initials if they have no photo.
  if (!isCurrentUser) return getAvatarPublicUrl(userId);
  if (sessionOverride) return sessionOverride;
  if (typeof window === 'undefined') return null;
  const p = loadProgress();
  if (!p.hasAvatar) return null;
  return getAvatarPublicUrl(userId);
}

export function useAvatarUrl(userId: string | null): {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
} {
  const { user } = useAuth();
  const isCurrentUser = !!userId && userId === user?.id;
  const [url, setUrl] = useState<string | null>(() => resolveUrl(userId, isCurrentUser));

  useEffect(() => {
    if (!userId) { setUrl(null); return; }

    setUrl(resolveUrl(userId, isCurrentUser));

    if (!isCurrentUser) return;

    // Re-resolve when progress changes (profileSync may have synced hasAvatar from DB)
    const unsubProgress = subscribeToProgress(() => setUrl(resolveUrl(userId, true)));

    // Listen for just-uploaded photo broadcasts
    const listener = (u: string | null) => setUrl(u ?? resolveUrl(userId, true));
    listeners.add(listener);

    return () => {
      unsubProgress();
      listeners.delete(listener);
    };
  }, [userId, isCurrentUser]);

  const set = useCallback((u: string | null) => {
    broadcastAvatarUrl(u);
  }, []);

  return { avatarUrl: url, setAvatarUrl: set };
}
