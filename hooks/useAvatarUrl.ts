'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadAvatarUrlFromProfile } from '@/lib/profilePicture';

// Module-level cache so all hook instances share one URL and one DB call per session
let cachedUrl: string | null = null;
let cachedUserId: string | null = null;
const listeners = new Set<(url: string | null) => void>();

function notify(url: string | null) {
  cachedUrl = url;
  listeners.forEach(fn => fn(url));
}

export function broadcastAvatarUrl(url: string | null) {
  notify(url);
}

export function useAvatarUrl(userId: string | null): {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
} {
  const [url, setUrl] = useState<string | null>(
    userId && userId === cachedUserId ? cachedUrl : null,
  );

  useEffect(() => {
    if (!userId) { setUrl(null); return; }

    // Subscribe to cross-instance updates
    const listener = (u: string | null) => setUrl(u);
    listeners.add(listener);

    // Load from DB only if not already cached for this user
    if (userId !== cachedUserId) {
      cachedUserId = userId;
      cachedUrl = null;
      loadAvatarUrlFromProfile(userId).then(u => {
        notify(u);
      });
    } else {
      setUrl(cachedUrl);
    }

    return () => { listeners.delete(listener); };
  }, [userId]);

  const set = useCallback((u: string | null) => {
    notify(u);
  }, []);

  return { avatarUrl: url, setAvatarUrl: set };
}
