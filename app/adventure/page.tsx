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

// ── Stylized floating islands ──────────────────────────────────────────────

function ForestIsland({ dim }: { dim: boolean }) {
  return (
    <svg viewBox="0 0 120 110" width="120" height="110">
      {/* Island shadow */}
      <ellipse cx="60" cy="100" rx="42" ry="7" fill="rgba(0,0,0,0.45)" />
      {/* Earth body */}
      <ellipse cx="60" cy="86" rx="44" ry="20" fill={dim ? '#2a3a2a' : '#3d2b1a'} />
      {/* Grass top layer */}
      <ellipse cx="60" cy="80" rx="44" ry="16" fill={dim ? '#2e4a2e' : '#3d8a50'} />
      <ellipse cx="60" cy="76" rx="44" ry="13" fill={dim ? '#356035' : '#5aad6a'} />
      {/* Rocks */}
      <ellipse cx="22" cy="75" rx="6" ry="3.5" fill={dim ? '#3a503a' : '#4a7a5a'} />
      <ellipse cx="95" cy="76" rx="5" ry="3" fill={dim ? '#3a503a' : '#4a7a5a'} />
      {/* Tree 1 */}
      <rect x="29" y="60" width="4" height="14" fill={dim ? '#3a2a1a' : '#6b3e1e'} />
      <polygon points="31,26 21,60 41,60" fill={dim ? '#2a402a' : '#1e5c2a'} />
      <polygon points="31,40 23,62 39,62" fill={dim ? '#2e4a2e' : '#267a34'} />
      {/* Tree 2 */}
      <rect x="57" y="56" width="4" height="18" fill={dim ? '#3a2a1a' : '#6b3e1e'} />
      <polygon points="59,18 47,56 71,56" fill={dim ? '#2a402a' : '#1e5c2a'} />
      <polygon points="59,35 49,58 69,58" fill={dim ? '#2e4a2e' : '#267a34'} />
      {/* Tree 3 */}
      <rect x="84" y="60" width="4" height="14" fill={dim ? '#3a2a1a' : '#6b3e1e'} />
      <polygon points="86,28 76,60 96,60" fill={dim ? '#2a402a' : '#1e5c2a'} />
      <polygon points="86,42 78,62 94,62" fill={dim ? '#2e4a2e' : '#267a34'} />
      {/* Campfire glow */}
      {!dim && <ellipse cx="48" cy="74" rx="4" ry="2" fill="rgba(255,160,40,0.5)" />}
      {!dim && <ellipse cx="48" cy="73" rx="2" ry="3" fill="rgba(255,100,20,0.7)" />}
    </svg>
  );
}

function WinterIsland({ dim }: { dim: boolean }) {
  return (
    <svg viewBox="0 0 120 110" width="120" height="110">
      {/* Shadow */}
      <ellipse cx="60" cy="100" rx="42" ry="7" fill="rgba(0,0,0,0.45)" />
      {/* Rock base */}
      <ellipse cx="60" cy="86" rx="44" ry="20" fill={dim ? '#1a2030' : '#1c2e48'} />
      {/* Snow layer */}
      <ellipse cx="60" cy="78" rx="44" ry="16" fill={dim ? '#2a3040' : '#2a4060'} />
      <ellipse cx="60" cy="74" rx="44" ry="13" fill={dim ? '#364050' : '#c8e8f8'} />
      {/* Frozen rocks */}
      <ellipse cx="18" cy="73" rx="7" ry="4" fill={dim ? '#2a3848' : '#a0c8e0'} />
      <ellipse cx="96" cy="74" rx="6" ry="3.5" fill={dim ? '#2a3848' : '#a0c8e0'} />
      {/* Bare tree 1 */}
      <rect x="32" y="50" width="3" height="24" fill={dim ? '#2a3040' : '#6080a0'} />
      <line x1="33" y1="58" x2="22" y2="48" stroke={dim ? '#2a3040' : '#6080a0'} strokeWidth="2" />
      <line x1="33" y1="58" x2="44" y2="50" stroke={dim ? '#2a3040' : '#6080a0'} strokeWidth="2" />
      <line x1="33" y1="64" x2="24" y2="58" stroke={dim ? '#2a3040' : '#6080a0'} strokeWidth="1.5" />
      {/* Bare tree 2 */}
      <rect x="82" y="52" width="3" height="22" fill={dim ? '#2a3040' : '#6080a0'} />
      <line x1="83" y1="60" x2="73" y2="50" stroke={dim ? '#2a3040' : '#6080a0'} strokeWidth="2" />
      <line x1="83" y1="60" x2="93" y2="52" stroke={dim ? '#2a3040' : '#6080a0'} strokeWidth="2" />
      <line x1="83" y1="66" x2="74" y2="60" stroke={dim ? '#2a3040' : '#6080a0'} strokeWidth="1.5" />
      {/* Ice crystals */}
      {!dim && <>
        <polygon points="58,50 55,62 61,62" fill="rgba(160,220,255,0.8)" />
        <polygon points="65,46 62,56 68,56" fill="rgba(180,230,255,0.7)" />
        <polygon points="50,52 47,60 53,60" fill="rgba(150,210,250,0.75)" />
      </>}
      {dim && <>
        <polygon points="58,50 55,62 61,62" fill="rgba(80,110,150,0.6)" />
        <polygon points="65,46 62,56 68,56" fill="rgba(70,100,140,0.5)" />
      </>}
    </svg>
  );
}

