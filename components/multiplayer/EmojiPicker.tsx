'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Smile } from 'lucide-react';
import type { ShopItem } from '@/lib/progress';

const COOLDOWN_MS = 2500;

export function EmojiPicker({
  items,
  onSend,
  variant = 'light',
}: {
  items: ShopItem[];
  onSend: (emojiId: string) => void;
  variant?: 'light' | 'dark';
}) {
  const [open, setOpen] = useState(false);
  const [cooling, setCooling] = useState(false);
  const lastSentRef = useRef(0);

  const handlePick = useCallback((id: string) => {
    const now = Date.now();
    if (now - lastSentRef.current < COOLDOWN_MS) return;
    lastSentRef.current = now;
    onSend(id);
    setOpen(false);
    setCooling(true);
    setTimeout(() => setCooling(false), COOLDOWN_MS);
  }, [onSend]);

  if (items.length === 0) return null;

  const triggerStyle = variant === 'dark'
    ? { background: open ? 'var(--neo-accent)' : 'rgba(0,0,0,0.65)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff' }
    : { background: open ? 'var(--neo-accent)' : 'var(--neo-white)', border: 'var(--neo-border-2)', boxShadow: open ? 'none' : 'var(--neo-shadow-sm)', color: open ? '#fff' : 'var(--neo-black)' };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ y: -1 }} whileTap={{ y: 1, scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        disabled={cooling}
        title="Send reaction"
        className="flex items-center justify-center w-9 h-9 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        style={{ ...triggerStyle, borderRadius: 0 }}
      >
        <Smile className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-full right-0 mb-2 grid grid-cols-4 gap-1.5 p-2 z-20"
            style={{ background: 'var(--neo-white)', border: '3px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 0, width: 'max-content' }}
          >
            {items.map(item => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }} whileTap={{ y: 1, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => handlePick(item.id)}
                title={item.name}
                className="flex items-center justify-center w-10 h-10 cursor-pointer"
                style={{ background: 'var(--neo-surface)', border: '2px solid #000', borderRadius: 0 }}
              >
                <Image src={item.value} alt={item.name} width={32} height={32} className="w-full h-full object-contain p-1" unoptimized />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
