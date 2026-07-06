'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Check, Lock } from 'lucide-react';
import {
  loadProgress,
  purchaseItem,
  equipItem,
  saveProgress,
  subscribeToProgress,
  type Progress,
} from '@/lib/progress';
import { SHOP_ITEMS, FREE_DEFAULTS, DEFAULT_EQUIPPED, RARITY_CONFIG } from '@/lib/shop';
import type { ShopItem } from '@/lib/progress';
import Navbar from '@/components/Navbar';
import { ShopSkeleton } from '@/components/Skeleton';
import { useAuth } from '@/components/AuthProvider';
import { applyNewAchievements } from '@/lib/achievements';

const DEV_EMAIL = 'indyy8262@gmail.com';

type TabType = 'border' | 'aura';

const TABS: { id: TabType; label: string }[] = [
  { id: 'border', label: 'Borders' },
  { id: 'aura',   label: 'Auras' },
];

const CARD_COLORS: Record<TabType, string> = {
  border: 'var(--card-bg-blue)',
  aura:   'var(--card-bg-purple)',
};

export default function ShopPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [tab, setTab] = useState<TabType>('border');
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const { user } = useAuth();
  const isDev = user?.email === DEV_EMAIL;

  useEffect(() => {
    setProgress(loadProgress());
    const unsub = subscribeToProgress(() => setProgress(loadProgress()));
    return unsub;
  }, []);

  const showFeedback = (kind: 'ok' | 'err', msg: string) => {
    setFeedback({ kind, msg });
    setTimeout(() => setFeedback(null), 2200);
  };

  if (!progress) return <ShopSkeleton />;

  const allUnlocked = new Set([
    ...FREE_DEFAULTS,
    ...progress.unlockedItems,
    ...SHOP_ITEMS
      .filter(i => i.rarity === 'world' && i.requirement && (isDev || progress.bossesDefeated.includes(i.requirement)))
      .map(i => i.id),
  ]);
  const equipped = { ...DEFAULT_EQUIPPED, ...progress.equippedItems };

  const handlePurchase = (id: string, cost: number) => {
    const result = purchaseItem(progress, id, cost);
    if (result.reason === 'insufficient') { showFeedback('err', 'Not enough FitCoins.'); return; }
    if (result.reason === 'owned') { showFeedback('err', 'You already own this item.'); return; }
    const final = applyNewAchievements(result.progress);
    if (final !== result.progress) saveProgress(final);
    setProgress(final);
    showFeedback('ok', 'Item unlocked!');
  };

  const handleEquip = (slot: string, id: string) => {
    const updated = equipItem(progress, slot, id);
    setProgress(updated);
    showFeedback('ok', 'Equipped.');
  };

  const items = SHOP_ITEMS.filter((i) => i.type === tab);
  const cardBg = CARD_COLORS[tab];

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        <Link href="/dashboard" className="link-back mb-10 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
          <div>
            <div className="neo-badge mb-5">Shop</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-app leading-tight">
              Customize your profile.
            </h1>
            <p className="text-sm text-muted mt-2 max-w-lg">
              Spend FitCoins on cosmetic upgrades. Earned items stay unlocked permanently.
            </p>
          </div>
          {/* FitCoins balance */}
          <div className="neo-card px-5 py-3.5 flex items-center gap-3" style={{ background: 'var(--card-bg-amber)', borderRadius: 0 }}>
            <div className="w-9 h-9 flex items-center justify-center neo-card-accent" style={{ borderRadius: 0 }}>
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-app tabular-nums leading-none">
                {progress.fitCoins.toLocaleString()}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-subtle">FitCoins</div>
            </div>
          </div>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 text-sm font-bold neo-card"
            style={{
              borderRadius: 0,
              background: feedback.kind === 'ok' ? 'var(--card-bg-green)' : 'color-mix(in srgb, #ef4444 15%, var(--neo-white))',
              borderColor: feedback.kind === 'ok' ? 'var(--neo-accent)' : '#ef4444',
              color: feedback.kind === 'ok' ? 'var(--neo-accent)' : '#ef4444',
            }}
          >
            {feedback.msg}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2 text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-100"
              style={tab === t.id
                ? { background: 'var(--neo-accent)', color: '#fff', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)' }
                : { background: 'var(--neo-white)', color: 'var(--neo-black)', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow-sm)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const isUnlocked = allUnlocked.has(item.id);
            const isEquipped = equipped[item.type] === item.id;
            const canAfford  = progress.fitCoins >= item.cost;
            const rarity     = RARITY_CONFIG[item.rarity];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
                style={{
                  borderRadius: 0,
                  background: isEquipped ? 'var(--card-bg-green)' : cardBg,
                  borderColor: isEquipped ? 'var(--neo-accent)' : undefined,
                  boxShadow: isEquipped ? 'var(--neo-shadow-lg)' : 'var(--neo-shadow)',
                }}
              >
                {/* Preview */}
                <div style={{ borderBottom: 'var(--neo-border-2)' }}>
                  <ItemPreview item={item} />
                </div>

                {/* Info + actions */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <div className="font-display text-lg font-bold text-app truncate">{item.name}</div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 shrink-0"
                          style={{
                            color: rarity.color,
                            background: `${rarity.color}22`,
                            border: `2px solid ${rarity.color}`,
                          }}
                        >
                          {rarity.label}
                        </span>
                      </div>
                      <div className="text-xs text-subtle">{item.description}</div>
                    </div>
                    {isEquipped && (
                      <span
                        className="text-xs font-bold shrink-0 px-2 py-1 neo-card-accent"
                        style={{ borderRadius: 0 }}
                      >
                        Active
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    {isUnlocked ? (
                      isEquipped ? (
                        <button
                          disabled
                          className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                          style={{
                            background: 'var(--neo-white)',
                            border: 'var(--neo-border)',
                            color: 'var(--text-subtle)',
                            opacity: 0.7,
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Equipped
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquip(item.type, item.id)}
                          className="w-full py-2.5 neo-btn neo-btn-primary text-xs font-bold uppercase tracking-wider justify-center cursor-pointer"
                          style={{ padding: '0.625rem 1rem' }}
                        >
                          Equip
                        </button>
                      )
                    ) : item.rarity === 'world' ? (
                      <button
                        disabled
                        className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                        style={{
                          background: 'var(--neo-white)',
                          border: 'var(--neo-border)',
                          color: 'var(--text-subtle)',
                          opacity: 0.6,
                        }}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Clear a world to unlock
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item.id, item.cost)}
                        disabled={!canAfford}
                        className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: canAfford ? 'var(--neo-white)' : 'var(--neo-white)',
                          border: 'var(--neo-border)',
                          color: canAfford ? 'var(--neo-black)' : 'var(--text-subtle)',
                          boxShadow: canAfford ? 'var(--neo-shadow-sm)' : 'none',
                          transition: 'box-shadow 0.1s, transform 0.1s',
                        }}
                      >
                        {canAfford ? (
                          <>
                            <Coins className="w-3.5 h-3.5" style={{ color: 'var(--neo-accent)' }} />
                            <span>{item.cost.toLocaleString()}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Need {item.cost.toLocaleString()}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function borderPreviewWrap(value: string): string {
  const map: Record<string, string> = {
    neon: 'ba-neon', crystal: 'ba-crystal', royal: 'ba-royal',
    flame: 'ba-flame', galaxy: 'ba-galaxy', electric: 'ba-electric', floral: 'ba-floral',
  };
  return map[value] ? `p-[3px] rounded-full ${map[value]}` : '';
}

function ItemPreview({ item }: { item: ShopItem }) {
  if (item.type === 'avatar') {
    return (
      <div className="aspect-[4/3] flex items-center justify-center" style={{ background: 'var(--neo-white)' }}>
        <div className="text-6xl">{item.value || '🙂'}</div>
      </div>
    );
  }

  if (item.type === 'border') {
    const wrap = borderPreviewWrap(item.value);
    return (
      <div className="aspect-[4/3] flex items-center justify-center" style={{ background: 'var(--neo-white)' }}>
        {wrap ? (
          <div className={wrap}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl" style={{ background: 'var(--neo-surface)' }}>🙂</div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl" style={{ background: 'var(--neo-surface)' }}>🙂</div>
        )}
      </div>
    );
  }

  if (item.type === 'aura') {
    return (
      <div className="aspect-[4/3] flex items-center justify-center overflow-hidden" style={{ background: 'var(--neo-white)' }}>
        {item.value ? (
          <div className="relative flex items-center justify-center">
            <div className={`absolute w-28 h-28 rounded-full aura-${item.value}`} />
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl relative z-10" style={{ background: 'var(--neo-surface)' }}>🙂</div>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: 'var(--neo-surface)' }}>🙂</div>
        )}
      </div>
    );
  }

  return null;
}
