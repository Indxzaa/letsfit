'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Check, Lock, Gem, Frame } from 'lucide-react';
import { playSound } from '@/lib/audio';
import {
  loadProgress,
  purchaseItem,
  purchaseWithEmeralds,
  equipItem,
  activateBooster,
  addToInventory,
  saveProgress,
  subscribeToProgress,
  MAX_FIT_COINS,
  type Progress,
} from '@/lib/progress';
import { SHOP_ITEMS, FRAME_ITEMS, FREE_DEFAULTS, DEFAULT_EQUIPPED, RARITY_CONFIG, BOOSTER_DEFS, BOOSTER_PRICES, KEY_DEFS, CHEST_DEFS, getShopItem } from '@/lib/shop';
import type { ShopItem } from '@/lib/progress';
import Navbar from '@/components/Navbar';
import { ShopSkeleton } from '@/components/Skeleton';
import { useAuth } from '@/components/AuthProvider';
import { applyNewAchievements } from '@/lib/achievements';
import ChestOpeningModal from '@/components/ChestOpeningModal';

const DEV_EMAIL = 'indyy8262@gmail.com';

// Must match REEL_ITEMS order in ChestOpeningModal.tsx
const REEL_IDS = [
  'coin_boost', 'xp_boost', 'emerald_boost', 'lucky_charm', 'streak_shield',
  'fragment', 'coins', 'emeralds', 'frame', 'emoji',
];

function generateReward(): string {
  return REEL_IDS[Math.floor(Math.random() * REEL_IDS.length)];
}

// For frame/emoji categories, resolve to a specific item ID before the modal opens.
// All other categories are returned as-is.
function resolveReward(category: string, progress: Progress): string {
  if (category === 'frame') {
    const pool = FRAME_ITEMS.filter(i => i.rarity !== 'premium');
    const unowned = pool.filter(i => !progress.unlockedItems.includes(i.id));
    return unowned.length > 0
      ? unowned[Math.floor(Math.random() * unowned.length)].id
      : 'coins';
  }
  if (category === 'emoji') {
    const pool = SHOP_ITEMS.filter(i => i.type === 'emoji' && i.rarity !== 'premium' && i.rarity !== 'world');
    const unowned = pool.filter(i => !progress.unlockedItems.includes(i.id));
    return unowned.length > 0
      ? unowned[Math.floor(Math.random() * unowned.length)].id
      : 'coins';
  }
  return category;
}

function rewardToReelIndex(reward: string): number {
  let pos = REEL_IDS.indexOf(reward);
  // Specific frame/emoji item IDs — map to their category's reel slot
  if (pos === -1) {
    const item = getShopItem(reward);
    if (item) pos = item.type === 'frame' ? REEL_IDS.indexOf('frame') : REEL_IDS.indexOf('emoji');
  }
  return 20 + (pos >= 0 ? pos : 0);
}

type RewardDisplay = { icon: string | null; iconFallback: string; label: string; qty: string };

function getRewardDisplay(reward: string): RewardDisplay {
  if (reward === 'coins')    return { icon: null,            iconFallback: '🪙', label: 'FitCoins',        qty: '+100' };
  if (reward === 'emeralds') return { icon: null,            iconFallback: '💎', label: 'Emeralds',        qty: '+5'   };
  if (reward === 'fragment') return { icon: '/purplefragment.png', iconFallback: '✨', label: 'Emoji Fragments', qty: '+25'  };
  const booster = BOOSTER_DEFS.find(b => b.id === reward);
  if (booster) return { icon: booster.img, iconFallback: '🛡️', label: booster.name, qty: 'x1' };
  const key = KEY_DEFS.find(k => k.id === reward);
  if (key) return { icon: key.img, iconFallback: '🔑', label: key.name, qty: 'x1' };
  const item = getShopItem(reward);
  if (item) {
    const suffix = item.type === 'frame' ? ' Frame' : item.type === 'emoji' ? ' Emoji' : '';
    return { icon: item.value, iconFallback: '🎁', label: item.name + suffix, qty: 'Unlocked' };
  }
  return { icon: null, iconFallback: '🎁', label: reward, qty: '' };
}

type ShopTab = 'emojis' | 'frames' | 'boosters' | 'chests';

// Normal → Premium → Supreme
function sortEmojis(items: ShopItem[]): ShopItem[] {
  const order = (i: ShopItem) => i.currency === 'emeralds' ? 2 : i.currency === 'fragments' ? 1 : 0;
  return [...items].sort((a, b) => order(a) - order(b));
}

