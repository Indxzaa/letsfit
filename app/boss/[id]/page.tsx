'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Trophy, Lock, Dumbbell, ArrowUp, Zap, Shield, Coins, Target, Star, Flame } from 'lucide-react';
import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { loadProgress, recordBossDefeat, subscribeToProgress, type Progress } from '@/lib/progress';
import { getBoss, BOSSES, TIER_CONFIG, BOSS_GAME_CONFIGS } from '@/lib/bosses';

type Relic = { id: string; name: string; desc: string; icon: React.ReactNode; effect: 'damage' | 'shield' | 'coins' | 'crit' | 'xp' };
const ALL_RELICS: Relic[] = [
  { id: 'power-band',   name: 'Power Band',      desc: '+25% Boss Damage',         icon: <Zap className="w-5 h-5" />,    effect: 'damage' },
  { id: 'iron-shield',  name: 'Iron Shield',      desc: 'Block first penalty',       icon: <Shield className="w-5 h-5" />, effect: 'shield' },
  { id: 'lucky-charm',  name: 'Lucky Charm',      desc: '+30% Coin Rewards',         icon: <Coins className="w-5 h-5" />,  effect: 'coins'  },
  { id: 'focus-lens',   name: 'Focus Lens',       desc: '+15% Crit Chance',          icon: <Target className="w-5 h-5" />, effect: 'crit'   },
  { id: 'star-shard',   name: 'Star Shard',       desc: '+50% XP on Victory',        icon: <Star className="w-5 h-5" />,   effect: 'xp'     },
  { id: 'rage-stone',   name: 'Rage Stone',       desc: '+40% Damage when Desperate',icon: <Flame className="w-5 h-5" />,  effect: 'damage' },
];
function pickRelics(bossId: string): Relic[] {
  const seed = bossId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const shuffled = [...ALL_RELICS].sort((a, b) => {
    const ha = Math.sin(seed + a.id.length) * 10000;
    const hb = Math.sin(seed + b.id.length) * 10000;
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb));
  });
  return shuffled.slice(0, 3);
}
import { checkAchievements } from '@/lib/achievements';
import { getDetectorForSlug, drawSkeleton, type Detector } from '@/lib/exerciseDetectors';
import { AchievementToastLayer } from '@/components/AchievementToast';
import { BossHealthBar } from '@/components/BossHealthBar';
import { WorldParticles } from '@/components/WorldParticles';
import Navbar from '@/components/Navbar';
import { getWorldTheme } from '@/lib/worlds';

type Phase = 'intro' | 'battle' | 'victory' | 'defeat';
type AttackPhase = null | 'warning' | 'active';

