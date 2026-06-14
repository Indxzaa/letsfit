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

const DEV_EMAIL = 'indyy8262@gmail.com';

// [leftPct, topPct] — node is 120×120px within h-[640px] relative container
const POSITIONS = [[18, 10], [60, 32], [14, 56], [58, 78]] as const;

const PLANET_GRADIENTS = [
  'radial-gradient(circle at 33% 28%, #86efac 0%, #16a34a 42%, #052e16 100%)',
  'radial-gradient(circle at 33% 28%, #bfdbfe 0%, #3b82f6 42%, #1e3a8a 100%)',
  'radial-gradient(circle at 33% 28%, #e9d5ff 0%, #a855f7 42%, #3b0764 100%)',
  'radial-gradient(circle at 33% 28%, #fde68a 0%, #f59e0b 42%, #78350f 100%)',
];

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

export default function AdventurePage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [entering, setEntering] = useState<number | null>(null);
  const { user } = useAuth();
  const isDev = user?.email === DEV_EMAIL;
  const router = useRouter();

  useEffect(() => {
    setProgress(loadProgress());
    return subscribeToProgress(() => setProgress(loadProgress()));
  }, []);

  const handleClick = (world: number) => {
    if (!isWorldUnlocked(world, progress, isDev)) return;
    setEntering(world);
    setTimeout(() => router.push(`/adventure/${world}`), 420);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06030f 0%, #0b0422 50%, #030a14 100%)' }}>
      <Navbar />

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {STARS.map(([x, y], i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${x}%`, top: `${y}%`, width: i % 4 === 0 ? 2 : 1, height: i % 4 === 0 ? 2 : 1, opacity: 0.15 + (i % 5) * 0.07 }} />
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-6">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-1">World Map</h1>
          <p className="text-white/35 text-sm">Choose your realm to begin</p>
        </div>

        {/* Map container */}
        <div className="relative h-[640px]">
          {/* Trail path SVG — viewBox matches approx layout */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 640" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g-trail" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                <stop offset="33%" stopColor="#60a5fa" stopOpacity="0.5" />
                <stop offset="66%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {/* Centers: W1(132,124) W2(300,265) W3(116,418) W4(292,559) */}
            <path d="M 132 124 C 132 205 300 188 300 265 C 300 342 116 335 116 418 C 116 495 292 488 292 559"
              fill="none" stroke="url(#g-trail)" strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" />
          </svg>

          {/* World nodes */}
          {([1, 2, 3, 4] as const).map((world, wi) => {
            const theme = WORLD_THEMES[world];
            const [lp, tp] = POSITIONS[wi];
            const unlocked = isWorldUnlocked(world, progress, isDev);
            const { done, total } = getWorldProg(world, progress);
            const allDone = done === total;
            const r = 62, circ = 2 * Math.PI * r, dashLen = (done / total) * circ;

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
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 3.5 + wi * 0.6, repeat: Infinity, ease: 'easeInOut' }}
                  onClick={() => handleClick(world)}
                  whileHover={unlocked ? { scale: 1.06 } : undefined}
                  whileTap={unlocked ? { scale: 0.96 } : undefined}
                >
                  {/* Outer ambient glow */}
                  {unlocked && (
                    <div className="absolute rounded-full pointer-events-none"
                      style={{ inset: -16, background: `radial-gradient(circle, ${theme.primary}28 0%, transparent 70%)`, filter: 'blur(6px)' }} />
                  )}

                  <div className="relative w-[120px] h-[120px]">
                    {/* Progress ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 134 134">
                      <circle cx="67" cy="67" r={r} fill="none" stroke={`${theme.primary}18`} strokeWidth="2.5" />
                      {done > 0 && (
                        <circle cx="67" cy="67" r={r} fill="none"
                          stroke={allDone ? '#22c55e' : theme.primary}
                          strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={`${dashLen} ${circ}`} />
                      )}
                    </svg>

                    {/* Planet sphere */}
                    <div className="absolute inset-[6px] rounded-full"
                      style={{
                        background: unlocked
                          ? PLANET_GRADIENTS[wi]
                          : 'radial-gradient(circle at 33% 28%, #374151 0%, #1f2937 50%, #0f172a 100%)',
                        boxShadow: unlocked
                          ? `0 0 28px ${theme.primary}44, 0 8px 24px rgba(0,0,0,0.6), inset 0 -8px 20px rgba(0,0,0,0.4)`
                          : 'inset 0 0 20px rgba(0,0,0,0.6)',
                      }}>
                      {/* Specular highlight */}
                      {unlocked && (
                        <div className="absolute top-[10%] left-[18%] w-[28%] h-[9%] rounded-full opacity-25"
                          style={{ background: 'white' }} />
                      )}
                      {/* Shadow band */}
                      {unlocked && (
                        <div className="absolute inset-0 rounded-full opacity-20"
                          style={{ background: 'radial-gradient(ellipse at 72% 72%, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
                      )}
                    </div>

                    {/* Lock overlay */}
                    {!unlocked && (
                      <div className="absolute inset-[6px] rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Lock className="w-7 h-7 text-white/30" />
                      </div>
                    )}

                    {/* Completion crown */}
                    {allDone && (
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: '#22c55e', boxShadow: '0 0 12px #22c55e99' }}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center" style={{ width: 120 }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                      style={{ color: unlocked ? theme.primary : 'rgba(255,255,255,0.2)' }}>
                      World {world}
                    </div>
                    <div className="text-sm font-semibold leading-tight"
                      style={{ color: unlocked ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.2)' }}>
                      {theme.name}
                    </div>
                    {unlocked && !allDone && (
                      <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {done}/{total} stages
                      </div>
                    )}
                    {allDone && (
                      <div className="text-[10px] mt-1 font-semibold text-green-400">Completed</div>
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
