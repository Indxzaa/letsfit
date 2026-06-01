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
        <div className="text-sm text-subtle">Loading…</div>
      </div>
    );
  }

  const allUnlocked = new Set([...FREE_DEFAULTS, ...progress.unlockedItems]);
  const equipped = { ...DEFAULT_EQUIPPED, ...progress.equippedItems };

  const handlePurchase = (id: string, cost: number) => {
    const result = purchaseItem(progress, id, cost);
    if (result.reason === 'insufficient') {
      showFeedback('err', 'Not enough FitCoins.');
      return;
    }
    if (result.reason === 'owned') {
      showFeedback('err', 'You already own this item.');
      return;
    }
    setProgress(result.progress);
    showFeedback('ok', 'Item unlocked.');
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-app transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="text-sm font-medium accent-text mb-1">Shop</div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-app">
              Customize your profile
            </h1>
            <p className="text-sm text-muted mt-1 max-w-lg">
              Spend FitCoins on cosmetic upgrades. Earned items stay unlocked permanently.
            </p>
          </div>
          <div className="surface rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-base">🪙</span>
            <span className="text-lg font-semibold text-app tabular-nums">
              {progress.fitCoins.toLocaleString()}
            </span>
            <span className="text-xs text-subtle">FitCoins</span>
          </div>
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-lg text-sm ${
              feedback.kind === 'ok'
                ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-app'
                : 'bg-red-500/10 border border-red-500/20 text-red-500'
            }`}
          >
            {feedback.msg}
          </motion.div>
        )}

        <div className="flex gap-1 p-1 surface rounded-xl mb-6 w-full overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-fit px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'accent-bg text-white'
                  : 'text-muted hover:text-app'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                className={`surface rounded-2xl p-5 ${
                  isEquipped ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5' : ''
                }`}
              >
                <ItemPreview item={item} />

                <div className="mt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-app truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-subtle">{item.description}</div>
                    </div>
                    {isEquipped && (
                      <span className="text-xs accent-text font-medium shrink-0">
                        Equipped
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    {isUnlocked ? (
                      isEquipped ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-lg surface text-xs text-subtle font-medium flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Active
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquip(item.type, item.id)}
                          className="w-full py-2 rounded-lg accent-bg text-white text-xs font-medium"
                        >
                          Equip
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handlePurchase(item.id, item.cost)}
                        disabled={!canAfford}
                        className="w-full py-2 rounded-lg surface surface-hover text-app text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
      emerald: '#22c55e',
      mint: '#34d399',
      forest: '#15803d',
      sky: '#3b82f6',
      amber: '#f59e0b',
      rose: '#f43f5e',
    };
    const color = colors[item.value] ?? '#22c55e';
    return (
      <div className="aspect-[4/3] rounded-xl overflow-hidden border border-app flex flex-col">
        <div className="flex-1 p-3" style={{ background: 'var(--surface-solid)' }}>
          <div className="h-2 w-12 rounded-full mb-2" style={{ background: color }} />
          <div className="h-1.5 w-20 rounded-full bg-[var(--border)]" />
          <div className="h-1.5 w-16 rounded-full bg-[var(--border)] mt-1.5" />
          <div className="mt-3 h-6 w-16 rounded-md flex items-center justify-center text-xs font-medium text-white" style={{ background: color }}>
            CTA
          </div>
        </div>
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider" style={{ background: color, color: '#fff' }}>
          {item.name}
        </div>
      </div>
    );
  }

  if (item.type === 'avatar') {
    return (
      <div className="aspect-[4/3] rounded-xl border border-app flex items-center justify-center bg-[var(--surface-solid)]">
        <div className="text-6xl">{item.value || '🙂'}</div>
      </div>
    );
  }

  if (item.type === 'border') {
    const styles: Record<string, string> = {
      none: '',
      soft: 'ring-2 ring-[var(--accent)]/30',
      strong: 'ring-4 ring-[var(--accent)]/60',
      gradient: 'ring-4 ring-transparent',
    };
    const ringStyle = styles[item.value] ?? '';
    const isGradient = item.value === 'gradient';
    return (
      <div className="aspect-[4/3] rounded-xl border border-app flex items-center justify-center bg-[var(--surface-solid)]">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-[var(--accent)]/15 ${ringStyle}`}
          style={
            isGradient
              ? {
                  boxShadow:
                    '0 0 0 4px var(--accent), 0 0 0 8px var(--accent-soft)',
                }
              : undefined
          }
        >
          🙂
        </div>
      </div>
    );
  }

  // badge
  return (
    <div className="aspect-[4/3] rounded-xl border border-app flex items-center justify-center bg-[var(--surface-solid)]">
      {item.value ? (
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold text-white accent-bg">
          {item.value}
        </div>
      ) : (
        <div className="text-xs text-subtle">No badge</div>
      )}
    </div>
  );
}
