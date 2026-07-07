'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap, Skull, Heart } from 'lucide-react';
import { getWorldTheme } from '@/lib/worlds';

type Props = {
  bossName: string;
  world: number;
  tierLabel: string;
  tierColor: string;
  bossHp: number;
  bossPhase: 'normal' | 'enraged' | 'desperate';
  bossIsHit: boolean;
  combo: number;
  imageSrc: string;
};

export function BossHealthBar({ bossName, world, tierLabel, tierColor, bossHp, bossPhase, bossIsHit, combo }: Props) {
  const [ghostHp, setGhostHp] = useState(bossHp);

  useEffect(() => {
    const t = setTimeout(() => setGhostHp(bossHp), 500);
    return () => clearTimeout(t);
  }, [bossHp]);

  const hpColor = bossPhase === 'desperate' ? '#ef4444' : bossPhase === 'enraged' ? '#f59e0b' : tierColor;
  const phaseLabel = bossPhase === 'enraged' ? 'ENRAGED' : bossPhase === 'desperate' ? 'DESPERATE' : null;
  const PhaseIcon = bossPhase === 'enraged' ? Zap : Skull;

  return (
    <div
      className={`boss-hpbar${bossIsHit ? ' boss-hpbar-hit' : ''}`}
      style={{ '--tc': tierColor, '--hc': hpColor } as React.CSSProperties}
    >
      {/* Header row */}
      <div className="boss-hpbar-header">
        <div className="boss-hpbar-badge" style={{ background: hpColor }}>
          <Heart size={10} className="fill-black stroke-none" />
        </div>
        <span className="boss-hpbar-name">{bossName}</span>
        <div className="boss-hpbar-tags">
          <span className="boss-hpbar-world">{getWorldTheme(world).name}</span>
          <span className="boss-hpbar-tier">{tierLabel}</span>
          {phaseLabel && (
            <motion.span
              key={phaseLabel}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              style={{ transformOrigin: 'left', background: hpColor }}
              className="boss-hpbar-phase"
            >
              <PhaseIcon size={9} />{phaseLabel}
            </motion.span>
          )}
        </div>
        <span className="boss-hpbar-pct">{Math.round(bossHp)}%</span>
      </div>

      {/* HP track */}
      <div className="boss-hpbar-track">
        <div className="boss-hpbar-ghost" style={{ width: `${ghostHp}%` }} />
        <motion.div
          className="boss-hpbar-fill"
          animate={{ width: `${bossHp}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ background: hpColor }}
        />
        {[25, 50, 75].map(p => (
          <div key={p} className="boss-hpbar-seg" style={{ left: `${p}%` }} />
        ))}
        <div className="boss-hpbar-shine" />
      </div>

      {/* Combo badge */}
      {combo >= 3 && (
        <motion.span
          key={combo}
          initial={{ scale: 1.5, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="boss-hpbar-combo"
          style={{ background: combo >= 10 ? '#f59e0b' : combo >= 5 ? '#8b5cf6' : tierColor }}
        >
          ×{combo} COMBO
        </motion.span>
      )}
    </div>
  );
}
