'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import Image from 'next/image';

const DISPLAY_MS = 2500;

export function EmojiReactionBubble({
  src,
  reactionKey,
  onExpire,
}: {
  src: string | null;
  reactionKey: number;
  onExpire: () => void;
}) {
  useEffect(() => {
    if (!src) return;
    const t = setTimeout(onExpire, DISPLAY_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, reactionKey]);

  return (
    <div className="absolute top-2 right-2 pointer-events-none z-10">
      <AnimatePresence>
        {src && (
          <motion.div
            key={reactionKey}
            initial={{ opacity: 0, scale: 0.4, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="flex items-center justify-center"
            style={{
              width: 'clamp(48px, 8vw, 72px)',
              height: 'clamp(48px, 8vw, 72px)',
              background: 'var(--neo-white)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              borderRadius: 0,
            }}
          >
            <Image
              src={src}
              alt="Reaction"
              width={72}
              height={72}
              className="w-full h-full object-contain p-1"
              unoptimized
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
