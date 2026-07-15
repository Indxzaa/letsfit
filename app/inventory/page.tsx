'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Check } from 'lucide-react';
import {
  loadProgress,
  activateBooster,
  subscribeToProgress,
  type Progress,
  type ActiveBoost,
} from '@/lib/progress';
import { BOOSTER_DEFS, KEY_DEFS } from '@/lib/shop';
import Navbar from '@/components/Navbar';
import { playSound } from '@/lib/audio';

// Rarity-specific panel colors behind each key image.
const KEY_COLORS: Record<string, { bg: string; border: string; shadow: string; label: string }> = {
  common:  { bg: '#E5E7EB', border: '#6B7280',          shadow: '4px 4px 0 #6B7280',          label: '#6B7280'          }, // neutral gray
  rare:    { bg: '#DBEAFE', border: 'var(--neo-blue)',   shadow: '4px 4px 0 var(--neo-blue)',   label: 'var(--neo-blue)'   }, // blue
  epic:    { bg: '#EDE9FE', border: 'var(--neo-purple)', shadow: '4px 4px 0 var(--neo-purple)', label: 'var(--neo-purple)' }, // purple
  premium: { bg: '#FDE9C8', border: 'var(--neo-amber)',  shadow: '4px 4px 0 var(--neo-amber)',  label: 'var(--neo-amber)'  }, // gold/orange
  supreme: { bg: '#FEE2E2', border: 'var(--neo-red)',    shadow: '4px 4px 0 var(--neo-red)',    label: 'var(--neo-red)'    }, // red
};

