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

// [leftPct, topPct] — node is 140×160px within h-[680px] relative container
const POSITIONS = [[12, 6], [56, 28], [10, 54], [55, 76]] as const;

// Fixed star positions — avoid hydration mismatch
const STARS = [
  [8,5],[15,18],[25,8],[35,22],[48,6],[55,15],[72,9],[82,3],[92,20],
  [5,35],[20,42],[38,38],[50,50],[65,44],[78,35],[90,48],
  [12,62],[30,70],[42,65],[58,72],[75,60],[88,68],[7,85],[22,90],
  [40,82],[55,93],[70,87],[85,94],[45,28],[60,68],[25,55],[33,14],
];

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

// ── Island artwork ────────────────────────────────────────────────────────

function WorldIsland({ world, unlocked }: { world: number; unlocked: boolean }) {
  const theme = WORLD_THEMES[world];
  return (
    <div className="relative" style={{ width: 140, height: 130 }}>
      <img
        src={theme.islandImg}
        alt={theme.name}
        draggable={false}
        style={{
          width: 140,
          height: 130,
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          filter: unlocked ? 'none' : 'grayscale(80%) brightness(0.45)',
          border: unlocked ? `3px solid ${theme.primary}` : '3px solid rgba(255,255,255,0.15)',
          boxShadow: unlocked ? `4px 4px 0 rgba(0,0,0,0.6)` : 'none',
        }}
      />
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}>
          <Lock className="w-8 h-8 text-white/40" />
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
    // Redirect to the last-visited world if one is stored
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

      {/* Top gradient blends Navbar into the adventure background */}
      <div className="fixed top-0 left-0 right-0 h-24 pointer-events-none" style={{ zIndex: 39,
        background: 'linear-gradient(to bottom, rgba(6,3,15,0.85) 0%, transparent 100%)' }} />

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {STARS.map(([x, y], i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${x}%`, top: `${y}%`, width: i % 4 === 0 ? 2 : 1, height: i % 4 === 0 ? 2 : 1, opacity: 0.12 + (i % 5) * 0.07 }} />
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-24 pb-20">
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

        {/* Map container */}
        <div className="relative h-[680px]">

          {/* Stone-path trail SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 680" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g-trail" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.6" />
                <stop offset="33%"  stopColor="#7cc4e8" stopOpacity="0.6" />
                <stop offset="66%"  stopColor="#b870dc" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#e8c050" stopOpacity="0.6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Main glow path */}
            <path d="M 130 90 C 130 200 310 180 310 280 C 310 370 120 360 120 450 C 120 540 295 535 295 615"
              fill="none" stroke="url(#g-trail)" strokeWidth="1.5" strokeOpacity="0.35" filter="url(#glow)" />
            {/* Stone nodes along the path */}
            {[
              [183, 185], [238, 228], [210, 318], [165, 390], [180, 488], [242, 568],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
                <circle cx={cx} cy={cy} r="2.5" fill="rgba(255,255,255,0.18)" />
              </g>
            ))}
            {/* Rope bridge horizontal lines between worlds */}
            <line x1="158" y1="135" x2="220" y2="178" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="258" y1="298" x2="185" y2="368" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="150" y1="468" x2="218" y2="530" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 6" />
          </svg>

          {/* World nodes */}
          {([1, 2, 3, 4] as const).map((world, wi) => {
            const theme = WORLD_THEMES[world];
            const [lp, tp] = POSITIONS[wi];
            const unlocked = isWorldUnlocked(world, progress, isDev);
            const { done, total } = getWorldProg(world, progress);
            const allDone = done === total;
            const r = 68, circ = 2 * Math.PI * r, dashLen = (done / total) * circ;

            return (
              <motion.div key={world}
                className="absolute select-none"
                style={{ left: `${lp}%`, top: `${tp}%` }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: wi * 0.1, type: 'spring', stiffness: 200 }}
              >
                <motion.div
                  className={unlocked ? 'cursor-pointer' : 'cursor-default'}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5 + wi * 0.6, repeat: Infinity, ease: 'easeInOut' }}
                  onClick={() => handleClick(world)}
                  whileHover={unlocked ? { scale: 1.07 } : undefined}
                  whileTap={unlocked ? { scale: 0.95 } : undefined}
                >
                  {/* Ambient glow beneath island */}
                  {unlocked && (
                    <div className="absolute pointer-events-none"
                      style={{
                        inset: -20, bottom: -4,
                        background: `radial-gradient(ellipse at 50% 80%, ${theme.primary}30 0%, transparent 65%)`,
                        filter: 'blur(8px)',
                      }} />
                  )}

                  <div className="relative w-[140px]" style={{ height: 160 }}>
                    {/* Progress ring */}
                    <svg className="absolute inset-0 w-full" style={{ height: 150, top: 0 }} viewBox="0 0 150 150">
                      <circle cx="75" cy="75" r={r} fill="none" stroke={`${theme.primary}18`} strokeWidth="3" />
                      {done > 0 && (
                        <circle cx="75" cy="75" r={r} fill="none"
                          stroke={allDone ? '#22c55e' : theme.primary}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${dashLen} ${circ}`}
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px' }} />
                      )}
                    </svg>

                    {/* Island */}
                    <div className="absolute" style={{ left: '50%', top: 15, transform: 'translateX(-50%)' }}>
                      <WorldIsland world={world} unlocked={unlocked} />
                    </div>

                    {/* Lock overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 20 }}>
                        <div style={{ background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.1)', padding: '8px 10px' }}>
                          <Lock className="w-6 h-6 text-white/30" />
                        </div>
                      </div>
                    )}

                    {/* Completion badge */}
                    {allDone && (
                      <div className="absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center text-sm font-bold"
                        style={{
                          background: '#22c55e',
                          border: '3px solid var(--neo-black, #000)',
                          boxShadow: '2px 2px 0 #000',
                          color: '#fff',
                        }}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-1 text-center" style={{ width: 140 }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: unlocked ? theme.primary : 'rgba(255,255,255,0.2)' }}>
                      World {world}
                    </div>
                    <div className="font-display text-sm font-bold leading-tight"
                      style={{ color: unlocked ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.2)' }}>
                      {theme.name}
                    </div>
                    {unlocked && !allDone && (
                      <div className="text-[10px] mt-1.5 font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
          <motion.div className="fixed inset-0 z-50 pointer-events-none"
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
