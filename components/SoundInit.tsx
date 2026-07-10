'use client';

import { useEffect } from 'react';
import { playSound, resumeAudioContext } from '@/lib/audio';

export default function SoundInit() {
  useEffect(() => {
    // Unlock AudioContext on first user gesture
    const unlock = () => resumeAudioContext();
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });

    // Hover delegation — fire once per new button entered
    let lastHovered: Element | null = null;
    const onMouseOver = (e: MouseEvent) => {
      const btn = (e.target as Element).closest('button:not([disabled])');
      if (btn && btn !== lastHovered) {
        lastHovered = btn;
        playSound('hover');
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      if (lastHovered && !lastHovered.contains(e.relatedTarget as Node)) {
        lastHovered = null;
      }
    };

    // Click delegation
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('button:not([disabled]), a[href]')) {
        playSound('click');
      }
    };

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}
