'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ChestDef } from '@/lib/shop';

type AnimPhase = 'spawn' | 'shake' | 'open' | 'reel' | 'result';

const REEL_ITEMS = [
  { id: 'coin_boost',    name: 'Coin Booster',    img: '/coinbooster.png'    },
  { id: 'xp_boost',     name: 'XP Booster',      img: '/XPbooster.png'      },
  { id: 'emerald_boost', name: 'Emerald Booster', img: '/emeraldbooster.png' },
  { id: 'lucky_charm',  name: 'Lucky Charm',      img: '/luckycharm.png'     },
  { id: 'streak_shield', name: 'Streak Shield',   img: null                  },
  { id: 'fragment',     name: 'Fragments',         img: '/fragment.png'       },
  { id: 'coins',        name: 'FitCoins',          img: null                  },
  { id: 'emeralds',     name: 'Emeralds',          img: null                  },
  { id: 'frame',        name: 'Frame',             img: '/frame1.png'         },
  { id: 'emoji',        name: 'Emoji',             img: '/emoji1.png'         },
];

const REEL_SEQUENCE = [
  ...REEL_ITEMS, ...REEL_ITEMS, ...REEL_ITEMS, ...REEL_ITEMS,
];

const ITEM_W     = 88;
const ITEM_GAP   = 10;
const ITEM_PITCH = ITEM_W + ITEM_GAP;

// Container viewport is ~400px; arrow sits at center (200px).
// Land index 14 under the arrow.
const CONTAINER_CTR = 200;
const REEL_START_X  = 450;

export default function ChestOpeningModal({
  def,
  isOpen,
  onClose,
  reelLandIndex,
  reward,
  onClaimed,
}: {
  def: ChestDef;
  isOpen: boolean;
  onClose: () => void;
  reelLandIndex: number;
  reward: string;
  onClaimed: (reward: string) => void;
}) {
  const [phase, setPhase] = useState<AnimPhase>('spawn');
  const reelLandX = CONTAINER_CTR - (reelLandIndex * ITEM_PITCH + ITEM_W / 2);

  useEffect(() => {
    if (!isOpen) { setPhase('spawn'); return; }
    setPhase('spawn');
    const t1 = setTimeout(() => setPhase('shake'),  350);
    const t2 = setTimeout(() => setPhase('open'),  1200);
    const t3 = setTimeout(() => setPhase('reel'),  1700);
    const t4 = setTimeout(() => { setPhase('result'); onClaimed(reward); }, 6300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const showOpened = phase === 'open' || phase === 'reel' || phase === 'result';
  const chestImg   = showOpened ? def.openedImg : def.img;
  const showReel   = phase === 'reel' || phase === 'result';

  const CHEST_COLORS: Record<string, string> = {
    common:  '#7eb89a',
    rare:    '#7ab0d8',
    epic:    '#a888e0',
    premium: '#9333ea',
    supreme: '#ef4444',
  };
  const accentColor = CHEST_COLORS[def.rarity] ?? '#111';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && phase === 'result') onClose();
          }}
        >
          <motion.div
            key="panel"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md overflow-hidden"
            style={{
              background: 'var(--neo-white)',
              border: `4px solid #000`,
              boxShadow: `8px 8px 0 #000`,
            }}
          >
            {/* Close button — result phase only */}
            {phase === 'result' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center cursor-pointer"
                style={{ background: '#fff', border: '3px solid #000', boxShadow: '2px 2px 0 #000' }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            <div className="p-8 flex flex-col items-center">
              {/* Chest name badge */}
              <div
                className="px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-6"
                style={{ background: accentColor, border: '3px solid #000', color: '#fff', boxShadow: '3px 3px 0 #000' }}
              >
                {def.name}
              </div>

              {/* Chest image with shake + open animations */}
              <motion.div
                animate={phase === 'shake' ? { rotate: [-5, 5, -5, 5, 0] } : { rotate: 0 }}
                transition={
                  phase === 'shake'
                    ? { duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' }
                    : { duration: 0.15 }
                }
                className="mb-6"
              >
                <motion.div
                  animate={phase === 'open' ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={
                    phase === 'open'
                      ? { duration: 0.25, times: [0, 0.5, 1] }
                      : { duration: 0.15 }
                  }
                  className="relative w-40 h-40"
                >
                  <Image
                    src={chestImg}
                    alt={def.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </motion.div>
              </motion.div>

              {/* Reward reel */}
              {showReel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {/* Arrow indicator */}
                  <div className="flex justify-center mb-1">
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderTop: `14px solid #000`,
                      }}
                    />
                  </div>

                  {/* Reel track */}
                  <div
                    className="relative overflow-hidden"
                    style={{
                      height: 110,
                      border: '3px solid #000',
                      boxShadow: '4px 4px 0 #000',
                      background: '#f0f0f0',
                    }}
                  >
                    {/* Center highlight overlay */}
                    <div
                      className="absolute top-0 bottom-0 z-10 pointer-events-none"
                      style={{
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: ITEM_W + 8,
                        border: `3px solid ${accentColor}`,
                        background: `${accentColor}22`,
                      }}
                    />

                    {/* Scrolling items */}
                    <motion.div
                      className="absolute top-0 flex items-center"
                      style={{ height: '100%', gap: ITEM_GAP, paddingLeft: 4 }}
                      initial={{ x: REEL_START_X }}
                      animate={
                        phase === 'reel'
                          ? {
                              x: [
                                REEL_START_X,
                                REEL_START_X - 900,
                                reelLandX - 180,
                                reelLandX,
                              ],
                            }
                          : { x: reelLandX }
                      }
                      transition={
                        phase === 'reel'
                          ? {
                              duration: 4.5,
                              times: [0, 0.38, 0.78, 1.0],
                              ease: 'easeOut',
                            }
                          : { duration: 0 }
                      }
                    >
                      {REEL_SEQUENCE.map((item, i) => (
                        <div
                          key={i}
                          className="flex-shrink-0 flex flex-col items-center justify-center"
                          style={{
                            width: ITEM_W,
                            height: 90,
                            background: 'var(--neo-white)',
                            border: '2px solid #000',
                            boxShadow: '2px 2px 0 #000',
                          }}
                        >
                          <div className="relative w-10 h-10 mb-1 shrink-0">
                            {item.img ? (
                              <Image
                                src={item.img}
                                alt={item.name}
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🛡️
                              </div>
                            )}
                          </div>
                          <div
                            className="text-[8px] font-black uppercase tracking-wide text-center leading-tight px-1"
                            style={{ color: '#111' }}
                          >
                            {item.name}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Result card */}
              {phase === 'result' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: [0.8, 1.08, 1] }}
                  transition={{ duration: 0.4, times: [0, 0.6, 1], type: 'tween' }}
                  className="mt-6 w-full flex flex-col items-center"
                >
                  <div
                    className="w-full py-3 text-center font-display text-lg font-bold"
                    style={{
                      background: 'var(--card-bg-amber)',
                      border: '3px solid #000',
                      boxShadow: '4px 4px 0 #000',
                    }}
                  >
                    Reward Coming Soon
                  </div>
                  <p className="text-xs text-muted mt-3">
                    Tap outside or ✕ to close.
                  </p>
                </motion.div>
              )}

              {/* Phase status text */}
              {phase !== 'result' && (
                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-muted">
                  {phase === 'spawn' && 'Opening…'}
                  {phase === 'shake' && 'Opening…'}
                  {phase === 'open' && 'Opened!'}
                  {phase === 'reel' && 'Rolling…'}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
