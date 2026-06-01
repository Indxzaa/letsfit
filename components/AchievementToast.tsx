'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { getAchievement } from '@/lib/achievements';

type Props = {
  achievementIds: string[];
  onDismiss: (id: string) => void;
};

export function AchievementToastLayer({ achievementIds, onDismiss }: Props) {
  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {achievementIds.map((id, index) => (
          <AchievementToast
            key={id}
            id={id}
            index={index}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function AchievementToast({
  id,
  index,
  onDismiss,
}: {
  id: string;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const achievement = getAchievement(id);

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4500 + index * 300);
    return () => clearTimeout(t);
  }, [id, index, onDismiss]);

  if (!achievement) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="pointer-events-auto w-72 surface rounded-xl p-4 bg-surface-solid backdrop-blur-md border border-app shadow-xl"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center text-xl shrink-0">
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium accent-text mb-0.5">
            Achievement unlocked
          </div>
          <div className="text-sm font-semibold text-app truncate">
            {achievement.name}
          </div>
          <div className="text-xs text-muted mt-0.5 leading-relaxed">
            {achievement.description}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
