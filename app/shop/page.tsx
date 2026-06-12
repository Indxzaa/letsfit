'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Check, Lock } from 'lucide-react';
import {
  loadProgress,
  purchaseItem,
  equipItem,
  subscribeToProgress,
  type Progress,
} from '@/lib/progress';
import { SHOP_ITEMS, FREE_DEFAULTS, DEFAULT_EQUIPPED } from '@/lib/shop';
import Navbar from '@/components/Navbar';

const TABS: { id: 'theme' | 'avatar' | 'border' | 'badge'; label: string }[] = [
  { id: 'theme', label: 'Themes' },
  { id: 'avatar', label: 'Avatars' },
  { id: 'border', label: 'Borders' },
  { id: 'badge', label: 'Badges' },
];

export default function ShopPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [tab, setTab] = useState<'theme' | 'avatar' | 'border' | 'badge'>('theme');
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

  if (!progress) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl accent-bg animate-pulse" />
      </div>
    );
  }

  const allUnlocked = new Set([...FREE_DEFAULTS, ...progress.unlockedItems]);
  const equipped = { ...DEFAULT_EQUIPPED, ...progress.equippedItems };

  const handlePurchase = (id: string, cost: number) => {
    const result = purchaseItem(progress, id, cost);
    if (result.reason === 'insufficient') { showFeedback('err', 'Not enough FitCoins.'); return; }
    if (result.reason === 'owned') { showFeedback('err', 'You already own this item.'); return; }
    setProgress(result.progress);
    showFeedback('ok', 'Item unlocked!');
  };

  const handleEquip = (slot: string, id: string) => {
    const updated = equipItem(progress, slot, id);
    setProgress(updated);
    showFeedback('ok', 'Equipped.');
  };

  const items = SHOP_ITEMS.filter((i) => i.type === tab);

  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full accent-pill text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Shop
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-app leading-tight">
              Customize your profile.
            </h1>
            <p className="text-sm text-muted mt-2 max-w-lg">
              Spend FitCoins on cosmetic upgrades. Earned items stay unlocked permanently.
            </p>
          </div>
          <div className="clay-sm px-5 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl accent-bg flex items-center justify-center">
              <Coins className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-app tabular-nums leading-none">
                {progress.fitCoins.toLocaleString()}
              </div>
              <div className="text-xs text-subtle">FitCoins</div>
            </div>
          </div>
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3.5 rounded-2xl text-sm font-medium ${
              feedback.kind === 'ok'
                ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-app'
                : 'bg-red-500/10 border border-red-500/20 text-red-500'
            }`}
          >
            {feedback.msg}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 clay-sm rounded-2xl mb-6 w-full overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                tab === t.id
                  ? 'accent-bg text-white shadow-sm'
                  : 'text-muted hover:text-app hover:bg-[var(--surface-hover)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const isUnlocked = allUnlocked.has(item.id);
            const isEquipped = equipped[item.type] === item.id;
            const canAfford = progress.fitCoins >= item.cost;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className={`clay-sm p-5 transition-all duration-200 ${
                  isEquipped
                    ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5 scale-[1.01]'
                    : 'hover:scale-[1.01]'
                }`}
              >
                <ItemPreview item={item} />

                <div className="mt-4">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="min-w-0">
                      <div className="font-display text-xl font-bold text-app truncate">{item.name}</div>
                      <div className="text-xs text-subtle">{item.description}</div>
                    </div>
                    {isEquipped && (
                      <span className="text-xs accent-text font-semibold shrink-0 px-2 py-1 rounded-lg bg-[var(--accent)]/12">
                        Active
                      </span>
                    )}
                  </div>

                  {isUnlocked ? (
                    isEquipped ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl surface text-xs text-subtle font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Equipped
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEquip(item.type, item.id)}
                        className="w-full py-2.5 rounded-xl accent-bg text-white text-xs font-semibold cursor-pointer transition-opacity hover:opacity-90"
                      >
                        Equip
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handlePurchase(item.id, item.cost)}
                      disabled={!canAfford}
                      className="w-full py-2.5 rounded-xl surface surface-hover text-app text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {canAfford ? (
                        <>
                          <Coins className="w-3.5 h-3.5 accent-text" />
                          <span>{item.cost}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Need {item.cost}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ItemPreview({ item }: { item: { type: string; value: string; name: string } }) {
  if (item.type === 'theme') {
    const colors: Record<string, string> = {
      emerald: '#22c55e', mint: '#34d399', forest: '#15803d',
      sky: '#3b82f6', amber: '#f59e0b', rose: '#f43f5e',
    };
    const color = colors[item.value] ?? '#22c55e';
    return (
      <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-app flex flex-col">
        <div className="flex-1 p-4" style={{ background: 'var(--surface-solid)' }}>
          <div className="h-2 w-10 rounded-full mb-2" style={{ background: color }} />
          <div className="h-1.5 w-16 rounded-full bg-[var(--border)]" />
          <div className="h-1.5 w-12 rounded-full bg-[var(--border)] mt-1.5" />
          <div className="mt-3 h-7 w-14 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ background: color }}>
            {item.name}
          </div>
        </div>
        <div className="h-2" style={{ background: color }} />
      </div>
    );
  }

  if (item.type === 'avatar') {
    return (
      <div className="aspect-[4/3] rounded-2xl border border-app flex items-center justify-center bg-[var(--surface-solid)]">
        <div className="text-6xl">{item.value || '🙂'}</div>
      </div>
    );
  }

  if (item.type === 'border') {
    const isGradient = item.value === 'gradient';
    const ringClass = item.value === 'soft' ? 'ring-2 ring-[var(--accent)]/30' : item.value === 'strong' ? 'ring-4 ring-[var(--accent)]/60' : '';
    return (
      <div className="aspect-[4/3] rounded-2xl border border-app flex items-center justify-center bg-[var(--surface-solid)]">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-[var(--accent)]/15 ${ringClass}`}
          style={isGradient ? { boxShadow: '0 0 0 4px var(--accent), 0 0 0 8px var(--accent-soft)' } : undefined}
        >
          🙂
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] rounded-2xl border border-app flex items-center justify-center bg-[var(--surface-solid)]">
      {item.value ? (
        <div className="px-4 py-1.5 rounded-full text-sm font-bold text-white accent-bg">{item.value}</div>
      ) : (
        <div className="text-xs text-subtle">No badge</div>
      )}
    </div>
  );
}