// Common → Premium → Supreme → Chest exclusive
function sortFrames(items: ShopItem[]): ShopItem[] {
  const order = (i: ShopItem) =>
    i.rarity === 'chest-exclusive' ? 3
    : i.currency === 'emeralds' ? 2
    : i.currency === 'fragments' ? 1
    : 0;
  return [...items].sort((a, b) => order(a) - order(b));
}

function checkPremiumAutoUnlocks(p: Progress): Progress {
  const fragmentItems = [...SHOP_ITEMS, ...FRAME_ITEMS].filter(i => i.currency === 'fragments');
  const fragments = p.emojiFragments ?? 0;
  let changed = false;
  let updated = { ...p };
  for (const item of fragmentItems) {
    if (!updated.unlockedItems.includes(item.id) && fragments >= item.cost) {
      updated = { ...updated, unlockedItems: [...updated.unlockedItems, item.id] };
      changed = true;
    }
  }
  if (changed) saveProgress(updated);
  return updated;
}

export default function ShopPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [activeTab, setActiveTab] = useState<ShopTab>('emojis');
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [openingChest, setOpeningChest] = useState<ChestDef | null>(null);
  const [pendingReward, setPendingReward] = useState<string | null>(null);
  const [reelKey, setReelKey] = useState(0);
  const { user } = useAuth();
  const isDev = user?.email === DEV_EMAIL;

  useEffect(() => {
    let p = loadProgress();
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
    // Dev account owns everything
    ...(isDev ? [...SHOP_ITEMS, ...FRAME_ITEMS].map(i => i.id) : []),
  ]);

  const handlePurchase = (id: string, cost: number) => {
    const result = purchaseItem(progress, id, cost);
    if (result.reason === 'insufficient') { showFeedback('err', 'Not enough FitCoins.'); playSound('insufficient'); return; }
    if (result.reason === 'owned') { showFeedback('err', 'You already own this.'); return; }
    const final = applyNewAchievements(result.progress);
    if (final !== result.progress) saveProgress(final);
    setProgress(final);
    showFeedback('ok', 'Item unlocked!');
    playSound('purchase');
  };

  const handleEmeraldPurchase = (id: string, cost: number) => {
    const result = purchaseWithEmeralds(progress, id, cost);
    if (result.reason === 'insufficient') { showFeedback('err', 'Not enough Emeralds.'); playSound('insufficient'); return; }
    if (result.reason === 'owned') { showFeedback('err', 'You already own this.'); return; }
    const final = applyNewAchievements(result.progress);
    if (final !== result.progress) saveProgress(final);
    setProgress(final);
    showFeedback('ok', 'Item unlocked!');
    playSound('purchase');
  };

  const handleActivate = (id: string) => {
    const updated = activateBooster(progress, id);
    if (!updated) { showFeedback('err', 'No boosters in inventory.'); return; }
    setProgress(updated);
    showFeedback('ok', 'Booster activated!');
    playSound('purchase');
  };

  const handleBuyBooster = (id: string, cost: number) => {
    if ((progress.emeralds ?? 0) < cost) { showFeedback('err', 'Not enough Emeralds.'); playSound('insufficient'); return; }
    const deducted = { ...progress, emeralds: (progress.emeralds ?? 0) - cost };
    const updated = addToInventory(deducted, id, 1);
    setProgress(updated);
    showFeedback('ok', 'Booster purchased!');
    playSound('purchase');
  };

  const openChest = (def: ChestDef) => {
    const p = progress;
    const keyQty = p.inventory?.[def.keyId] ?? 0;
    const canAffordCoins = def.currency === 'fitCoins' && p.fitCoins >= def.cost;
    const canAffordEmeralds = def.currency === 'emeralds' && (p.emeralds ?? 0) >= def.cost;
    if (keyQty === 0 && !canAffordCoins && !canAffordEmeralds) {
      showFeedback('err', "Can't afford to open this chest.");
      return;
    }
    let updated = { ...p };
    if (keyQty > 0) {
      updated = { ...updated, inventory: { ...updated.inventory, [def.keyId]: keyQty - 1 } };
    } else if (def.currency === 'fitCoins') {
      updated = { ...updated, fitCoins: updated.fitCoins - def.cost };
    } else {
      updated = { ...updated, emeralds: (updated.emeralds ?? 0) - def.cost };
    }
    saveProgress(updated);
    setProgress(updated);
    const category = generateReward();
    const r = resolveReward(category, updated);
    setPendingReward(r);
    setOpeningChest(def);
    setReelKey(k => k + 1);
  };

  const handleEquipFrame = (id: string) => {
    const alreadyEquipped = progress.equippedItems.frame === id;
    const updated = equipItem(progress, 'frame', alreadyEquipped ? 'frame-none' : id);
    setProgress(updated);
    playSound('purchase');
  };

  const emojiItems = sortEmojis(SHOP_ITEMS.filter(i => i.type === 'emoji'));
  const frameItems = sortFrames(FRAME_ITEMS);
  const fragments  = progress.emojiFragments ?? 0;
  const emeralds   = progress.emeralds ?? 0;
  const equippedFrame = progress.equippedItems.frame ?? 'frame-none';

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
              Spend FitCoins on emojis and frames, Emeralds on supreme drops, and collect Fragments to unlock premium items.
            </p>
          </div>

          {/* Currency balances */}
          <div className="flex flex-col gap-2">
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
            <div className="neo-card px-5 py-3.5 flex items-center gap-3" style={{ background: '#FEE2E2', borderRadius: 0, border: '3px solid #000', boxShadow: '3px 3px 0 #000' }}>
              <div className="w-9 h-9 flex items-center justify-center" style={{ background: 'var(--neo-red)', borderRadius: 0, border: '2px solid #000' }}>
                <Gem className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold tabular-nums leading-none" style={{ color: 'var(--neo-red)' }}>
                  {emeralds.toLocaleString()}
                </div>
                <div className="text-xs font-black uppercase tracking-wider" style={{ color: '#b91c1c' }}>Emeralds</div>
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
              background: feedback.kind === 'ok' ? 'var(--card-bg-green)' : '#FEE2E2',
              borderColor: feedback.kind === 'ok' ? 'var(--neo-accent)' : 'var(--neo-red)',
              color: feedback.kind === 'ok' ? 'var(--neo-accent)' : 'var(--neo-red)',
            }}
          >
            {feedback.msg}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['emojis', 'frames', 'boosters', 'chests'] as ShopTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 text-sm font-bold uppercase tracking-wider cursor-pointer transition-all duration-100"
              style={{
                background: activeTab === tab ? 'var(--neo-accent)' : 'var(--neo-white)',
                color: activeTab === tab ? '#fff' : 'var(--neo-black)',
                border: 'var(--neo-border)',
                boxShadow: activeTab === tab ? 'var(--neo-shadow)' : '2px 2px 0 #000',
              }}
            >
              {tab === 'emojis' ? 'Emojis' : tab === 'frames' ? 'Frames' : tab === 'boosters' ? 'Boosters' : 'Chests'}
            </button>
          ))}
        </div>

        {/* Item grid */}
        {activeTab === 'emojis' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {emojiItems.map((item, i) => (
              <EmojiCard
                key={item.id}
                item={item}
                isOwned={allUnlocked.has(item.id)}
                fitCoins={progress.fitCoins}
                fragments={fragments}
                emeralds={emeralds}
                index={i}
                onBuyCoin={() => handlePurchase(item.id, item.cost)}
                onBuyEmerald={() => handleEmeraldPurchase(item.id, item.cost)}
              />
            ))}
          </div>
        )}

        {activeTab === 'frames' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {frameItems.map((item, i) => (
              <FrameCard
                key={item.id}
                item={item}
                isOwned={allUnlocked.has(item.id)}
                isEquipped={equippedFrame === item.id}
                fitCoins={progress.fitCoins}
                fragments={fragments}
                emeralds={emeralds}
                index={i}
                onBuyCoin={() => handlePurchase(item.id, item.cost)}
                onBuyEmerald={() => handleEmeraldPurchase(item.id, item.cost)}
                onEquip={() => handleEquipFrame(item.id)}
              />
            ))}
          </div>
        )}

        {activeTab === 'boosters' && (
          <div>
            <p className="text-sm text-muted mb-6">
              Buy boosters with Emeralds or earn them from chests and challenges. Activate one from your inventory to apply its effect.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BOOSTER_DEFS.map((def, i) => (
                <BoosterCard
                  key={def.id}
                  def={def}
                  qty={progress.inventory?.[def.id] ?? 0}
                  usesLeft={(progress.activeBoosts ?? []).find(b => b.id === def.id)?.usesLeft ?? 0}
                  index={i}
                  emeraldCost={BOOSTER_PRICES[def.id] ?? 0}
                  emeralds={emeralds}
                  onActivate={() => handleActivate(def.id)}
                  onBuy={() => handleBuyBooster(def.id, BOOSTER_PRICES[def.id] ?? 0)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chests' && (
          <div>
            <p className="text-sm text-muted mb-6">
              Open chests to earn boosters, keys, frames, and exclusive cosmetics. Pay with FitCoins, Emeralds, or use a matching key.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CHEST_DEFS.map((def, i) => (
                <ChestCard
                  key={def.id}
                  def={def}
                  keyQty={progress.inventory?.[def.keyId] ?? 0}
                  fitCoins={progress.fitCoins}
                  emeralds={emeralds}
                  index={i}
                  onOpen={() => openChest(def)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {openingChest && pendingReward && (
        <ChestOpeningModal
          key={reelKey}
          def={openingChest}
          isOpen={!!openingChest}
          onClose={() => { setOpeningChest(null); setPendingReward(null); }}
          reelLandIndex={rewardToReelIndex(pendingReward)}
          reward={pendingReward}
          rewardDisplay={getRewardDisplay(pendingReward)}
          onReroll={() => { setOpeningChest(null); setPendingReward(null); setTimeout(() => openChest(openingChest), 0); }}
          onClaimed={(r) => {
            if (!progress) return;
            let u: ReturnType<typeof addToInventory>;
            if (['coin_boost', 'xp_boost', 'emerald_boost', 'lucky_charm', 'streak_shield'].includes(r)) {
              u = addToInventory(progress, r, 1);
            } else if (r === 'fragment') {
              u = { ...progress, emojiFragments: (progress.emojiFragments ?? 0) + 25 };
              saveProgress(u);
            } else if (r === 'coins') {
              u = { ...progress, fitCoins: Math.min(MAX_FIT_COINS, progress.fitCoins + 100) };
              saveProgress(u);
            } else if (r === 'emeralds') {
              u = { ...progress, emeralds: (progress.emeralds ?? 0) + 5 };
              saveProgress(u);
            } else {
              const item = getShopItem(r);
              if (!item) return;
              if (progress.unlockedItems.includes(r)) {
                u = { ...progress, fitCoins: Math.min(MAX_FIT_COINS, progress.fitCoins + 50) };
              } else {
                u = { ...progress, unlockedItems: [...progress.unlockedItems, r] };
              }
              saveProgress(u);
            }
            setProgress(u);
          }}
        />
      )}
    </div>
  );
}

// ── Emoji card ────────────────────────────────────────────────────────────────
interface EmojiCardProps {
  item: ShopItem;
  isOwned: boolean;
  fitCoins: number;
  fragments: number;
  emeralds: number;
  index: number;
  onBuyCoin: () => void;
  onBuyEmerald: () => void;
}

function EmojiCard({ item, isOwned, fitCoins, fragments, emeralds, index, onBuyCoin, onBuyEmerald }: EmojiCardProps) {
  const isPremium = item.currency === 'fragments';
  const isSupreme = item.currency === 'emeralds';
  const rarity = RARITY_CONFIG[item.rarity];

  const cardBg   = isOwned ? 'var(--card-bg-green)'
                 : isPremium ? 'var(--card-bg-purple)'
                 : isSupreme ? '#FEE2E2'
                 : 'var(--card-bg-amber)';
  const cardBorder = isOwned ? 'var(--neo-accent)'
                   : isPremium ? 'var(--neo-purple)'
                   : isSupreme ? 'var(--neo-red)'
                   : '#111111';
  const cardShadow = isOwned
    ? 'var(--neo-shadow-lg)'
    : isPremium ? `4px 4px 0 var(--neo-purple)`
    : isSupreme ? `4px 4px 0 var(--neo-red)`
    : 'var(--neo-shadow)';

  const previewBg = isOwned ? 'var(--card-bg-green)'
                  : isPremium ? '#EDE9FE'
                  : isSupreme ? '#FCA5A5'
                  : 'var(--neo-white)';

  const badge = isOwned ? null
              : isPremium ? { label: 'Premium', bg: 'var(--neo-purple)' }
              : isSupreme ? { label: 'Supreme', bg: 'var(--neo-red)' }
              : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
      style={{ borderRadius: 0, background: cardBg, border: `3px solid ${cardBorder}`, boxShadow: cardShadow }}
    >
      <div style={{ borderBottom: `2px solid ${cardBorder}`, background: previewBg }}>
        <div className="aspect-[4/3] flex items-center justify-center relative">
          <div className="relative w-20 h-20">
            <Image src={item.value} alt={item.name} fill className="object-contain" unoptimized />
          </div>
          {isOwned && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: 'var(--neo-accent)', border: '2px solid #000', color: '#fff' }}>
              <Check className="w-2.5 h-2.5" /> Owned
            </div>
          )}
          {badge && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: badge.bg, border: '2px solid #000', color: '#fff' }}>
              {badge.label}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <div className="font-display text-lg font-bold text-app truncate">{item.name}</div>
          <span className="text-[10px] font-bold px-2 py-0.5 shrink-0"
            style={{ color: rarity.color, background: `${rarity.color}22`, border: `2px solid ${rarity.color}` }}>
            {rarity.label}
          </span>
        </div>

        <div className="mt-auto pt-3">
          {isOwned ? (
            <button disabled className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              style={{ background: 'var(--card-bg-green)', border: '3px solid #000', color: 'var(--neo-accent)' }}>
              <Check className="w-3.5 h-3.5" /> Owned
            </button>
          ) : isPremium ? (
            <FragmentProgress fragments={fragments} cost={item.cost} />
          ) : isSupreme ? (
            <EmeraldBuyButton cost={item.cost} canAfford={emeralds >= item.cost} onBuy={onBuyEmerald} />
          ) : item.rarity === 'world' ? (
            <button disabled className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
              style={{ background: 'var(--neo-white)', border: 'var(--neo-border)', color: 'var(--text-subtle)', opacity: 0.6 }}>
              <Lock className="w-3.5 h-3.5" /> Clear a world to unlock
            </button>
          ) : (
            <CoinBuyButton cost={item.cost} canAfford={fitCoins >= item.cost} onBuy={onBuyCoin} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Frame card ────────────────────────────────────────────────────────────────
interface FrameCardProps {
  item: ShopItem;
  isOwned: boolean;
  isEquipped: boolean;
  fitCoins: number;
  fragments: number;
  emeralds: number;
  index: number;
  onBuyCoin: () => void;
  onBuyEmerald: () => void;
  onEquip: () => void;
}

function FrameCard({ item, isOwned, isEquipped, fitCoins, fragments, emeralds, index, onBuyCoin, onBuyEmerald, onEquip }: FrameCardProps) {
  const isPremium      = item.currency === 'fragments';
  const isSupreme      = item.currency === 'emeralds';
  const isChestOnly    = item.rarity === 'chest-exclusive';
  const rarity         = RARITY_CONFIG[item.rarity];

  const cardBg = isEquipped   ? 'var(--card-bg-green)'
               : isOwned      ? 'var(--card-bg-amber)'
               : isPremium    ? 'var(--card-bg-purple)'
               : isSupreme    ? '#FEE2E2'
               : isChestOnly  ? '#FEF3C7'
               : 'var(--card-bg-amber)';

  const cardBorder = isEquipped  ? 'var(--neo-accent)'
                   : isOwned     ? '#111111'
                   : isPremium   ? 'var(--neo-purple)'
                   : isSupreme   ? 'var(--neo-red)'
                   : isChestOnly ? '#d97706'
                   : '#111111';

  const cardShadow = isEquipped  ? 'var(--neo-shadow-lg)'
                   : isPremium   ? '4px 4px 0 var(--neo-purple)'
                   : isSupreme   ? '4px 4px 0 var(--neo-red)'
                   : isChestOnly ? '4px 4px 0 #d97706'
                   : 'var(--neo-shadow)';

  const previewBg = isEquipped  ? 'var(--card-bg-green)'
                  : isOwned     ? '#f5f5f5'
                  : isPremium   ? '#EDE9FE'
                  : isSupreme   ? '#FCA5A5'
                  : isChestOnly ? '#FDE68A'
                  : 'var(--neo-white)';

  const badge = isEquipped   ? { label: 'Equipped', bg: 'var(--neo-accent)' }
              : isOwned      ? null
              : isPremium    ? { label: 'Premium',  bg: 'var(--neo-purple)' }
              : isSupreme    ? { label: 'Supreme',  bg: 'var(--neo-red)' }
              : isChestOnly  ? { label: 'Chest Only', bg: '#d97706' }
              : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
      style={{ borderRadius: 0, background: cardBg, border: `3px solid ${cardBorder}`, boxShadow: cardShadow }}
    >
      {/* Frame preview */}
      <div style={{ borderBottom: `2px solid ${cardBorder}`, background: previewBg }}>
        <div className="aspect-[4/3] flex items-center justify-center relative">
          <div className="relative w-24 h-24">
            <Image src={item.value} alt={item.name} fill className="object-contain" unoptimized />
          </div>
          {badge && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: badge.bg, border: '2px solid #000', color: '#fff' }}>
              {isEquipped && <Check className="w-2.5 h-2.5" />}
              {badge.label}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <div className="font-display text-lg font-bold text-app truncate">{item.name}</div>
          <span className="text-[10px] font-bold px-2 py-0.5 shrink-0"
            style={{ color: rarity.color, background: `${rarity.color}22`, border: `2px solid ${rarity.color}` }}>
            {rarity.label}
          </span>
        </div>

        <div className="mt-auto pt-3 flex flex-col gap-2">
          {/* Buy / progress section */}
          {!isOwned && (
            isPremium ? (
              <FragmentProgress fragments={fragments} cost={item.cost} />
            ) : isSupreme ? (
              <EmeraldBuyButton cost={item.cost} canAfford={emeralds >= item.cost} onBuy={onBuyEmerald} />
            ) : isChestOnly ? (
              <div className="py-2.5 text-xs font-bold uppercase tracking-wider text-center"
                style={{ background: '#FEF3C7', border: '3px solid #d97706', color: '#92400e' }}>
                Legendary Chest or higher
              </div>
            ) : (
              <CoinBuyButton cost={item.cost} canAfford={fitCoins >= item.cost} onBuy={onBuyCoin} />
            )
          )}

          {/* Equip / unequip section — only shown when owned */}
          {isOwned && (
            <motion.button
              onClick={onEquip}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              style={{
                background: isEquipped ? 'var(--neo-accent)' : 'var(--neo-white)',
                border: '3px solid #000',
                boxShadow: isEquipped ? '3px 3px 0 #000' : '2px 2px 0 #000',
                color: isEquipped ? '#fff' : 'var(--neo-black)',
              }}
            >
              {isEquipped
                ? <><Check className="w-3.5 h-3.5" /><span>Equipped</span></>
                : <><Frame className="w-3.5 h-3.5" /><span>Equip</span></>}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Booster card ─────────────────────────────────────────────────────────────
import type { BoosterDef, ChestDef } from '@/lib/shop';

interface BoosterCardProps {
  def: BoosterDef;
  qty: number;
  usesLeft: number;
  index: number;
  emeraldCost: number;
  emeralds: number;
  onActivate: () => void;
  onBuy: () => void;
}

function BoosterCard({ def, qty, usesLeft, index, emeraldCost, emeralds, onActivate, onBuy }: BoosterCardProps) {
  const isActive  = usesLeft > 0;
  const hasStock  = qty > 0;
  const canAfford = emeralds >= emeraldCost;

  const cardBg     = isActive  ? 'var(--card-bg-green)'
                   : hasStock  ? 'var(--card-bg-amber)'
                   : 'var(--neo-white)';
  const cardBorder = isActive  ? 'var(--neo-accent)'
                   : hasStock  ? '#111111'
                   : '#cccccc';
  const cardShadow = isActive  ? 'var(--neo-shadow-lg)'
                   : hasStock  ? 'var(--neo-shadow)'
                   : '2px 2px 0 #ccc';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
      style={{ borderRadius: 0, background: cardBg, border: `3px solid ${cardBorder}`, boxShadow: cardShadow }}
    >
      {/* Image */}
      <div style={{ borderBottom: `2px solid ${cardBorder}`, background: isActive ? 'var(--card-bg-green)' : hasStock ? 'var(--card-bg-amber)' : '#f5f5f5' }}>
        <div className="aspect-[4/3] flex items-center justify-center relative">
          <div className="relative w-20 h-20">
            {def.img
              ? <Image src={def.img} alt={def.name} fill className="object-contain" unoptimized />
              : <div className="w-full h-full flex items-center justify-center text-4xl">🛡️</div>
            }
          </div>
          {isActive && (
            <div className="absolute top-2 right-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: 'var(--neo-accent)', border: '2px solid #000', color: '#fff' }}>
              Active · {usesLeft} left
            </div>
          )}
          {!isActive && hasStock && (
            <div className="absolute top-2 right-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: '#111', border: '2px solid #000', color: '#fff' }}>
              ×{qty} in bag
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="font-display text-lg font-bold text-app mb-1">{def.name}</div>
        <div className="text-xs text-muted mb-3 leading-relaxed">{def.description}</div>

        <div className="mt-auto flex flex-col gap-2">
          {/* Buy row */}
          <motion.button
            onClick={onBuy}
            whileHover={canAfford ? { y: -2 } : {}}
            whileTap={canAfford ? { y: 2, scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            disabled={!canAfford}
            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            style={canAfford
              ? { background: '#FEE2E2', border: '3px solid var(--neo-red)', boxShadow: '2px 2px 0 #000', color: 'var(--neo-red)' }
              : { background: '#f5f5f5', border: '3px solid #ccc', color: '#aaa', cursor: 'not-allowed' }}
          >
            <Gem className="w-3.5 h-3.5" />
            {emeraldCost} — Buy
          </motion.button>

          {/* Divider */}
          <div style={{ borderTop: `2px solid ${cardBorder}` }} />

          {/* Activate / status row */}
          {isActive ? (
            <div className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              style={{ background: 'var(--card-bg-green)', border: '3px solid var(--neo-accent)', color: 'var(--neo-accent)' }}>
              <Check className="w-3.5 h-3.5" /> {def.effect}
            </div>
          ) : hasStock ? (
            <motion.button
              onClick={onActivate}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ background: 'var(--neo-white)', border: 'var(--neo-border)', boxShadow: 'var(--neo-shadow-sm)', color: 'var(--neo-black)' }}
            >
              Activate
            </motion.button>
          ) : (
            <div className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              style={{ background: '#f5f5f5', border: '3px solid #ccc', color: '#aaa' }}>
              <Lock className="w-3.5 h-3.5" /> Not in inventory
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function FragmentProgress({ fragments, cost }: { fragments: number; cost: number }) {
  const current = Math.min(fragments, cost);
  const pct = current / cost;
  return (
    <div>   
      <div className="flex items-center gap-1.5 mb-1.5">
        <Image src="/purplefragment.png" alt="Fragment" width={85} height={85} className="object-contain shrink-0" unoptimized />
        <span className="text-xs font-black tabular-nums" style={{ color: 'var(--neo-purple)' }}>
          {current.toLocaleString()} / {cost}
        </span>
      </div>
      <div style={{ height: 10, background: '#DDD6FE', border: '2px solid #000', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: pct >= 1 ? 'var(--neo-purple)' : '#A78BFA', position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    </div>
  );
}

function EmeraldBuyButton({ cost, canAfford, onBuy }: { cost: number; canAfford: boolean; onBuy: () => void }) {
  return (
    <motion.button
      onClick={onBuy}
      disabled={!canAfford}
      whileHover={canAfford ? { y: -2 } : undefined}
      whileTap={canAfford ? { y: 2, scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: canAfford ? 'var(--neo-red)' : 'var(--neo-white)',
        border: '3px solid #000',
        boxShadow: canAfford ? '3px 3px 0 #000' : 'none',
        color: canAfford ? '#fff' : 'var(--text-subtle)',
      }}
    >
      {canAfford
        ? <><Gem className="w-3.5 h-3.5" /><span>{cost} Emeralds</span></>
        : <><Lock className="w-3.5 h-3.5" /><span>Need {cost} Emeralds</span></>}
    </motion.button>
  );
}

function CoinBuyButton({ cost, canAfford, onBuy }: { cost: number; canAfford: boolean; onBuy: () => void }) {
  return (
    <motion.button
      onClick={onBuy}
      disabled={!canAfford}
      whileHover={canAfford ? { y: -2 } : undefined}
      whileTap={canAfford ? { y: 2, scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: 'var(--neo-white)',
        border: 'var(--neo-border)',
        color: canAfford ? 'var(--neo-black)' : 'var(--text-subtle)',
        boxShadow: canAfford ? 'var(--neo-shadow-sm)' : 'none',
      }}
    >
      {canAfford
        ? <><Coins className="w-3.5 h-3.5" style={{ color: 'var(--neo-accent)' }} /><span>{cost.toLocaleString()}</span></>
        : <><Lock className="w-3.5 h-3.5" /><span>Need {cost.toLocaleString()}</span></>}
    </motion.button>
  );
}

// ── Chest card ────────────────────────────────────────────────────────────────
const CHEST_COLORS: Record<string, { bg: string; border: string; shadow: string }> = {
  common:  { bg: 'var(--card-bg-amber)',  border: '#111111',           shadow: 'var(--neo-shadow)'              },
  rare:    { bg: '#EFF6FF',               border: '#7ab0d8',           shadow: '4px 4px 0 #7ab0d8'              },
  epic:    { bg: 'var(--card-bg-purple)', border: 'var(--neo-purple)', shadow: '4px 4px 0 var(--neo-purple)'    },
  premium: { bg: '#F3E8FF',               border: '#9333ea',           shadow: '4px 4px 0 #9333ea'              },
  supreme: { bg: '#FEE2E2',               border: 'var(--neo-red)',    shadow: '4px 4px 0 var(--neo-red)'       },
};

interface ChestCardProps {
  def: ChestDef;
  keyQty: number;
  fitCoins: number;
  emeralds: number;
  index: number;
  onOpen: () => void;
}

function ChestCard({ def, keyQty, fitCoins, emeralds, index, onOpen }: ChestCardProps) {
  const colors = CHEST_COLORS[def.rarity];
  const canAffordCurrency = def.currency === 'fitCoins' ? fitCoins >= def.cost : emeralds >= def.cost;
  const hasKey = keyQty > 0;
  const keyDef = KEY_DEFS.find(k => k.id === def.keyId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="neo-card flex flex-col hover:scale-[1.01] transition-transform duration-150"
      style={{ borderRadius: 0, background: colors.bg, border: `3px solid ${colors.border}`, boxShadow: colors.shadow }}
    >
      {/* Chest image */}
      <div style={{ borderBottom: `2px solid ${colors.border}`, background: 'rgba(255,255,255,0.35)' }}>
        <div className="aspect-[4/3] flex items-center justify-center relative p-4">
          <div className="relative w-28 h-28">
            <Image src={def.img} alt={def.name} fill className="object-contain" unoptimized />
          </div>
          {hasKey && (
            <div className="absolute top-2 right-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest"
              style={{ background: colors.border === '#111111' ? '#111' : colors.border, border: '2px solid #000', color: '#fff' }}>
              Key ×{keyQty}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="font-display text-xl font-bold text-app mb-4">{def.name}</div>

        {/* Currency price row */}
        <div className="flex items-center gap-2 mb-2">
          {def.currency === 'fitCoins'
            ? <Coins className="w-4 h-4 shrink-0" style={{ color: 'var(--neo-accent)' }} />
            : <Gem className="w-4 h-4 shrink-0" style={{ color: 'var(--neo-red)' }} />}
          <span className="text-base font-black tabular-nums text-app">{def.cost.toLocaleString()}</span>
          <span className="text-xs font-bold text-muted">{def.currency === 'fitCoins' ? 'FitCoins' : 'Emeralds'}</span>
        </div>

        {/* Key alternative row */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-bold text-muted">or</span>
          {keyDef && (
            <div className="relative w-5 h-5 shrink-0">
              <Image src={keyDef.img} alt={keyDef.name} fill className="object-contain" unoptimized />
            </div>
          )}
          <span className="text-xs font-bold text-app">{keyDef?.name}</span>
          <span
            className="text-xs font-black tabular-nums ml-auto"
            style={{ color: hasKey ? colors.border : '#aaa' }}
          >
            ×{keyQty} owned
          </span>
        </div>

        <div className="mt-auto">
          {hasKey ? (
            <motion.button
              onClick={onOpen}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ background: 'var(--neo-black)', border: '3px solid #000', boxShadow: '3px 3px 0 #555', color: '#fff' }}
            >
              Open with Key
            </motion.button>
          ) : canAffordCurrency ? (
            <motion.button
              onClick={onOpen}
              whileHover={{ y: -2 }}
              whileTap={{ y: 2, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              style={{
                background: def.currency === 'fitCoins' ? 'var(--neo-white)' : 'var(--neo-red)',
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow-sm)',
                color: def.currency === 'fitCoins' ? 'var(--neo-black)' : '#fff',
              }}
            >
              {def.currency === 'fitCoins'
                ? <><Coins className="w-3.5 h-3.5" style={{ color: 'var(--neo-accent)' }} /><span>Open · {def.cost.toLocaleString()}</span></>
                : <><Gem className="w-3.5 h-3.5" /><span>Open · {def.cost}</span></>}
            </motion.button>
          ) : (
            <div
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              style={{ background: '#f5f5f5', border: '3px solid #ccc', color: '#aaa' }}
            >
              <Lock className="w-3.5 h-3.5" /> Can&apos;t Afford
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