function getFeedbackClass(text: string): string {
  if (text.includes('CRIT')) return 'feedback-crit';
  if (text.includes('FIRE')) return 'feedback-fire';
  if (text.includes('AMAZING') || text.includes('INSANE') || text.includes('LEGENDARY') || text.includes('UNSTOPPABLE')) return 'feedback-amazing';
  if (text.includes('PERFECT')) return 'feedback-perfect';
  if (text.includes('DOING WELL') || text.includes('NICE')) return 'feedback-combo';
  if (text.includes('REPS')) return 'feedback-reps';
  return 'feedback-default';
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

const BOSS_X_POSITIONS = [18, 30, 45, 60, 72];

export default function BossPage() {
  const params = useParams();
  const boss = getBoss(params.id as string);

  const [progress, setProgress]           = useState<Progress | null>(null);
  const [phase, setPhase]                 = useState<Phase>('intro');
  const [roundIndex, setRoundIndex]       = useState(0);
  const [reps, setReps]                   = useState(0);
  const [timeLeft, setTimeLeft]           = useState(0);
  const [roundSeconds, setRoundSeconds]   = useState(0);
  const [bossHp, setBossHp]               = useState(100);
  const [combo, setCombo]                 = useState(0);
  const [dmgEvent, setDmgEvent]           = useState<{ dmg: number; crit: boolean; id: number } | null>(null);
  const [bossIsHit, setBossIsHit]         = useState(false);
  const [achievementToasts, setAchievementToasts] = useState<string[]>([]);
  const [bossResult, setBossResult]       = useState<{ xp: number; coins: number; leveledUp: boolean } | null>(null);
  const [alreadyDefeated, setAlreadyDefeated] = useState(false);
  const [cameraReady, setCameraReady]     = useState(false);
  const [attackPhase, setAttackPhase]     = useState<AttackPhase>(null);
  const [bossXPos, setBossXPos]           = useState(65);
  const [penaltyEvent, setPenaltyEvent]   = useState<{ amount: number; dodged: boolean; id: number } | null>(null);
  const [feedbackMsg, setFeedbackMsg]     = useState<{ text: string; id: number } | null>(null);
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);
  const [worldComplete, setWorldComplete] = useState(false);

  const shieldUsedRef = useRef(false);

  const phaseRef        = useRef<Phase>('intro');
  const roundIndexRef   = useRef(0);
  const repCountRef     = useRef(0);
  const comboRef        = useRef(0);
  const bossHpRef       = useRef(100);
  const totalManualRef  = useRef(1);
  const lastRepTimeRef  = useRef(0);
  const immuneUntilRef  = useRef(0);

  const videoRef         = useRef<HTMLVideoElement>(null);
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const landmarkerRef    = useRef<PoseLandmarker | null>(null);
  const animationRef     = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const detectorRef      = useRef<Detector | null>(null);

  const overallTimer    = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimer      = useRef<ReturnType<typeof setInterval> | null>(null);
  const attackTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimer       = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  const setPhaseSync = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const triggerFeedback = useCallback((text: string) => {
    const id = Date.now();
    setFeedbackMsg({ text, id });
    setTimeout(() => setFeedbackMsg(f => f?.id === id ? null : f), 1400);
  }, []);

  const stopTimers = useCallback(() => {
    if (overallTimer.current) { clearInterval(overallTimer.current); overallTimer.current = null; }
    if (roundTimer.current)   { clearInterval(roundTimer.current);   roundTimer.current = null; }
    if (attackTimer.current)  { clearTimeout(attackTimer.current);   attackTimer.current = null; }
    if (moveTimer.current)    { clearTimeout(moveTimer.current);     moveTimer.current = null; }
  }, []);

  const stopCamera = useCallback(() => {
    const v = videoRef.current;
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const ensureLandmarker = useCallback(async (): Promise<PoseLandmarker> => {
    if (landmarkerRef.current) return landmarkerRef.current;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );
    const lm = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
    landmarkerRef.current = lm;
    return lm;
  }, []);

  const scheduleMove = useCallback(() => {
    if (!boss) return;
    const cfg = BOSS_GAME_CONFIGS[boss.id];
    if (!cfg) return;
    moveTimer.current = setTimeout(() => {
      if (phaseRef.current !== 'battle') return;
      setBossXPos(prev => {
        const opts = BOSS_X_POSITIONS.filter(p => Math.abs(p - prev) > 8);
        return opts[Math.floor(Math.random() * opts.length)] ?? 65;
      });
      scheduleMove();
    }, cfg.moveEveryMs);
  }, [boss]);

  const scheduleAttack = useCallback(() => {
    if (!boss) return;
    const cfg = BOSS_GAME_CONFIGS[boss.id];
    if (!cfg) return;
    const [min, max] = cfg.attackEveryMs;
    const delay = min + Math.random() * (max - min);
    attackTimer.current = setTimeout(() => {
      if (phaseRef.current !== 'battle') return;
      if (Date.now() < immuneUntilRef.current) { scheduleAttack(); return; }
      setAttackPhase('warning');
      const warnTimeout = setTimeout(() => {
        if (phaseRef.current !== 'battle') { setAttackPhase(null); return; }
        setAttackPhase('active');
        const active = Date.now() - lastRepTimeRef.current < 3000;
        const id = Date.now();
        if (active) {
          setPenaltyEvent({ amount: 0, dodged: true, id });
        } else if (selectedRelic?.effect === 'shield' && !shieldUsedRef.current) {
          shieldUsedRef.current = true;
          setPenaltyEvent({ amount: 0, dodged: true, id });
          triggerFeedback('SHIELD BLOCKED!');
        } else {
          const penalty = cfg.penaltyReps;
          const newReps = Math.max(0, repCountRef.current - penalty);
          repCountRef.current = newReps;
          setReps(newReps);
          immuneUntilRef.current = Date.now() + cfg.penaltyImmunityMs;
          setPenaltyEvent({ amount: penalty, dodged: false, id });
        }
        setTimeout(() => setPenaltyEvent(e => e?.id === id ? null : e), 1200);
        setTimeout(() => { setAttackPhase(null); scheduleAttack(); }, cfg.attackActiveMs);
      }, cfg.attackWarningMs);
      attackTimer.current = warnTimeout as ReturnType<typeof setTimeout>;
    }, delay);
  }, [boss]);

  const handleDetectedRep = useCallback(() => {
    if (phaseRef.current !== 'battle' || !boss) return;
    lastRepTimeRef.current = Date.now();

    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    setCombo(newCombo);

    const mult  = newCombo >= 10 ? 1.5 : newCombo >= 5 ? 1.25 : 1;
    const critBase = selectedRelic?.effect === 'crit' ? 0.25 : 0.1;
    const crit  = Math.random() < critBase;
    const base  = totalManualRef.current > 0 ? 100 / totalManualRef.current : 5;
    const rageMult = (selectedRelic?.id === 'rage-stone' && bossHpRef.current < 33) ? 1.4 : 1;
    const relicDmgMult = selectedRelic?.id === 'power-band' ? 1.25 : 1;
    const dmg   = Math.round(base * mult * rageMult * relicDmgMult * (crit ? 2 : 1));
    const newHp = Math.max(0, bossHpRef.current - dmg);
    bossHpRef.current = newHp;
    setBossHp(newHp);

    const id = Date.now();
    setDmgEvent({ dmg, crit, id });
    setTimeout(() => setDmgEvent(e => (e?.id === id ? null : e)), 900);
    setBossIsHit(true);
    setTimeout(() => setBossIsHit(false), 350);

    if (crit) triggerFeedback('⚡ CRITICAL HIT!');
    else if (newCombo === 3)  triggerFeedback('DOING WELL!');
    else if (newCombo === 5)  triggerFeedback('🔥 FIRE!');
    else if (newCombo === 10) triggerFeedback('⚡ AMAZING!');
    else if (newCombo === 15) triggerFeedback('PERFECT!');
    else if (newCombo === 20) triggerFeedback('💀 UNSTOPPABLE!');
    else if (newCombo > 20 && newCombo % 5 === 0) triggerFeedback('LEGENDARY!');

    const curIdx   = roundIndexRef.current;
    const curRound = boss.rounds[curIdx];
    const newReps  = repCountRef.current + 1;
    repCountRef.current = newReps;
    setReps(newReps);

    if (!crit && newReps > 0 && newReps % 6 === 0) triggerFeedback('6x REPS!');

    if (newHp <= 0) {
      stopTimers(); stopCamera(); stopAnimation();
      phaseRef.current = 'victory';
      const current = loadProgress();
      if (current.bossesDefeated?.includes(boss.id)) {
        setAlreadyDefeated(true);
        setBossResult({ xp: 0, coins: 0, leveledUp: false });
      } else {
        const result = recordBossDefeat(current, boss.id, boss.rewards.xp, boss.rewards.coins, checkAchievements);
        setBossResult({ xp: result.xpGained, coins: result.coinsGained, leveledUp: result.leveledUp });
        if (result.newAchievements.length > 0) setAchievementToasts(result.newAchievements);
        setProgress(result.after);
      }
      setPhase('victory');
      return;
    }
    if (!curRound.isTimed && newReps >= curRound.reps) advanceRound(curIdx + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss, stopTimers, stopCamera, stopAnimation, triggerFeedback]);

  const renderLoop = useCallback(() => {
    const video = videoRef.current, canvas = canvasRef.current;
    const landmarker = landmarkerRef.current, detector = detectorRef.current;
    if (!video || !canvas || !landmarker || !detector || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(renderLoop); return;
    }
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) { animationRef.current = requestAnimationFrame(renderLoop); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        const result: PoseLandmarkerResult = landmarker.detectForVideo(video, performance.now());
        if (result.landmarks?.length > 0) {
          drawSkeleton(ctx, result.landmarks[0]);
          if (phaseRef.current === 'battle') {
            const out = detector.detect(result.landmarks[0]);
            if (out.rep) handleDetectedRep();
          }
        }
      } catch (e) { console.error('pose detection error', e); }
    }
    animationRef.current = requestAnimationFrame(renderLoop);
  }, [handleDetectedRep]);

  const triggerVictory = useCallback(() => {
    if (!boss) return;
    stopTimers(); stopCamera(); stopAnimation();
    phaseRef.current = 'victory';
    const current = loadProgress();
    if (current.bossesDefeated?.includes(boss.id)) {
      setAlreadyDefeated(true);
      setBossResult({ xp: 0, coins: 0, leveledUp: false });
    } else {
      const coinMult = selectedRelic?.effect === 'coins' ? 1.3 : 1;
      const xpMult   = selectedRelic?.id === 'star-shard' ? 1.5 : 1;
      const xpReward   = Math.round(boss.rewards.xp * xpMult);
      const coinReward = Math.round(boss.rewards.coins * coinMult);
      const result = recordBossDefeat(current, boss.id, xpReward, coinReward, checkAchievements);
      setBossResult({ xp: result.xpGained, coins: result.coinsGained, leveledUp: result.leveledUp });
      if (result.newAchievements.length > 0) setAchievementToasts(result.newAchievements);
      setProgress(result.after);
      const worldBossIds = BOSSES.filter(b => b.world === boss.world).map(b => b.id);
      if (worldBossIds.every(id => result.after.bossesDefeated?.includes(id))) {
        setWorldComplete(true);
      }
    }
    setPhase('victory');
  }, [boss, selectedRelic, stopTimers, stopCamera, stopAnimation]);

  const advanceRound = useCallback((nextIndex: number) => {
    if (!boss) return;
    if (nextIndex >= boss.rounds.length) { triggerVictory(); return; }
    roundIndexRef.current = nextIndex;
    repCountRef.current   = 0;
    setRoundIndex(nextIndex);
    setReps(0);
    detectorRef.current = getDetectorForSlug(boss.rounds[nextIndex].slug);
    const round = boss.rounds[nextIndex];
    if (round.isTimed) {
      setRoundSeconds(0);
      if (roundTimer.current) clearInterval(roundTimer.current);
      roundTimer.current = setInterval(() => {
        setRoundSeconds(s => {
          const next = s + 1;
          if (next >= round.reps) { if (roundTimer.current) clearInterval(roundTimer.current); advanceRound(nextIndex + 1); }
          return next;
        });
      }, 1000);
    }
  }, [boss, triggerVictory]);

  const handleDefeat = useCallback(() => {
    stopTimers(); stopCamera(); stopAnimation(); setPhaseSync('defeat');
  }, [stopTimers, stopCamera, stopAnimation, setPhaseSync]);

  const startBattle = useCallback(async () => {
    if (!boss) return;
    phaseRef.current = 'battle';
    roundIndexRef.current = 0; repCountRef.current = 0; comboRef.current = 0;
    bossHpRef.current = 100; lastVideoTimeRef.current = -1;
    lastRepTimeRef.current = 0; immuneUntilRef.current = 0;
    totalManualRef.current = boss.rounds.reduce((s, r) => s + (r.isTimed ? 0 : r.reps), 0) || 1;

    setPhase('battle'); setRoundIndex(0); setReps(0); setRoundSeconds(0);
    setTimeLeft(boss.timeLimitSeconds); setBossHp(100); setCombo(0);
    setDmgEvent(null); setBossIsHit(false); setAttackPhase(null);
    setPenaltyEvent(null); setBossXPos(65);
    shieldUsedRef.current = false;

    detectorRef.current = getDetectorForSlug(boss.rounds[0].slug);
    overallTimer.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleDefeat(); return 0; } return t - 1; });
    }, 1000);

    const first = boss.rounds[0];
    if (first.isTimed) {
      roundTimer.current = setInterval(() => {
        setRoundSeconds(s => {
          const next = s + 1;
          if (next >= first.reps) { if (roundTimer.current) clearInterval(roundTimer.current); advanceRound(1); }
          return next;
        });
      }, 1000);
    }

    scheduleAttack(); scheduleMove();

    try {
      await ensureLandmarker();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }, audio: false,
      });
      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach(t => t.stop()); return; }
      video.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        const onReady = () => { video.removeEventListener('loadedmetadata', onReady); video.play().then(resolve).catch(reject); };
        video.addEventListener('loadedmetadata', onReady);
      });
      setCameraReady(true);
      if (animationRef.current === null) animationRef.current = requestAnimationFrame(renderLoop);
    } catch (err) { console.error('Camera error:', err); }
  }, [boss, ensureLandmarker, handleDefeat, advanceRound, renderLoop, scheduleAttack, scheduleMove]);

  useEffect(() => () => {
    stopTimers(); stopCamera(); stopAnimation();
    landmarkerRef.current?.close(); landmarkerRef.current = null;
  }, [stopTimers, stopCamera, stopAnimation]);

  if (!boss || !progress) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-muted text-sm">{!boss ? 'Boss not found.' : 'Loading...'}</div>
      </div>
    );
  }

  const cfg         = BOSS_GAME_CONFIGS[boss.id];
  const tier        = TIER_CONFIG[boss.tier];
  const worldTheme  = getWorldTheme(boss.world);
  const bossPhase   = bossHp > 66 ? 'normal' : bossHp > 33 ? 'enraged' : 'desperate';
  const hpColor     = bossPhase === 'desperate' ? '#ef4444' : bossPhase === 'enraged' ? '#f59e0b' : tier.color;
  const round       = boss.rounds[roundIndex];
  const isTimed     = round?.isTimed;
  const target      = round?.reps ?? 0;
  const timeWarning = timeLeft <= 60 && phase === 'battle';
  const isUnlocked  = boss.isUnlocked(progress);
  const wasDefeated = progress.bossesDefeated?.includes(boss.id);
  const attackColor = cfg?.attackColor ?? tier.color;
  const bossImgClass = bossIsHit ? 'boss-hit' : 'boss-float';

  if (phase === 'battle' && round) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: worldTheme.introBg }}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full scale-x-[-1]" />
        {/* World-tinted gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: worldTheme.battleGradient }} />
        {/* World ambient corner glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 0% 0%, ${worldTheme.ambientColor} 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, ${worldTheme.ambientColor} 0%, transparent 55%)`
        }} />
        <WorldParticles theme={worldTheme} />

        <AnimatePresence>
          {attackPhase === 'warning' && (
            <motion.div key="warn" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.35, 0.15, 0.35] }}
              exit={{ opacity: 0 }} transition={{ duration: 0.4, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at ${bossXPos}% 40%, ${attackColor}55 0%, transparent 65%)` }} />
          )}
          {attackPhase === 'active' && (
            <motion.div key="active" initial={{ opacity: 0.6 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }} className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at ${bossXPos}% 40%, ${attackColor}88 0%, transparent 60%)` }} />
          )}
        </AnimatePresence>

        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-white/70">Loading camera & AI model…</p>
            </div>
          </div>
        )}

        {/* TOP bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href="/adventure" onClick={() => { stopTimers(); stopCamera(); stopAnimation(); }}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Exit
            </Link>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/60" />
              <span className={`font-display text-2xl font-bold tabular-nums ${timeWarning ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {cfg && (
            <BossHealthBar
              bossName={boss.name}
              world={boss.world}
              tierLabel={tier.label}
              tierColor={tier.color}
              bossHp={bossHp}
              bossPhase={bossPhase}
              bossIsHit={bossIsHit}
              combo={combo}
              imageSrc={cfg.image}
            />
          )}

          <div className="flex gap-2">
            {boss.rounds.map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full"
                style={{ background: i < roundIndex ? tier.color : i === roundIndex ? `${tier.color}99` : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>

        {/* Boss character */}
        <motion.div className="absolute pointer-events-none select-none"
          animate={{ left: `${bossXPos}%` }}
          transition={{ duration: cfg?.moveDurationS ?? 1, ease: 'easeInOut' }}
          style={{ top: '45%', x: '-50%', y: '-50%' }}>
          {attackPhase === 'warning' && (
            <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute rounded-full blur-xl"
              style={{ inset: '-20px', background: attackColor, zIndex: -1 }} />
          )}
          {cfg && (
            <img
              src={cfg.image}
              alt={boss.name}
              className={bossImgClass}
              style={{
                height: cfg.displayH,
                width: 'auto',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 24px ${attackPhase ? attackColor + 'cc' : hpColor + 'aa'}) drop-shadow(0 4px 12px rgba(0,0,0,0.7))`,
              }}
            />
          )}
        </motion.div>

        {/* Damage popup */}
        <AnimatePresence>
          {dmgEvent && (
            <motion.div key={dmgEvent.id} initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -80, scale: dmgEvent.crit ? 1.5 : 1.1 }} transition={{ duration: 0.9 }}
              className="absolute font-display text-5xl font-bold pointer-events-none z-10 whitespace-nowrap"
              style={{ left: `${bossXPos}%`, top: '36%', transform: 'translateX(-50%)',
                color: dmgEvent.crit ? '#fbbf24' : '#ffffff', textShadow: '0 0 16px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)' }}>
              {dmgEvent.crit ? '⚡ CRIT! ' : ''}-{dmgEvent.dmg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danger border overlay */}
        {bossHp < 50 && (
          <div className={`absolute inset-0 pointer-events-none z-20 ${bossHp < 15 ? 'danger-critical' : bossHp < 30 ? 'danger-low' : 'danger-warning'}`} />
        )}

        {/* Feedback message */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div key={feedbackMsg.id}
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -30 }}
              transition={{ duration: 0.22 }}
              className={`absolute left-1/2 pointer-events-none z-30 font-display font-bold whitespace-nowrap ${getFeedbackClass(feedbackMsg.text)}`}
              style={{ top: '28%', transform: 'translateX(-50%)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.01em' }}>
              {feedbackMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Penalty / dodge popup */}
        <AnimatePresence>
          {penaltyEvent && (
            <motion.div key={penaltyEvent.id} initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -60, scale: 1.1 }} transition={{ duration: 1.0 }}
              className="absolute left-1/2 font-display text-2xl font-bold pointer-events-none z-10 whitespace-nowrap"
              style={{ top: '55%', transform: 'translateX(-50%)',
                color: penaltyEvent.dodged ? '#4ade80' : '#ef4444', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              {penaltyEvent.dodged ? 'DODGED!' : `-${penaltyEvent.amount} rep${penaltyEvent.amount !== 1 ? 's' : ''}!`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-4 flex items-end justify-between gap-4"
            style={attackPhase === 'warning' ? { border: `1px solid ${attackColor}88` } : undefined}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: tier.color }}>
                Round {roundIndex + 1} / {boss.rounds.length} · {isTimed ? 'Hold' : 'Reps'}
              </div>
              <div className="font-display text-xl sm:text-2xl font-bold text-white mb-1">{round.label}</div>
              <div className="text-white/50 text-sm">
                {isTimed ? `${formatTime(roundSeconds)} elapsed · goal ${formatTime(target)}` : `${reps} / ${target} · AI counting via camera`}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={isTimed ? roundSeconds : reps} initial={{ scale: 1.2, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
                className="font-display text-8xl sm:text-9xl font-bold tabular-nums shrink-0" style={{ color: tier.color }}>
                {isTimed ? formatTime(roundSeconds) : reps}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: worldTheme.introBg }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Link href="/adventure" className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to adventure
        </Link>

        {phase === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

            {/* ── Boss artwork hero ── */}
            <div className="flex justify-center mb-6">
              {cfg ? (
                <motion.img
                  src={cfg.image}
                  alt={boss.name}
                  className="boss-float"
                  style={{
                    height: 200, width: 'auto', objectFit: 'contain',
                    filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.8))',
                  }}
                />
              ) : (
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-40 h-40 flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${tier.color} 15%, #0a0a0e)`, border: `4px solid ${tier.color}`, boxShadow: `4px 4px 0 ${tier.color}` }}
                >
                  <Shield style={{ width: 64, height: 64, color: tier.color }} />
                </motion.div>
              )}
            </div>

            {/* ── Info card ── */}
            <div style={{
              background: `color-mix(in srgb, ${tier.color} 8%, #0a0a0e)`,
              border: `4px solid ${tier.color}`,
              boxShadow: `6px 6px 0 ${tier.color}`,
            }}>
              {/* World-color top strip */}
              <div style={{ height: 6, background: tier.color }} />

              <div className="p-6 sm:p-8">
                {/* World + tier badges */}
                <div className="flex items-center gap-2 flex-wrap mb-5">
                  <div
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 text-white"
                    style={{ background: tier.color, border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}
                  >
                    {worldTheme.name}
                  </div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5"
                    style={{ color: tier.color, border: `2px solid ${tier.color}`, background: `color-mix(in srgb, ${tier.color} 12%, transparent)` }}
                  >
                    {tier.label} Boss
                  </div>
                  {wasDefeated && (
                    <div className="ml-auto text-[10px] font-black uppercase tracking-wider px-3 py-1.5 text-white"
                      style={{ background: '#22c55e', border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}>
                      ✓ Defeated
                    </div>
                  )}
                </div>

                {/* Boss name + description */}
                <h1 className="font-display font-bold text-white uppercase leading-tight mb-3"
                  style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.01em' }}>
                  {boss.name}
                </h1>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.88)' }}>
                  {boss.flavour}
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Rounds', value: String(boss.rounds.length) },
                    { label: 'Time Limit', value: formatTime(boss.timeLimitSeconds) },
                    { label: 'Rewards', value: `+${boss.rewards.xp} XP · +${boss.rewards.coins} coins`, span: true },
                  ].map(s => (
                    <div
                      key={s.label}
                      className={s.span ? 'sm:col-span-1 col-span-2' : ''}
                      style={{
                        background: `color-mix(in srgb, ${tier.color} 10%, #0a0a0e)`,
                        border: `2px solid ${tier.color}`,
                        boxShadow: `3px 3px 0 ${tier.color}`,
                        padding: '12px 14px',
                      }}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</div>
                      <div className="font-display text-xl font-bold text-white">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Round list */}
                <div className="space-y-2 mb-6">
                  <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: tier.color }}>
                    Battle Rounds
                  </div>
                  {boss.rounds.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4"
                      style={{
                        background: `color-mix(in srgb, ${tier.color} 6%, #0a0a0e)`,
                        border: `2px solid ${tier.color}`,
                        borderLeft: `5px solid ${tier.color}`,
                      }}
                    >
                      <div
                        className="w-7 h-7 flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ background: tier.color, border: '2px solid #000', boxShadow: '2px 2px 0 #000' }}
                      >{i + 1}</div>
                      <span className="text-sm font-bold text-white flex-1">{r.label}</span>
                      <span className="text-sm font-black tabular-nums" style={{ color: tier.color }}>
                        {r.isTimed ? `${r.reps}s` : `${r.reps} reps`}
                      </span>
                    </div>
                  ))}
                </div>

                {wasDefeated && (
                  <div
                    className="text-xs font-bold mb-5 px-4 py-3"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', color: '#4ade80' }}
                  >
                    ✓ Already defeated — rewards won&apos;t stack, but you can still practice.
                  </div>
                )}

                {/* Relic picker */}
                {isUnlocked && !wasDefeated && (
                  <div className="mb-6">
                    <div className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: tier.color }}>
                      Choose your Relic
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {pickRelics(boss.id).map(relic => (
                        <motion.button
                          key={relic.id}
                          onClick={() => setSelectedRelic(r => r?.id === relic.id ? null : relic)}
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 1, scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="p-3 text-left cursor-pointer"
                          style={{
                            background: selectedRelic?.id === relic.id
                              ? `color-mix(in srgb, ${tier.color} 18%, #0a0a0e)`
                              : `color-mix(in srgb, ${tier.color} 5%, #0a0a0e)`,
                            border: `2px solid ${selectedRelic?.id === relic.id ? tier.color : 'rgba(255,255,255,0.15)'}`,
                            boxShadow: selectedRelic?.id === relic.id ? `3px 3px 0 ${tier.color}` : 'none',
                          }}
                        >
                          <div className="mb-2" style={{ color: selectedRelic?.id === relic.id ? tier.color : 'rgba(255,255,255,0.55)' }}>
                            {relic.icon}
                          </div>
                          <div className="text-xs font-bold text-white leading-tight">{relic.name}</div>
                          <div className="text-xs mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.72)' }}>{relic.desc}</div>
                        </motion.button>
                      ))}
                    </div>
                    {!selectedRelic && (
                      <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Select a relic to get a pre-battle bonus.
                      </p>
                    )}
                  </div>
                )}

                {/* CTA */}
                {isUnlocked ? (
                  <motion.button
                    onClick={startBattle}
                    whileHover={{ y: -3 }}
                    whileTap={{ y: 2, scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-full py-4 font-display text-xl font-black text-white uppercase tracking-widest cursor-pointer flex items-center justify-center gap-3"
                    style={{
                      background: tier.color,
                      border: '4px solid #000',
                      boxShadow: '5px 5px 0 #000',
                      letterSpacing: '0.1em',
                    }}
                  >
                    <Shield className="w-5 h-5" />
                    {selectedRelic ? `Start Battle · ${selectedRelic.name}` : 'Start Boss Battle'}
                  </motion.button>
                ) : (
                  <div
                    className="w-full py-4 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '3px solid rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <Lock className="w-4 h-4" /> {boss.unlockLabel}
                  </div>
                )}
              </div>{/* /p-6 sm:p-8 */}
            </div>{/* /info card */}
          </motion.div>
        )}

        {phase === 'victory' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="text-center py-8 relative">
            {!alreadyDefeated && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="confetti-particle" style={{
                    left: `${(i * 4.2) % 100}%`, animationDelay: `${(i * 0.12) % 2}s`,
                    background: ['#f59e0b','#22c55e','#3b82f6','#ec4899','#8b5cf6','#ef4444'][i % 6],
                  }} />
                ))}
              </div>
            )}
            <div className="flex items-center justify-center mb-4">
              {alreadyDefeated
                ? <Dumbbell className="w-20 h-20" style={{ color: tier.color }} />
                : <Trophy className="w-20 h-20 text-yellow-400" />}
            </div>
            <h2 className="font-display text-5xl font-bold text-app mb-4">
              {alreadyDefeated ? 'Still a champ.' : worldComplete ? `${worldTheme.name} Cleared!` : 'Boss defeated!'}
            </h2>
            <p className="text-muted mb-6">{alreadyDefeated ? 'Great practice run.' : boss.flavour}</p>

            {worldComplete && !alreadyDefeated && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl mb-6 font-bold text-sm"
                style={{ background: `${worldTheme.primary}25`, border: `1px solid ${worldTheme.primary}55`, color: worldTheme.primary }}>
                <Star className="w-4 h-4" /> {worldTheme.name} Badge Earned · +500 XP Bonus
              </motion.div>
            )}

            {selectedRelic && !alreadyDefeated && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 text-sm"
                style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', color: tier.color }}>
                {selectedRelic.icon} Relic used: <strong>{selectedRelic.name}</strong>
              </div>
            )}
            {bossResult && !alreadyDefeated && (
              <div className="flex items-center justify-center gap-6 mb-10">
                <div className="p-6 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-subtle mb-2">XP Earned</div>
                  <div className="font-display text-3xl font-bold" style={{ color: tier.color }}>+{bossResult.xp}</div>
                </div>
                <div className="p-6 rounded-2xl" style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-subtle mb-2">FitCoins</div>
                  <div className="font-display text-3xl font-bold" style={{ color: tier.color }}>+{bossResult.coins}</div>
                </div>
                {bossResult.leveledUp && (
                  <div className="p-6 rounded-2xl" style={{ background: tier.bg, border: `1px solid ${tier.color}44` }}>
                    <div className="text-xs font-bold mb-2" style={{ color: tier.color }}>LEVEL UP!</div>
                    <div className="font-display text-3xl font-bold flex items-center justify-center" style={{ color: tier.color }}><ArrowUp className="w-8 h-8" /></div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setPhase('intro'); setRoundIndex(0); setReps(0); setRoundSeconds(0); setBossResult(null); setBossHp(100); }}
                className="px-6 py-3 rounded-2xl font-semibold text-white cursor-pointer" style={{ background: tier.color }}>
                Play again
              </button>
              <Link href="/adventure" className="px-6 py-3 rounded-2xl font-semibold text-app"
                style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                Back to adventure
              </Link>
            </div>
          </motion.div>
        )}

        {phase === 'defeat' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-20 h-20 text-red-400" />
            </div>
            <h2 className="font-display text-5xl font-bold text-app mb-2">Time&apos;s up.</h2>
            <p className="text-muted mb-10">You completed {roundIndex}/{boss.rounds.length} rounds. Train more and try again.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { stopTimers(); setPhase('intro'); setRoundIndex(0); setReps(0); setRoundSeconds(0); setTimeLeft(0); }}
                className="px-6 py-3 rounded-2xl font-semibold text-white cursor-pointer" style={{ background: tier.color }}>
                Try again
              </button>
              <Link href="/adventure" className="px-6 py-3 rounded-2xl font-semibold text-app"
                style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)' }}>
                Back
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <AchievementToastLayer achievementIds={achievementToasts}
        onDismiss={(id) => setAchievementToasts(p => p.filter(a => a !== id))} />
    </div>
  );
}