function WitchIsland({ dim }: { dim: boolean }) {
  return (
    <svg viewBox="0 0 120 110" width="120" height="110">
      {/* Shadow */}
      <ellipse cx="60" cy="100" rx="42" ry="7" fill="rgba(0,0,0,0.55)" />
      {/* Dark earth base */}
      <ellipse cx="60" cy="86" rx="44" ry="20" fill={dim ? '#18101e' : '#1a0c28'} />
      {/* Ground */}
      <ellipse cx="60" cy="78" rx="44" ry="16" fill={dim ? '#201830' : '#280d40'} />
      <ellipse cx="60" cy="74" rx="44" ry="13" fill={dim ? '#28203a' : '#321050'} />
      {/* Rocks / magic stones */}
      <ellipse cx="20" cy="73" rx="7" ry="4" fill={dim ? '#2a1a38' : '#4a1a68'} />
      <ellipse cx="95" cy="74" rx="6" ry="3.5" fill={dim ? '#2a1a38' : '#4a1a68'} />
      {/* Dead tree 1 */}
      <rect x="30" y="38" width="4" height="36" fill={dim ? '#2a1a30' : '#3a1a50'} />
      <line x1="32" y1="48" x2="16" y2="36" stroke={dim ? '#2a1a30' : '#3a1a50'} strokeWidth="3" />
      <line x1="32" y1="52" x2="46" y2="42" stroke={dim ? '#2a1a30' : '#3a1a50'} strokeWidth="2.5" />
      <line x1="32" y1="58" x2="20" y2="52" stroke={dim ? '#2a1a30' : '#3a1a50'} strokeWidth="2" />
      {/* Dead tree 2 */}
      <rect x="82" y="42" width="4" height="32" fill={dim ? '#2a1a30' : '#3a1a50'} />
      <line x1="84" y1="52" x2="70" y2="42" stroke={dim ? '#2a1a30' : '#3a1a50'} strokeWidth="2.5" />
      <line x1="84" y1="56" x2="96" y2="46" stroke={dim ? '#2a1a30' : '#3a1a50'} strokeWidth="2" />
      {/* Glowing mushrooms */}
      {!dim && <>
        <ellipse cx="48" cy="74" rx="5" ry="3" fill="rgba(168,85,247,0.9)" />
        <rect x="46" y="70" width="4" height="5" fill="rgba(140,60,210,0.8)" />
        <ellipse cx="48" cy="73" rx="5" ry="3" fill="rgba(192,132,252,0.6)" />
        <ellipse cx="70" cy="75" rx="4" ry="2.5" fill="rgba(88,212,192,0.9)" />
        <rect x="68" y="71" width="3" height="5" fill="rgba(60,180,160,0.8)" />
      </>}
      {dim && <>
        <ellipse cx="48" cy="74" rx="5" ry="3" fill="rgba(80,40,120,0.7)" />
        <ellipse cx="70" cy="75" rx="4" ry="2.5" fill="rgba(40,90,80,0.7)" />
      </>}
    </svg>
  );
}

function ElvenIsland({ dim }: { dim: boolean }) {
  return (
    <svg viewBox="0 0 120 110" width="120" height="110">
      {/* Shadow */}
      <ellipse cx="60" cy="100" rx="42" ry="7" fill="rgba(0,0,0,0.4)" />
      {/* Ancient earth base */}
      <ellipse cx="60" cy="86" rx="44" ry="20" fill={dim ? '#181008' : '#2a1c08'} />
      {/* Grass */}
      <ellipse cx="60" cy="78" rx="44" ry="16" fill={dim ? '#282010' : '#3a2c10'} />
      <ellipse cx="60" cy="74" rx="44" ry="13" fill={dim ? '#302818' : '#6a5020'} />
      {/* Ruin stones */}
      <rect x="16" y="66" width="8" height="10" rx="1" fill={dim ? '#302010' : '#8a7040'} />
      <rect x="18" y="62" width="5" height="5" rx="1" fill={dim ? '#302010' : '#9a8050'} />
      <rect x="90" y="67" width="7" height="9" rx="1" fill={dim ? '#302010' : '#8a7040'} />
      {/* Ancient tree trunk */}
      <rect x="54" y="32" width="12" height="42" rx="3" fill={dim ? '#201408' : '#5a3818'} />
      {/* Root spread */}
      <ellipse cx="60" cy="72" rx="22" ry="5" fill={dim ? '#282010' : '#4a3010'} />
      {/* Canopy layers */}
      <ellipse cx="60" cy="46" rx="28" ry="18" fill={dim ? '#202818' : '#1e6030'} />
      <ellipse cx="50" cy="38" rx="20" ry="14" fill={dim ? '#283020' : '#267838'} />
      <ellipse cx="70" cy="40" rx="18" ry="13" fill={dim ? '#283020' : '#1e6830'} />
      <ellipse cx="60" cy="32" rx="16" ry="12" fill={dim ? '#2a3222' : '#2e8840'} />
      {/* Golden flower accents */}
      {!dim && <>
        <circle cx="36" cy="71" r="3" fill="rgba(253,224,71,0.9)" />
        <circle cx="80" cy="72" r="2.5" fill="rgba(253,224,71,0.85)" />
        <circle cx="44" cy="69" r="2" fill="rgba(120,216,144,0.9)" />
        <circle cx="76" cy="70" r="2" fill="rgba(120,216,144,0.85)" />
      </>}
      {dim && <>
        <circle cx="36" cy="71" r="3" fill="rgba(120,100,30,0.5)" />
        <circle cx="80" cy="72" r="2.5" fill="rgba(120,100,30,0.5)" />
      </>}
    </svg>
  );
}

function WorldIsland({ world, unlocked }: { world: number; unlocked: boolean }) {
  const dim = !unlocked;
  if (world === 1) return <ForestIsland dim={dim} />;
  if (world === 2) return <WinterIsland dim={dim} />;
  if (world === 3) return <WitchIsland dim={dim} />;
  if (world === 4) return <ElvenIsland dim={dim} />;
  return null;
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
