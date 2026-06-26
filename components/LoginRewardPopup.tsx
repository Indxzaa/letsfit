'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { LOGIN_REWARDS } from '@/lib/loginRewards';

export default function LoginRewardPopup({
  open,
  loginStreak,
  rewardDay,
  onClose,
}: {
  open: boolean;
  loginStreak: number;
  rewardDay: number;
  onClose: () => void;
}) {
  const today = LOGIN_REWARDS[rewardDay - 1];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
            style={{
              background: 'var(--surface-solid)',
              border: '1px solid var(--border)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: 'var(--surface)' }}
            >
              <X className="w-4 h-4 text-subtle" />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="text-5xl mb-2">🎁</div>
              <h2 className="font-display text-2xl font-bold text-app">Daily Reward</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                <Flame className="w-4 h-4" />
                {loginStreak}-day login streak
              </div>
            </div>

            {/* Today's reward highlight */}
            {today && (
              <div
                className="rounded-2xl p-4 text-center mb-5"
                style={{
                  background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
                  border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                }}
              >
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
                  Day {rewardDay} — Claimed!
                </div>
                <div className="text-5xl my-2">{today.icon}</div>
                <div className="font-display text-lg font-bold text-app">{today.label}</div>
              </div>
            )}

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {LOGIN_REWARDS.map((r) => {
                const isToday  = r.day === rewardDay;
                const claimed  = r.day < rewardDay;
                const future   = r.day > rewardDay;
                return (
                  <div
                    key={r.day}
                    className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl"
                    style={
                      isToday
                        ? { background: 'var(--accent)', boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 45%, transparent)' }
                        : claimed
                        ? { background: 'color-mix(in srgb, var(--accent) 12%, var(--surface))' }
                        : { background: 'var(--surface)', opacity: 0.5 }
                    }
                  >
                    <div className="text-[9px] font-bold" style={{ color: isToday ? 'rgba(255,255,255,0.75)' : 'var(--text-subtle)' }}>
                      D{r.day}
                    </div>
                    <div className="text-base">{future ? '🔒' : r.icon}</div>
                    <div
                      className="text-[8px] font-semibold text-center leading-tight"
                      style={{ color: isToday ? 'rgba(255,255,255,0.85)' : 'var(--text-subtle)' }}
                    >
                      {future ? '???' : r.label.split(' ').slice(0, 2).join(' ')}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-subtle">Come back tomorrow to continue your streak!</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
