'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { WORLD_THEMES } from '@/lib/worlds';
import { STAGES, isStageComplete } from '@/lib/stages';
import { loadProgress, subscribeToProgress, type Progress } from '@/lib/progress';
import { useAuth } from '@/components/AuthProvider';
import { AdventureSkeleton } from '@/components/Skeleton';

const DEV_EMAIL = 'indyy8262@gmail.com';

function isWorldUnlocked(world: number, progress: Progress | null, isDev: boolean) {
  if (isDev || world === 1) return true;
  if (!progress) return false;
  const prevBoss = STAGES.find(s => s.world === world - 1 && s.type === 'boss');
  return prevBoss ? isStageComplete(prevBoss, progress) : false;
}

function getWorldProg(world: number, progress: Progress | null) {
  const stages = STAGES.filter(s => s.world === world);
  if (!progress) return { done: 0, total: stages.length };
  return { done: stages.filter(s => isStageComplete(s, progress)).length, total: stages.length };
}

// Alternating left / right — S-shape layout
// [side: 'left'|'right', topPx in a 1120px container]
const ISLAND_LAYOUT = [
  { side: 'left',  top: 0   },
  { side: 'right', top: 258 },
  { side: 'left',  top: 530 },
  { side: 'right', top: 798 },
] as const;

export default function AdventurePage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [entering, setEntering] = useState<number | null>(null);
  const { user } = useAuth();
  const isDev = user?.email === DEV_EMAIL;
  const router = useRouter();

  useEffect(() => {
    const last = typeof window !== 'undefined'
      ? localStorage.getItem('letsfit:lastWorld')
      : null;
    if (last) {
      router.replace(`/adventure/${last}`);
      return;
    }
    setProgress(loadProgress());
    return subscribeToProgress(() => setProgress(loadProgress()));
  }, []);

  if (!progress) return <AdventureSkeleton />;

  const handleClick = (world: number) => {
    if (!isWorldUnlocked(world, progress, isDev)) return;
    setEntering(world);
    setTimeout(() => router.push(`/adventure/${world}`), 420);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06030f 0%, #0b0422 50%, #030a14 100%)' }}>
      <Navbar />
      <div className="fixed top-0 left-0 right-0 h-24 pointer-events-none" style={{ zIndex: 39,
        background: 'linear-gradient(to bottom, rgba(6,3,15,0.85) 0%, transparent 100%)' }} />

      <div className="max-w-xl mx-auto px-4 sm:px-8 pt-24 pb-24">

        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest"
            style={{ border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
          >
            Adventure Mode
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2 uppercase tracking-tight">
            World Map
          </h1>
          <p className="text-white/35 text-sm font-semibold uppercase tracking-widest">
            Choose your realm
          </p>
        </div>

        {/* ── Map ── */}
        <div className="relative" style={{ height: 1120 }}>

          {/* ── S-curve adventure path (SVG overlay) ──
               viewBox matches container: 576 × 1120
               Island centers (approx, island width ~300, height ~240):
                 L = left 4% = ~23px, center x ≈ 23+150 = 173
                 R = right 4% = 576-23-300=253px left, center x ≈ 253+150 = 403
               Tops: 0, 258, 530, 798 → island midpoints at top+120:
                 W1 center: (173, 120)
                 W2 center: (403, 378)
                 W3 center: (173, 650)
                 W4 center: (403, 918)
          ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 576 1120"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outer earth shadow */}
            <path
              d="M 173 230 C 173 310 403 300 403 378
                 M 403 490 C 403 570 173 560 173 650
                 M 173 762 C 173 840 403 830 403 918"
              fill="none"
              stroke="rgba(50,35,15,0.55)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner dashed trail */}
            <path
              d="M 173 230 C 173 310 403 300 403 378
                 M 403 490 C 403 570 173 560 173 650
                 M 173 762 C 173 840 403 830 403 918"
              fill="none"
              stroke="rgba(160,130,70,0.55)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="14 9"
            />
            {/* Stepping stones */}
            {([
              [250, 270],[320, 310],[355, 350],
              [310, 510],[240, 555],[195, 600],
              [255, 775],[330, 818],[375, 860],
            ] as [number,number][]).map(([cx,cy],i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="6.5" fill="rgba(25,18,8,0.6)" stroke="rgba(130,105,55,0.45)" strokeWidth="1.5" />
                <circle cx={cx} cy={cy} r="3" fill="rgba(160,130,65,0.65)" />
              </g>
            ))}
          </svg>

          {/* ── World nodes ── */}
          {([1, 2, 3, 4] as const).map((world, wi) => {
            const theme = WORLD_THEMES[world];
            const { side, top } = ISLAND_LAYOUT[wi];
            const unlocked = isWorldUnlocked(world, progress, isDev);
            const { done, total } = getWorldProg(world, progress);
            const allDone = done === total;

            return (
              <motion.div
                key={world}
                className="absolute"
                style={{
                  top,
                  ...(side === 'left' ? { left: '4%' } : { right: '4%' }),
                  width: 'clamp(240px, 52vw, 310px)',
                }}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, delay: wi * 0.12, type: 'spring', stiffness: 160 }}
              >
                {/* Floating container */}
                <motion.div
                  className={unlocked ? 'cursor-pointer select-none' : 'cursor-default select-none'}
                  animate={{
                    y: [0, -(3 + wi), 0],
                    rotate: [0, wi % 2 === 0 ? 0.4 : -0.4, 0],
                  }}
                  transition={{ duration: 4.5 + wi * 0.7, repeat: Infinity, ease: 'easeInOut' }}
                  onClick={() => handleClick(world)}
                  whileHover={unlocked ? { scale: 1.04 } : undefined}
                  whileTap={unlocked ? { scale: 0.97 } : undefined}
                >
                  {/* Island image — no card, no border, no background */}
                  <div className="relative">
                    <img
                      src={theme.islandImg}
                      alt={theme.name}
                      draggable={false}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        filter: unlocked
                          ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.7))'
                          : 'grayscale(80%) brightness(0.38) drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                      }}
                    />

                    {/* Lock overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '2px solid rgba(255,255,255,0.12)',
                          padding: '10px 12px',
                        }}>
                          <Lock className="w-8 h-8 text-white/35" />
                        </div>
                      </div>
                    )}

                    {/* Completion badge */}
                    {allDone && (
                      <div
                        className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center font-bold text-sm"
                        style={{
                          background: '#22c55e',
                          border: '3px solid #000',
                          boxShadow: '2px 2px 0 #000',
                          color: '#fff',
                          zIndex: 10,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Label below island — never overlays the image */}
                  <div className="mt-3 text-center px-1">
                    <div
                      className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                      style={{ color: unlocked ? theme.primary : 'rgba(255,255,255,0.18)' }}
                    >
                      World {world}
                    </div>
                    <div
                      className="font-display text-base font-bold uppercase leading-tight"
                      style={{ color: unlocked ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)' }}
                    >
                      {theme.name}
                    </div>
                    <div
                      className="text-[11px] mt-1 font-semibold tabular-nums"
                      style={{ color: allDone ? '#4ade80' : 'rgba(255,255,255,0.32)' }}
                    >
                      {allDone ? '✓ Completed' : `${done} / ${total} Stages`}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* World enter transition */}
      <AnimatePresence>
        {entering !== null && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.42, ease: 'easeIn' }}
            style={{ background: WORLD_THEMES[entering].introBg }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