export default function InventoryPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  const showFeedback = (kind: 'ok' | 'err', msg: string) => {
    setFeedback({ kind, msg });
    setTimeout(() => setFeedback(null), 2200);
  };

  const handleActivate = (id: string) => {
    if (!progress) return;
    const updated = activateBooster(progress, id);
    if (!updated) { showFeedback('err', 'None in inventory.'); return; }
    setProgress(updated);
    showFeedback('ok', 'Booster activated!');
    playSound('purchase');
  };

  if (!progress) {
    return (
      <div className="min-h-screen page-bg">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 pt-28">
          <div className="h-48 flex items-center justify-center text-subtle text-sm">Loading inventory…</div>
        </div>
      </div>
    );
  }

  const inv = progress.inventory ?? {};
  const boosts = progress.activeBoosts ?? [];
  const shieldQty = inv['streak_shield'] ?? 0;

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        <Link href="/dashboard" className="link-back mb-10 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="neo-badge mb-5">Inventory</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-app leading-tight">
            Your items.
          </h1>
          <p className="text-sm text-muted mt-2 max-w-lg">
            Boosters, shields, and keys collected from challenges, rewards, and chests.
          </p>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 text-sm font-bold neo-card"
            style={{
              borderRadius: 0,
              background: feedback.kind === 'ok' ? 'var(--card-bg-green)' : '#FEE2E2',
              borderColor: feedback.kind === 'ok' ? 'var(--neo-accent)' : 'var(--neo-red)',
              color: feedback.kind === 'ok' ? 'var(--neo-accent)' : 'var(--neo-red)',
            }}
          >
            {feedback.msg}
          </motion.div>
        )}

        {/* Active Effects */}
        {boosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-card p-6 mb-10"
            style={{ borderRadius: 0, background: 'var(--card-bg-green)', border: '3px solid var(--neo-accent)', boxShadow: '4px 4px 0 var(--neo-accent)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" style={{ color: 'var(--neo-accent)' }} />
              <h2 className="font-display text-lg font-bold text-app uppercase tracking-wider">Active Effects</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {boosts.map((b) => {
                const def = BOOSTER_DEFS.find(d => d.id === b.id);
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 px-3 py-2"
                    style={{ background: 'var(--neo-white)', border: '3px solid var(--neo-accent)', boxShadow: '2px 2px 0 var(--neo-accent)' }}
                  >
                    {def?.img && (
                      <div className="relative w-5 h-5 shrink-0">
                        <Image src={def.img} alt={def.name} fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <span className="text-xs font-bold text-app">{def?.name ?? b.id}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--neo-accent)' }}>
                      {b.usesLeft} left
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── BOOSTERS ── */}
        <Section title="Boosters" subtitle="Activate to gain temporary rewards bonuses." index={0}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BOOSTER_DEFS.map((def, i) => {
              const qty = inv[def.id] ?? 0;
              const active = boosts.find(b => b.id === def.id);
              return (
                <BoosterCard
                  key={def.id}
                  id={def.id}
                  name={def.name}
                  description={def.description}
                  effect={def.effect}
                  img={def.img}
                  qty={qty}
                  usesLeft={active?.usesLeft ?? 0}
                  index={i}
                  onActivate={() => handleActivate(def.id)}
                />
              );
            })}
          </div>
        </Section>

        {/* ── SHIELDS ── */}
        <Section title="Shields" subtitle="Automatically consumed when you need them." index={1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ShieldCard qty={shieldQty} index={0} />
          </div>
        </Section>

        {/* ── KEYS ── */}
        <Section title="Keys" subtitle="Used to open chests. Chest system coming soon." index={2}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {KEY_DEFS.map((def, i) => {
              const qty = inv[def.id] ?? 0;
              const colors = KEY_COLORS[def.rarity];
              return (
                <KeyCard
                  key={def.id}
                  name={def.name}
                  description={def.description}
                  qty={qty}
                  colors={colors}
                  img={def.img}
                  index={i}
                />
              );
            })}
          </div>
        </Section>

      </div>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, subtitle, index, children }: {
  title: string;
  subtitle: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="mb-12"
    >
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-app uppercase tracking-wide">{title}</h2>
        <p className="text-xs text-muted mt-1">{subtitle}</p>
        <div className="mt-3" style={{ height: 3, background: 'var(--neo-black)', width: 40 }} />
      </div>
      {children}
    </motion.div>
  );
}

// ── Booster card ────────────────────────────────────────────────────────────────
function BoosterCard({
  id, name, description, effect, img, qty, usesLeft, index, onActivate,
}: {
  id: string;
  name: string;
  description: string;
  effect: string;
  img: string | null;
  qty: number;
  usesLeft: number;
  index: number;
  onActivate: () => void;
}) {
  const isActive = usesLeft > 0;
  const hasStock = qty > 0;

  const cardBg     = isActive ? 'var(--card-bg-green)' : hasStock ? 'var(--card-bg-amber)' : 'var(--neo-white)';
  const cardBorder = isActive ? 'var(--neo-accent)' : hasStock ? '#111111' : '#cccccc';
  const cardShadow = isActive ? 'var(--neo-shadow-lg)' : hasStock ? 'var(--neo-shadow)' : '2px 2px 0 #ccc';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="neo-card flex flex-col"
      style={{ borderRadius: 0, background: cardBg, border: `3px solid ${cardBorder}`, boxShadow: cardShadow }}
    >
      {/* Image area */}
      <div style={{ borderBottom: `2px solid ${cardBorder}`, background: isActive ? 'var(--card-bg-green)' : hasStock ? '#FEF3C7' : '#f5f5f5' }}>
        <div className="aspect-[4/3] flex items-center justify-center relative p-4">
          <div className="relative w-20 h-20">
            {img
              ? <Image src={img} alt={name} fill className="object-contain" unoptimized />
              : <div className="w-full h-full flex items-center justify-center text-4xl">✨</div>
            }
          </div>
          {isActive && (
            <div className="absolute top-2 right-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: 'var(--neo-accent)', border: '2px solid #000', color: '#fff' }}>
              Active · {usesLeft} left
            </div>
          )}
          <div className="absolute top-2 left-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
            style={{ background: hasStock ? '#111' : '#ddd', border: '2px solid #000', color: hasStock ? '#fff' : '#999' }}>
            Owned: {qty}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="font-display text-lg font-bold text-app mb-1">{name}</div>
        <div className="text-xs text-muted mb-1 leading-relaxed">{description}</div>
        {isActive && (
          <div className="text-xs font-bold mb-3" style={{ color: 'var(--neo-accent)' }}>
            {effect}
          </div>
        )}

        <div className="mt-auto pt-3">
          {isActive ? (
            <div className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              style={{ background: 'var(--card-bg-green)', border: '3px solid var(--neo-accent)', color: 'var(--neo-accent)' }}>
              <Check className="w-3.5 h-3.5" /> {effect}
            </div>
          ) : hasStock ? (
            <motion.button
              onClick={onActivate}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer"
              style={{ background: 'var(--neo-black)', border: '3px solid #000', boxShadow: '3px 3px 0 #555', color: '#fff' }}
            >
              Use
            </motion.button>
          ) : (
            <div className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center"
              style={{ background: '#f5f5f5', border: '3px solid #ccc', color: '#aaa' }}>
              Not in inventory
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Shield card ────────────────────────────────────────────────────────────────
function ShieldCard({ qty, index }: { qty: number; index: number }) {
  const hasStock = qty > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="neo-card flex flex-col"
      style={{
        borderRadius: 0,
        background: hasStock ? 'var(--card-bg-blue)' : 'var(--neo-white)',
        border: `3px solid ${hasStock ? '#3b82f6' : '#cccccc'}`,
        boxShadow: hasStock ? '4px 4px 0 #3b82f6' : '2px 2px 0 #ccc',
      }}
    >
      <div style={{ borderBottom: `2px solid ${hasStock ? '#3b82f6' : '#ccc'}`, background: hasStock ? '#EFF6FF' : '#f5f5f5' }}>
        <div className="aspect-[4/3] flex items-center justify-center relative p-4">
          <div className="w-20 h-20 flex items-center justify-center text-5xl">🛡️</div>
          <div className="absolute top-2 left-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
            style={{ background: hasStock ? '#3b82f6' : '#ddd', border: '2px solid #000', color: hasStock ? '#fff' : '#999' }}>
            Owned: {qty}
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="font-display text-lg font-bold text-app mb-1">Streak Shield</div>
        <div className="text-xs text-muted mb-3 leading-relaxed">
          Auto-protects your login streak.
        </div>
        <div className="mt-auto">
          <div className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
            style={{
              background: hasStock ? '#EFF6FF' : '#f5f5f5',
              border: `3px solid ${hasStock ? '#3b82f6' : '#ccc'}`,
              color: hasStock ? '#3b82f6' : '#aaa',
            }}>
            <Shield className="w-3.5 h-3.5" />
            {hasStock ? 'Auto-active' : 'Not in inventory'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Key card ────────────────────────────────────────────────────────────────────
function KeyCard({ name, description, qty, colors, img, index }: {
  name: string;
  description: string;
  qty: number;
  colors: { bg: string; border: string; shadow: string; label: string };
  img: string;
  index: number;
}) {
  const hasStock = qty > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="neo-card flex flex-col"
      style={{
        borderRadius: 0,
        background: hasStock ? colors.bg : 'var(--neo-white)',
        border: `3px solid ${hasStock ? colors.border : '#cccccc'}`,
        boxShadow: hasStock ? colors.shadow : '2px 2px 0 #ccc',
      }}
    >
      <div style={{ borderBottom: `2px solid ${hasStock ? colors.border : '#ccc'}`, background: hasStock ? 'rgba(255,255,255,0.5)' : '#f5f5f5' }}>
        <div className="aspect-[4/3] flex items-center justify-center relative p-4">
          <div className="relative w-20 h-20">
            <Image src={img} alt={name} fill className="object-contain" unoptimized />
          </div>
          <div className="absolute top-2 left-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
            style={{ background: hasStock ? colors.border : '#ddd', border: '2px solid #000', color: hasStock ? '#fff' : '#999' }}>
            Owned: {qty}
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="font-display text-lg font-bold text-app uppercase mb-1">{name}</div>
        <div className="text-xs text-muted mb-3 leading-relaxed">{description}</div>
        <div className="mt-auto">
          <div className="w-full py-2.5 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
            style={{
              background: hasStock ? colors.bg : '#f5f5f5',
              border: `3px solid ${hasStock ? colors.border : '#ccc'}`,
              color: hasStock ? colors.label : '#aaa',
            }}>
            x{qty}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
