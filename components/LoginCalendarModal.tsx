'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LOGIN_REWARDS } from '@/lib/loginRewards';
import type { Progress } from '@/lib/progress';

type DayState = 'claimed' | 'today-claimable' | 'today-claimed' | 'future' | 'past-missed';

function getDayState(
  day: number,
  todayDay: number,
  claimedDays: number[],
  viewMonth: string,
  currentMonth: string,
): DayState {
  const isCurrentMonth = viewMonth === currentMonth;
  const isClaimed = claimedDays.includes(day);
  if (isCurrentMonth && day === todayDay) return isClaimed ? 'today-claimed' : 'today-claimable';
  if (isCurrentMonth && day > todayDay) return 'future';
  return isClaimed ? 'claimed' : 'past-missed';
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(base: Date, delta: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth() + delta, 1);
  return d;
}

const CLAIMED_RED = '#DC2626';

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
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!open) return;
    setPhase(isFirstOpenToday ? 'fire' : 'calendar');
    setClaimedReward(null);
    setLocalClaimed(new Set());
    setViewDate(new Date());
  }, [open, isFirstOpenToday]);

  useEffect(() => {
    if (phase !== 'fire') return;
    const t = setTimeout(() => setPhase('calendar'), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  const now = new Date();
  const todayDay = now.getDate();
  const currentMonth = monthKey(now);

  const viewMonth = monthKey(viewDate);
  const viewYear = viewDate.getFullYear();
  const viewMonthIndex = viewDate.getMonth();
  const daysInViewMonth = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonthIndex, 1).getDay();
  const viewMonthName = viewDate.toLocaleString('default', { month: 'long' });
  const viewMonthShort = viewDate.toLocaleString('default', { month: 'short' });

  const canGoBack = true; // allow arbitrary history navigation
  const canGoForward = viewMonth < currentMonth;

  const history = progress.loginHistory ?? {};
  const baseClaimedDays: number[] = history[viewMonth] ?? (
    progress.calendarMonth === viewMonth ? progress.calendarClaimedDays : []
  );
  const effectiveClaimedDays = (viewMonth === currentMonth && localClaimed.size > 0)
    ? [...baseClaimedDays, ...localClaimed]
    : baseClaimedDays;

  const handleDayClick = (day: number) => {
    if (viewMonth !== currentMonth) return;
    if (localClaimed.has(day)) return;
    const state = getDayState(day, todayDay, progress.calendarClaimedDays, viewMonth, currentMonth);
    if (state !== 'today-claimable') return;
    setLocalClaimed(prev => new Set(prev).add(day));
    const reward = LOGIN_REWARDS[((day - 1) % 7)];
    setClaimedReward(reward);
    onClaim(day);
    setTimeout(() => setClaimedReward(null), 2800);
  };

  const todayReward = LOGIN_REWARDS[((todayDay - 1) % 7)];
  const displayDay = viewMonth === currentMonth ? todayDay : daysInViewMonth;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
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
                className="flex flex-col items-center gap-5 select-none pointer-events-none"
              >
                <div className="text-[120px] leading-none">🔥</div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-display text-5xl font-black text-white text-center uppercase leading-none"
                  style={{ textShadow: '4px 4px 0 rgba(0,0,0,0.35)', letterSpacing: '-0.02em' }}
                >
                  {progress.loginStreak > 1
                    ? <>{progress.loginStreak}<br />Day Streak!</>
                    : 'Welcome Back!'}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-white/70 text-xs font-black uppercase tracking-widest"
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
                className="relative w-full max-w-sm overflow-y-auto max-h-[92vh]"
                style={{
                  background: 'var(--neo-cream)',
                  border: '4px solid #000',
                  boxShadow: '8px 8px 0 #000',
                  borderRadius: 0,
                }}
              >
                {/* ── Header ── */}
                <div className="px-5 pt-5 pb-4" style={{ borderBottom: '4px solid #000' }}>
                  {/* Top row: streak left, date+close right */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {/* Streak */}
                    <div className="flex items-center gap-3">
                      <span className="text-4xl leading-none select-none">🔥</span>
                      <div>
                        <div
                          className="font-display font-black leading-none tabular-nums"
                          style={{ fontSize: 'clamp(2.6rem,11vw,3.5rem)', color: '#000', lineHeight: 1 }}
                        >
                          {progress.loginStreak}
                        </div>
                        <div
                          className="text-[11px] font-black uppercase tracking-widest mt-0.5"
                          style={{ color: 'var(--neo-accent)' }}
                        >
                          Day Streak
                        </div>
                      </div>
                    </div>

                    {/* Date + close */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer"
                        style={{
                          background: '#000',
                          border: '2px solid #000',
                          boxShadow: '2px 2px 0 #555',
                          color: '#fff',
                          borderRadius: 0,
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div
                        className="font-display font-black uppercase leading-none"
                        style={{ fontSize: '1.25rem', color: '#000', letterSpacing: '-0.01em' }}
                      >
                        {displayDay} {viewMonthShort}
                      </div>
                    </div>
                  </div>

                  {/* Today's reward preview — only on current month */}
                  {viewMonth === currentMonth && !effectiveClaimedDays.includes(todayDay) && (
                    <div
                      className="flex items-center gap-3 px-3 py-2 mb-3"
                      style={{
                        background: 'var(--neo-accent)',
                        border: '2px solid #000',
                        borderRadius: 0,
                      }}
                    >
                      <span className="text-lg">{todayReward.icon}</span>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/75">Today&apos;s Reward</div>
                        <div className="text-xs font-black uppercase text-white">{todayReward.label}</div>
                      </div>
                      <div className="ml-auto text-[10px] font-black uppercase tracking-wider text-white/80">
                        Tap day {todayDay} ↓
                      </div>
                    </div>
                  )}

                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setViewDate(d => addMonths(d, -1))}
                      disabled={!canGoBack}
                      className="w-8 h-8 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
                      style={{ background: '#000', border: '2px solid #000', color: '#fff', borderRadius: 0 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="font-display text-sm font-black uppercase tracking-wider" style={{ color: '#000' }}>
                      {viewMonthName} {viewYear}
                    </div>
                    <button
                      onClick={() => setViewDate(d => addMonths(d, 1))}
                      disabled={!canGoForward}
                      className="w-8 h-8 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
                      style={{ background: '#000', border: '2px solid #000', color: '#fff', borderRadius: 0 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Week headers */}
                  <div className="grid grid-cols-7">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div
                        key={i}
                        className="text-center text-[10px] font-black uppercase tracking-wider py-1"
                        style={{ color: '#000' }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Calendar grid ── */}
                <div className="p-4" style={{ background: 'var(--neo-cream)' }}>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInViewMonth }, (_, i) => {
                      const day = i + 1;
                      const state = getDayState(day, todayDay, effectiveClaimedDays, viewMonth, currentMonth);
                      const reward = LOGIN_REWARDS[((day - 1) % 7)];
                      const isClaimable = state === 'today-claimable';
                      const isClaimed = state === 'claimed' || state === 'today-claimed';
                      const isInactive = state === 'future' || state === 'past-missed';

                      let bg = 'rgba(0,0,0,0.07)';
                      let border = '2px solid rgba(0,0,0,0.12)';
                      let shadow = 'none';

                      if (isClaimed) {
                        bg = CLAIMED_RED;
                        border = `2px solid ${CLAIMED_RED}`;
                      } else if (isClaimable) {
                        bg = 'var(--neo-accent)';
                        border = '3px solid #000';
                        shadow = '3px 3px 0 #000';
                      }

                      return (
                        <motion.button
                          key={day}
                          onClick={() => handleDayClick(day)}
                          disabled={!isClaimable}
                          whileHover={isClaimable ? { y: -2, boxShadow: '5px 5px 0 #000' } : {}}
                          whileTap={isClaimable ? { y: 2, boxShadow: '1px 1px 0 #000' } : {}}
                          className="relative aspect-square flex flex-col items-center justify-center gap-px overflow-hidden"
                          style={{
                            background: bg,
                            border,
                            boxShadow: shadow,
                            opacity: isInactive ? 0.22 : 1,
                            cursor: isClaimable ? 'pointer' : 'default',
                            borderRadius: 0,
                            transition: 'box-shadow 0.1s ease',
                          }}
                        >
                          {isClaimed ? (
                            <>
                              <span className="text-[8px] font-black leading-none" style={{ color: '#fff' }}>{day}</span>
                              <span className="text-[11px] font-black leading-none" style={{ color: '#fff' }}>✓</span>
                            </>
                          ) : (
                            <>
                              <span
                                className="text-[8px] font-black leading-none"
                                style={{ color: isClaimable ? '#fff' : 'rgba(0,0,0,0.6)' }}
                              >
                                {day}
                              </span>
                              {!isInactive && (
                                <span className="text-[10px] leading-none">{reward.icon}</span>
                              )}
                            </>
                          )}
                          {isClaimable && (
                            <motion.div
                              animate={{ opacity: [0.15, 0.45, 0.15] }}
                              transition={{ duration: 1.6, repeat: Infinity }}
                              className="absolute inset-0 pointer-events-none"
                              style={{ background: 'rgba(255,255,255,0.3)' }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Footer ── */}
                <div
                  className="px-4 py-3 flex items-center gap-4 flex-wrap"
                  style={{ borderTop: '3px solid #000', background: 'rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3" style={{ background: CLAIMED_RED, border: `1.5px solid ${CLAIMED_RED}` }} />
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#000' }}>Claimed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3" style={{ background: 'var(--neo-accent)', border: '1.5px solid #000' }} />
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#000' }}>Today</span>
                  </div>
                  <div
                    className="ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-1"
                    style={{ background: '#000', color: '#fff', border: '2px solid #000' }}
                  >
                    Best: {progress.highestLoginStreak}d
                  </div>
                </div>

                {/* ── Claimed reward banner ── */}
                <AnimatePresence>
                  {claimedReward && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mx-4 mb-4 mt-1 p-4 flex items-center gap-4"
                      style={{
                        background: 'var(--neo-accent)',
                        border: '4px solid #000',
                        boxShadow: '5px 5px 0 #000',
                        borderRadius: 0,
                      }}
                    >
                      <span className="text-4xl">{claimedReward.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/80">Reward Claimed!</div>
                        <div className="font-display text-lg font-black text-white uppercase leading-tight truncate">
                          {claimedReward.label}
                        </div>
                      </div>
                      <div className="text-4xl font-black text-white/30 leading-none">✓</div>
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
