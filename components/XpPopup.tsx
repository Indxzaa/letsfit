'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type XpPopupItem = {
  id: number;
  amount: number;
};

type Props = {
  items: XpPopupItem[];
  onExpire: (id: number) => void;
};

export function XpPopupLayer({ items, onExpire }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {items.map((item) => (
          <XpPopup key={item.id} item={item} onExpire={onExpire} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function XpPopup({
  item,
  onExpire,
}: {
  item: XpPopupItem;
  onExpire: (id: number) => void;
}) {
  const [offsetX] = useState(() => (Math.random() - 0.5) * 40);

  useEffect(() => {
    const t = setTimeout(() => onExpire(item.id), 1100);
    return () => clearTimeout(t);
  }, [item.id, onExpire]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.85 }}
      animate={{ opacity: 1, y: -60, scale: 1 }}
      exit={{ opacity: 0, y: -90 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{ left: `calc(50% + ${offsetX}px)` }}
      className="absolute bottom-20 -translate-x-1/2 px-3 py-1.5 rounded-full accent-bg backdrop-blur-sm text-white text-sm font-semibold shadow-lg"
    >
      +{item.amount} XP
    </motion.div>
  );
}
