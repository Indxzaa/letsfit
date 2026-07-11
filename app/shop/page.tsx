'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Check, Lock, Gem } from 'lucide-react';
import { playSound } from '@/lib/audio';
import {
  loadProgress,
  purchaseItem,
  purchaseWithFragments,
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

type TabType = 'emoji';

const TABS: { id: TabType; label: string }[] = [
  { id: 'emoji', label: 'Emojis' },
];

const CARD_COLORS: Record<TabType, string> = {
  emoji: 'var(--card-bg-amber)',
};

export default function ShopPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [tab, setTab] = useState<TabType>('emoji');
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
    if (result.reason === 'insufficient') { showFeedback('err', 'Not enough FitCoins.'); playSound('insufficient'); return; }
    if (result.reason === 'owned') { showFeedback('err', 'You already own this item.'); return; }
    const final = applyNewAchievements(result.progress);
    if (final !== result.progress) saveProgress(final);
    setProgress(final);
    showFeedback('ok', 'Item unlocked!');
    playSound('purchase');
  };

  const handleFragmentPurchase = (id: string, cost: number) => {
    const result = purchaseWithFragments(progress, id, cost);
    if (result.reason === 'insufficient') { showFeedback('err', 'Not enough Emoji Fragments.'); playSound('insufficient'); return; }
    if (result.reason === 'owned') { showFeedback('err', 'You already own this item.'); return; }
    const final = applyNewAchievements(result.progress);
    if (final !== result.progress) saveProgress(final);
    setProgress(final);
    showFeedback('ok', 'Premium emoji unlocked!');
    playSound('purchase');
  };

  const handleEquip = (slot: string, id: string) => {
    const updated = equipItem(progress, slot, id);
    setProgress(updated);
    showFeedback('ok', 'Equipped.');
  };

  const items = SHOP_ITEMS.filter((i) => i.type === tab);
  const cardBg = CARD_COLORS[tab];
  const fragments = progress.emojiFragments ?? 0;

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

          {/* Currency balances */}
          <div className="flex flex-col gap-2">
            {/* FitCoins */}
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
            {/* Emoji Fragments */}
            <div
              className="neo-card px-5 py-3.5 flex items-center gap-3"
              style={{
                background: '#f5f0ff',
                borderRadius: 0,
                border: '3px solid #000',
                boxShadow: '3px 3px 0 #000',
              }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: '#a855f7', borderRadius: 0, border: '2px solid #000' }}
              >
                <Gem className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold tabular-nums leading-none" style={{ color: '#a855f7' }}>
                  {fragments.toLocaleString()}
                </div>
                <div className="text-xs font-black uppercase tracking-wider" style={{ color: '#7c3aed' }}>Emoji Fragments</div>
              </div>
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
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="px-5 py-2 text-sm font-bold uppercase tracking-wider cursor-pointer"
              style={tab === t.id
                ? { background: 'var(--neo-accent)', color: '#fff', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow)' }
                : { background: 'var(--neo-white)', color: 'var(--neo-black)', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow-sm)' }
              }
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* Item grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => {
            const isUnlocked    = allUnlocked.has(item.id);
            const isEquipped    = equipped[item.type] === item.id;
            const isFragment    = item.currency === 'fragments';
            const canAfford     = isFragment
              ? fragments >= item.cost
              : progress.fitCoins >= item.cost;
            const rarity        = RARITY_CONFIG[item.rarity];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
                style={{
                  borderRadius: 0,
                  background: isEquipped ? 'var(--card-bg-green)' : isFragment ? '#faf5ff' : cardBg,
                  borderColor: isEquipped ? 'var(--neo-accent)' : isFragment ? '#a855f7' : undefined,
                  boxShadow: isEquipped
                    ? 'var(--neo-shadow-lg)'
                    : isFragment
                    ? '4px 4px 0 #a855f7'
                    : 'var(--neo-shadow)',
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
                      item.type === 'emoji' ? (
                        <button
                          disabled
                          className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                          style={{
                            background: 'var(--card-bg-green)',
                            border: 'var(--neo-border)',
                            color: 'var(--neo-accent)',
                            opacity: 0.9,
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Owned
                        </button>
                      ) : isEquipped ? (
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
                    ) : isFragment ? (
                      <motion.button
                        onClick={() => handleFragmentPurchase(item.id, item.cost)}
                        disabled={!canAfford}
                        whileHover={canAfford ? { y: -2 } : undefined}
                        whileTap={canAfford ? { y: 2, scale: 0.97 } : undefined}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: canAfford ? '#a855f7' : 'var(--neo-white)',
                          border: '3px solid #000',
                          boxShadow: canAfford ? '3px 3px 0 #000' : 'none',
                          color: canAfford ? '#fff' : 'var(--text-subtle)',
                        }}
                      >
                        {canAfford ? (
                          <>
                            <Gem className="w-3.5 h-3.5" />
                            <span>{item.cost} Fragments</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Need {item.cost} Frags</span>
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => handlePurchase(item.id, item.cost)}
                        disabled={!canAfford}
                        whileHover={canAfford ? { y: -2 } : undefined}
                        whileTap={canAfford ? { y: 2, scale: 0.97 } : undefined}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: canAfford ? 'var(--neo-white)' : 'var(--neo-white)',
                          border: 'var(--neo-border)',
                          color: canAfford ? 'var(--neo-black)' : 'var(--text-subtle)',
                          boxShadow: canAfford ? 'var(--neo-shadow-sm)' : 'none',
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
                      </motion.button>
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

  if (item.type === 'emoji') {
    const isPremium = item.rarity === 'premium';
    return (
      <div
        className="aspect-[4/3] flex items-center justify-center relative"
        style={{ background: isPremium ? '#f5f0ff' : 'var(--neo-white)' }}
      >
        <div className="relative w-20 h-20">
          <Image src={item.value} alt={item.name} fill className="object-contain" unoptimized />
        </div>
        {isPremium && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
            style={{ background: '#a855f7', border: '2px solid #000', color: '#fff' }}
          >
            <Gem className="w-2.5 h-2.5" />
            Premium
          </div>
        )}
      </div>
    );
  }

  return null;
}
