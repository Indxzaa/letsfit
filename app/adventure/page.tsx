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

// Island size: 220×200. Container: max-w-lg (~512px logical, 400px SVG viewBox).
// [leftPct, topPct] positions island top-left within the map container.
const POSITIONS = [[4, 2], [46, 24], [4, 50], [46, 74]] as const;

// Island display size
const ISLAND_W = 220;
const ISLAND_H = 200;

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

// ── Island component ──────────────────────────────────────────────────────

function WorldIsland({ world, unlocked }: { world: number; unlocked: boolean }) {
  const theme = WORLD_THEMES[world];
  return (
    <div className="relative" style={{ width: ISLAND_W, height: ISLAND_H }}>
      <img
        src={theme.islandImg}
        alt={theme.name}
        draggable={false}
        style={{
          width: ISLAND_W,
          height: ISLAND_H,
          objectFit: 'contain',
          objectPosition: 'center bottom',
          display: 'block',
          filter: unlocked ? 'none' : 'grayscale(75%) brightness(0.4)',
        }}
      />
      {/* Neo border frame — unlocked only */}
      {unlocked && (
        <div className="absolute inset-0 pointer-events-none"
          style={{
            outline: `3px solid ${theme.primary}`,
            outlineOffset: '3px',
            boxShadow: `4px 4px 0 rgba(0,0,0,0.55)`,
          }}
        />
      )}
      {/* Lock overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.15)', padding: '10px 12px' }}>
            <Lock className="w-8 h-8 text-white/35" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

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

      {/* Navbar blend */}
      <div className="fixed top-0 left-0 right-0 h-24 pointer-events-none" style={{ zIndex: 39,
        background: 'linear-gradient(to bottom, rgba(6,3,15,0.85) 0%, transparent 100%)' }} />

      <div className="max-w-lg mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest"
            style={{ border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
            Adventure Mode
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2 uppercase tracking-tight">
            World Map
          </h1>
          <p className="text-white/35 text-sm font-semibold uppercase tracking-widest">
            Choose your realm
          </p>
        </div>

        {/* Map container — taller to accommodate larger islands */}
        <div className="relative h-[920px]">

          {/* ── Curved adventure path ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 920"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Earth-tone dirt path gradient */}
              <linearGradient id="path-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#7ecf8a" stopOpacity="0.7" />
                <stop offset="33%"  stopColor="#7cc4e8" stopOpacity="0.7" />
                <stop offset="66%"  stopColor="#b870dc" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#e8c050" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/*
              Island centers (approximate, based on POSITIONS + ISLAND_W/2, ISLAND_H/2):
              W1: left=4%→~16px, top=2%→~18px  → center ≈ (16+110, 18+100) = (126, 118)
              W2: left=46%→~184px, top=24%→~221px → center ≈ (184+110, 221+100) = (294, 321)
              W3: left=4%→~16px, top=50%→~460px  → center ≈ (126, 560)
              W4: left=46%→~184px, top=74%→~681px → center ≈ (294, 781)
              Path connects bottom of each island to top of next.
            */}

            {/* Outer earth path (wider, darker) */}
            <path
              d="M 126 215 C 126 280 294 260 294 321 C 294 420 126 440 126 560 C 126 650 294 670 294 781"
              fill="none"
              stroke="rgba(60,40,20,0.45)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner path highlight */}
            <path
              d="M 126 215 C 126 280 294 260 294 321 C 294 420 126 440 126 560 C 126 650 294 670 294 781"
              fill="none"
              stroke="url(#path-grad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 8"
            />

            {/* Stepping stone markers along the path */}
            {[
              [194, 262], [240, 295], [210, 380], [160, 450], [158, 510],
              [210, 605], [254, 650], [276, 710],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="6" fill="rgba(30,20,10,0.55)" stroke="rgba(120,100,60,0.5)" strokeWidth="1.5" />
                <circle cx={cx} cy={cy} r="3" fill="rgba(160,130,80,0.6)" />
              </g>
            ))}
          </svg>

          {/* ── World nodes ── */}
          {([1, 2, 3, 4] as const).map((world, wi) => {
            const theme = WORLD_THEMES[world];
            const [lp, tp] = POSITIONS[wi];
            const unlocked = isWorldUnlocked(world, progress, isDev);
            const { done, total } = getWorldProg(world, progress);
            const allDone = done === total;

            return (
              <motion.div
                key={world}
                className="absolute select-none"
                style={{ left: `${lp}%`, top: `${tp}%` }}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: wi * 0.1, type: 'spring', stiffness: 180 }}
              >
                <motion.div
                  className={unlocked ? 'cursor-pointer' : 'cursor-default'}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.8 + wi * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  onClick={() => handleClick(world)}
                  whileHover={unlocked ? { scale: 1.05 } : undefined}
                  whileTap={unlocked ? { scale: 0.96 } : undefined}
                >
                  <div className="relative" style={{ width: ISLAND_W }}>
                    <WorldIsland world={world} unlocked={unlocked} />

                    {/* Completion badge */}
                    {allDone && (
                      <div
                        className="absolute -top-2 -right-2 w-9 h-9 flex items-center justify-center text-sm font-bold z-10"
                        style={{
                          background: '#22c55e',
                          border: '3px solid #000',
                          boxShadow: '2px 2px 0 #000',
                          color: '#fff',
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  {/* World label */}
                  <div className="mt-2 text-center" style={{ width: ISLAND_W }}>
                    <div
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: unlocked ? theme.primary : 'rgba(255,255,255,0.2)' }}
                    >
                      World {world}
                    </div>
                    <div
                      className="font-display text-sm font-bold leading-tight"
                      style={{ color: unlocked ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.2)' }}
                    >
                      {theme.name}
                    </div>
                    {unlocked && !allDone && (
                      <div
                        className="text-[10px] mt-1.5 font-semibold tabular-nums"
                        style={{ color: 'rgba(255,255,255,0.38)' }}
                      >
                        {done}/{total} stages
                      </div>
                    )}
                    {allDone && (
                      <div className="text-[10px] mt-1.5 font-bold" style={{ color: '#4ade80' }}>
                        Completed
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* World enter transition overlay */}
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
