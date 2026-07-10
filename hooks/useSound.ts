'use client';

import { useEffect, useState } from 'react';
import { isMuted, toggleMuted, subscribeMute } from '@/lib/audio';

export function useSoundSettings(): { isMuted: boolean; toggleMuted: () => void } {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
    return subscribeMute(() => setMuted(isMuted()));
  }, []);

  return { isMuted: muted, toggleMuted };
}
