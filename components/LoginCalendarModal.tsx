'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LOGIN_REWARDS } from '@/lib/loginRewards';
import type { Progress } from '@/lib/progress';

type DayState = 'claimed' | 'today-claimable' | 'today-claimed' | 'future' | 'past-missed';

function getDayState(day: number, todayDay: number, claimedDays: number[], calendarMonth: string, currentMonth: string): DayState {
  const monthMatches = calendarMonth === currentMonth;
  const isClaimed = monthMatches && claimedDays.includes(day);
  if (day === todayDay) return isClaimed ? 'today-claimed' : 'today-claimable';
  if (day > todayDay) return 'future';
  return isClaimed ? 'claimed' : 'past-missed';
}

export default function LoginCalendarModal({
  open, onClose, progress, onClaim, isFirstOpenToday,
}: {
  open: boolean;
  onClose: () => void;
  progress: Progress;
  onClaim: (day: number) => void;
  isFirstOpenToday: boolean;
}) {
  const [phase, setPhase] = useState<'fire' | 'calendar'>(isFirstOpenToday ? 'fire' : 'calendar');
  const [claimedReward, setClaimedReward] = useState<(typeof LOGIN_REWARDS)[0] | null>(null);
  const [localClaimed, setLocalClaimed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setPhase(isFirstOpenToday ? 'fire' : 'calendar');
    setClaimedReward(null);
    setLocalClaimed(new Set());
  }, [open, isFirstOpenToday]);

  useEffect(() => {
    if (phase !== 'fire') return;
    const t = setTimeout(() => setPhase('calendar'), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDay = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const currentMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const effectiveClaimedDays = localClaimed.size
    ? [...progress.calendarClaimedDays, ...localClaimed]
    : progress.calendarClaimedDays;

  const handleDayClick = (day: number) => {
    if (localClaimed.has(day)) return;
    const state = getDayState(day, todayDay, progress.calendarClaimedDays, progress.calendarMonth, currentMonth);
    if (state !== 'today-claimable') return;
    setLocalClaimed(prev => new Set(prev).add(day));
    const reward = LOGIN_REWARDS[((day - 1) % 7)];
    setClaimedReward(reward);
    onClaim(day);
    setTimeout(() => setClaimedReward(null), 2500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}
          onClick={phase === 'calendar' ? onClose : undefined}
        >
          <AnimatePresence mode="wait">
            {phase === 'fire' ? (
              <motion.div
                key="fire"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [0, 1.7, 1.4, 1.6, 1.45] }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.9, times: [0, 0.3, 0.5, 0.7, 1] }}
                className="flex flex-col items-center gap-4 select-none pointer-events-none"
              >
                <div className="text-[120px] leading-none">🔥</div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-display text-4xl font-black text-white text-center drop-shadow-lg"
                >
                  {progress.loginStreak > 1 ? `${progress.loginStreak} Day Streak!` : 'Welcome Back!'}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-white/60 text-sm"
                >
                  Claim today&apos;s reward ↓
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
                style={{
                  background: 'var(--surface-solid)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
                }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'var(--surface)' }}
                >
                  <X className="w-4 h-4 text-subtle" />
                </button>

                <div className="mb-5">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                    <Flame className="w-4 h-4" />
                    {progress.loginStreak}-day login streak
                  </div>
                  <h2 className="font-display text-2xl font-bold text-app">{monthName}</h2>
                  <p className="text-xs text-subtle mt-1">Click today to claim your daily reward</p>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold py-1" style={{ color: 'var(--text-subtle)' }}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const state = getDayState(day, todayDay, effectiveClaimedDays, progress.calendarMonth, currentMonth);
                    const reward = LOGIN_REWARDS[((day - 1) % 7)];
                    const isClaimable = state === 'today-claimable';
                    const isClaimed = state === 'claimed' || state === 'today-claimed';
                    const isInactive = state === 'future' || state === 'past-missed';

                    return (
                      <motion.button
                        key={day}
                        onClick={() => handleDayClick(day)}
                        disabled={!isClaimable}
                        whileHover={isClaimable ? { scale: 1.08 } : {}}
                        whileTap={isClaimable ? { scale: 0.93 } : {}}
                        className="relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 overflow-hidden"
                        style={{
                          background: isClaimed
                            ? 'color-mix(in srgb, #ef4444 12%, var(--surface))'
                            : isClaimable
                            ? 'color-mix(in srgb, var(--accent) 18%, var(--surface-solid))'
                            : 'var(--surface)',
                          border: isClaimable
                            ? '1px solid color-mix(in srgb, var(--accent) 50%, transparent)'
                            : isClaimed
                            ? '1px solid color-mix(in srgb, #ef4444 30%, transparent)'
                            : '1px solid var(--border)',
                          opacity: isInactive ? 0.3 : 1,
                          cursor: isClaimable ? 'pointer' : 'default',
                          boxShadow: isClaimable ? '0 0 12px color-mix(in srgb, var(--accent) 28%, transparent)' : 'none',
                        }}
                      >
                        {isClaimed ? (
                          <>
                            <span className="text-[9px] font-bold" style={{ color: '#ef4444' }}>{day}</span>
                            <span className="text-sm leading-none" style={{ color: '#ef4444' }}>✓</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] font-bold" style={{ color: isClaimable ? 'var(--accent)' : 'var(--text-subtle)' }}>{day}</span>
                            {!isInactive && <span className="text-[11px] leading-none">{reward.icon}</span>}
                          </>
                        )}
                        {isClaimable && (
                          <motion.div
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 1.8, repeat: Infinity }}
                            className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {claimedReward && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl p-4 flex items-center gap-3"
                      style={{
                        background: 'color-mix(in srgb, var(--accent) 15%, var(--surface-solid))',
                        border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                      }}
                    >
                      <span className="text-3xl">{claimedReward.icon}</span>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Claimed!</div>
                        <div className="font-display text-lg font-bold text-app">{claimedReward.label}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
