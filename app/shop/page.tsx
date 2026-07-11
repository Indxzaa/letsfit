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
  purchaseWithEmeralds,
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

type TabType = 'emoji' | 'premium' | 'supreme';

const TABS: { id: TabType; label: string }[] = [
  { id: 'emoji',   label: 'Emojis' },
  { id: 'premium', label: 'Premium' },
  { id: 'supreme', label: 'Supreme' },
];

export default function ShopPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [tab, setTab] = useState<TabType>('emoji');
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const { user } = useAuth();
  const isDev = user?.email === DEV_EMAIL;

  useEffect(() => {
    let p = loadProgress();
    // Auto-unlock premium emojis when fragment threshold is reached
    p = checkPremiumAutoUnlocks(p);
    setProgress(p);
    const unsub = subscribeToProgress(() => {
      let fresh = loadProgress();
      fresh = checkPremiumAutoUnlocks(fresh);
      setProgress(fresh);
    });
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

  const handleEmeraldPurchase = (id: string, cost: number) => {
    const result = purchaseWithEmeralds(progress, id, cost);
    if (result.reason === 'insufficient') { showFeedback('err', 'Not enough Emeralds.'); playSound('insufficient'); return; }
    if (result.reason === 'owned') { showFeedback('err', 'You already own this item.'); return; }
    const final = applyNewAchievements(result.progress);
    if (final !== result.progress) saveProgress(final);
    setProgress(final);
    showFeedback('ok', 'Supreme emoji unlocked!');
    playSound('purchase');
  };

  const handleEquip = (slot: string, id: string) => {
    const updated = equipItem(progress, slot, id);
    setProgress(updated);
    showFeedback('ok', 'Equipped.');
  };

  const tabItems: ShopItem[] = tab === 'emoji'
    ? SHOP_ITEMS.filter(i => i.type === 'emoji' && !i.currency)
    : tab === 'premium'
    ? SHOP_ITEMS.filter(i => i.currency === 'fragments')
    : SHOP_ITEMS.filter(i => i.currency === 'emeralds');

  const fragments = progress.emojiFragments ?? 0;
  const emeralds  = progress.emeralds ?? 0;

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
              Spend FitCoins on emojis, Emeralds on supreme drops, and collect Fragments to unlock premium emojis.
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
            {/* Emeralds */}
            <div className="neo-card px-5 py-3.5 flex items-center gap-3" style={{ background: '#ecfdf5', borderRadius: 0, border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}>
              <div className="w-9 h-9 flex items-center justify-center" style={{ background: '#10b981', borderRadius: 0, border: '2px solid #000' }}>
                <Gem className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold tabular-nums leading-none" style={{ color: '#10b981' }}>
                  {emeralds.toLocaleString()}
                </div>
                <div className="text-xs font-black uppercase tracking-wider" style={{ color: '#059669' }}>Emeralds</div>
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

        {/* Tab description */}
        {tab === 'premium' && (
          <div className="mb-6 p-4 text-xs font-bold uppercase tracking-wider" style={{ background: '#faf5ff', border: '2px solid #a855f7', color: '#7c3aed', boxShadow: '3px 3px 0 #a855f7' }}>
            Collect Emoji Fragments from daily login rewards and events. Premium emojis unlock automatically when you reach the fragment milestone. Fragments are never spent.
          </div>
        )}
        {tab === 'supreme' && (
          <div className="mb-6 p-4 text-xs font-bold uppercase tracking-wider" style={{ background: '#ecfdf5', border: '2px solid #10b981', color: '#059669', boxShadow: '3px 3px 0 #10b981' }}>
            Supreme emojis are purchased with Emeralds — rare currency earned from boss victories, major achievements, and special events.
          </div>
        )}

        {/* Item grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tabItems.map((item, i) => {
            const isUnlocked = allUnlocked.has(item.id);
            const isEquipped = equipped[item.type] === item.id;

            if (item.currency === 'fragments') {
              return (
                <PremiumEmojiCard
                  key={item.id}
                  item={item}
                  fragments={fragments}
                  isOwned={isUnlocked}
                  index={i}
                />
              );
            }

            if (item.currency === 'emeralds') {
              return (
                <SupremeEmojiCard
                  key={item.id}
                  item={item}
                  emeralds={emeralds}
                  isOwned={isUnlocked}
                  onBuy={() => handleEmeraldPurchase(item.id, item.cost)}
                  index={i}
                />
              );
            }

            // Standard FitCoin emoji
            const canAfford = progress.fitCoins >= item.cost;
            const rarity = RARITY_CONFIG[item.rarity];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
                style={{
                  borderRadius: 0,
                  background: isEquipped ? 'var(--card-bg-green)' : 'var(--card-bg-amber)',
                  borderColor: isEquipped ? 'var(--neo-accent)' : undefined,
                  boxShadow: isEquipped ? 'var(--neo-shadow-lg)' : 'var(--neo-shadow)',
                }}
              >
                <div style={{ borderBottom: 'var(--neo-border-2)' }}>
                  <ItemPreview item={item} />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <div className="font-display text-lg font-bold text-app truncate">{item.name}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 shrink-0" style={{ color: rarity.color, background: `${rarity.color}22`, border: `2px solid ${rarity.color}` }}>{rarity.label}</span>
                      </div>
                      <div className="text-xs text-subtle">{item.description}</div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    {isUnlocked ? (
                      <button disabled className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                        style={{ background: 'var(--card-bg-green)', border: 'var(--neo-border)', color: 'var(--neo-accent)', opacity: 0.9 }}>
                        <Check className="w-3.5 h-3.5" /> Owned
                      </button>
                    ) : item.rarity === 'world' ? (
                      <button disabled className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
                        style={{ background: 'var(--neo-white)', border: 'var(--neo-border)', color: 'var(--text-subtle)', opacity: 0.6 }}>
                        <Lock className="w-3.5 h-3.5" /> Clear a world to unlock
                      </button>
                    ) : (
                      <motion.button
                        onClick={() => handlePurchase(item.id, item.cost)}
                        disabled={!canAfford}
                        whileHover={canAfford ? { y: -2 } : undefined}
                        whileTap={canAfford ? { y: 2, scale: 0.97 } : undefined}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'var(--neo-white)', border: 'var(--neo-border)', color: canAfford ? 'var(--neo-black)' : 'var(--text-subtle)', boxShadow: canAfford ? 'var(--neo-shadow-sm)' : 'none' }}
                      >
                        {canAfford ? (
                          <><Coins className="w-3.5 h-3.5" style={{ color: 'var(--neo-accent)' }} /><span>{item.cost.toLocaleString()}</span></>
                        ) : (
                          <><Lock className="w-3.5 h-3.5" /><span>Need {item.cost.toLocaleString()}</span></>
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

// ── Premium emoji card (fragment milestone) ──────────────────────────────────
function PremiumEmojiCard({ item, fragments, isOwned, index }: {
  item: ShopItem; fragments: number; isOwned: boolean; index: number;
}) {
  const pct = Math.min(1, fragments / item.cost);
  const rarity = RARITY_CONFIG[item.rarity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
      style={{
        borderRadius: 0,
        background: isOwned ? 'var(--card-bg-green)' : '#faf5ff',
        border: `3px solid ${isOwned ? 'var(--neo-accent)' : '#a855f7'}`,
        boxShadow: isOwned ? 'var(--neo-shadow-lg)' : '4px 4px 0 #a855f7',
      }}
    >
      <div style={{ borderBottom: `2px solid ${isOwned ? 'var(--neo-accent)' : '#a855f7'}` }}>
        <div className="aspect-[4/3] flex items-center justify-center relative" style={{ background: isOwned ? 'var(--card-bg-green)' : '#f5f0ff' }}>
          <div className="relative w-20 h-20">
            <Image src={item.value} alt={item.name} fill className="object-contain" unoptimized />
          </div>
          {isOwned ? (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: 'var(--neo-accent)', border: '2px solid #000', color: '#fff' }}>
              <Check className="w-2.5 h-2.5" /> Owned
            </div>
          ) : (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: '#a855f7', border: '2px solid #000', color: '#fff' }}>
              <Gem className="w-2.5 h-2.5" /> Premium
            </div>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <div className="font-display text-lg font-bold text-app">{item.name}</div>
          <span className="text-[10px] font-bold px-2 py-0.5 shrink-0" style={{ color: rarity.color, background: `${rarity.color}22`, border: `2px solid ${rarity.color}` }}>{rarity.label}</span>
        </div>
        {isOwned ? (
          <p className="text-xs font-bold mt-1" style={{ color: 'var(--neo-accent)' }}>Unlocked — usable in all multiplayer modes.</p>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#7c3aed' }}>
                {Math.min(fragments, item.cost).toLocaleString()} / {item.cost} Fragments
              </span>
              {pct >= 1 && <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#7c3aed' }}>Auto-unlocking...</span>}
            </div>
            <div style={{ height: 10, background: '#e9d5ff', border: '2px solid #000', position: 'relative', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: pct >= 1 ? '#a855f7' : '#c084fc', position: 'absolute', top: 0, left: 0 }}
              />
            </div>
            <p className="text-[10px] text-subtle mt-1.5">Collect fragments from daily login rewards. Unlocks automatically — fragments are never spent.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Supreme emoji card (emerald purchase) ────────────────────────────────────
function SupremeEmojiCard({ item, emeralds, isOwned, onBuy, index }: {
  item: ShopItem; emeralds: number; isOwned: boolean; onBuy: () => void; index: number;
}) {
  const canAfford = emeralds >= item.cost;
  const rarity = RARITY_CONFIG[item.rarity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
      style={{
        borderRadius: 0,
        background: isOwned ? 'var(--card-bg-green)' : '#ecfdf5',
        border: `3px solid ${isOwned ? 'var(--neo-accent)' : '#10b981'}`,
        boxShadow: isOwned ? 'var(--neo-shadow-lg)' : '4px 4px 0 #10b981',
      }}
    >
      <div style={{ borderBottom: `2px solid ${isOwned ? 'var(--neo-accent)' : '#10b981'}` }}>
        <div className="aspect-[4/3] flex items-center justify-center relative" style={{ background: isOwned ? 'var(--card-bg-green)' : '#d1fae5' }}>
          <div className="relative w-20 h-20">
            <Image src={item.value} alt={item.name} fill className="object-contain" unoptimized />
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
            style={{ background: '#10b981', border: '2px solid #000', color: '#fff' }}>
            <Gem className="w-2.5 h-2.5" /> Supreme
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <div className="font-display text-lg font-bold text-app">{item.name}</div>
          <span className="text-[10px] font-bold px-2 py-0.5 shrink-0" style={{ color: rarity.color, background: `${rarity.color}22`, border: `2px solid ${rarity.color}` }}>{rarity.label}</span>
        </div>
        <div className="text-xs text-subtle mb-4">{item.description}</div>
        <div className="mt-auto">
          {isOwned ? (
            <button disabled className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              style={{ background: 'var(--card-bg-green)', border: '3px solid #000', color: 'var(--neo-accent)' }}>
              <Check className="w-3.5 h-3.5" /> Owned
            </button>
          ) : (
            <motion.button
              onClick={onBuy}
              disabled={!canAfford}
              whileHover={canAfford ? { y: -2 } : undefined}
              whileTap={canAfford ? { y: 2, scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canAfford ? '#10b981' : 'var(--neo-white)',
                border: '3px solid #000',
                boxShadow: canAfford ? '3px 3px 0 #000' : 'none',
                color: canAfford ? '#fff' : 'var(--text-subtle)',
              }}
            >
              {canAfford ? (
                <><Gem className="w-3.5 h-3.5" /><span>{item.cost} Emeralds</span></>
              ) : (
                <><Lock className="w-3.5 h-3.5" /><span>Need {item.cost} Emeralds</span></>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ItemPreview({ item }: { item: ShopItem }) {
  if (item.type === 'emoji') {
    return (
      <div className="aspect-[4/3] flex items-center justify-center" style={{ background: 'var(--neo-white)' }}>
        <div className="relative w-20 h-20">
          <Image src={item.value} alt={item.name} fill className="object-contain" unoptimized />
        </div>
      </div>
    );
  }
  return null;
}

// ── Auto-unlock premium emojis when fragment threshold reached ────────────────
function checkPremiumAutoUnlocks(p: Progress): Progress {
  const premiumItems = SHOP_ITEMS.filter(i => i.currency === 'fragments');
  const fragments = p.emojiFragments ?? 0;
  let changed = false;
  let updated = { ...p };
  for (const item of premiumItems) {
    if (!updated.unlockedItems.includes(item.id) && fragments >= item.cost) {
      updated = { ...updated, unlockedItems: [...updated.unlockedItems, item.id] };
      changed = true;
    }
  }
  if (changed) saveProgress(updated);
  return updated;
}
