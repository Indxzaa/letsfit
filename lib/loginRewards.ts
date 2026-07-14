import type { Progress } from './progress';
import { addToInventory } from './progress';

export type LoginReward = {
  day: number;
  type: 'coins' | 'xp' | 'fragments' | 'emeralds' | 'item' | 'key';
  label: string;
  fitCoins?: number;
  xp?: number;
  fragments?: number;
  emeralds?: number;
  itemId?: string;  // adds to unlockedItems
  keyId?: string;   // adds to inventory (common_key, rare_key, epic_key only — never premium/supreme)
};

// Only common_key, rare_key, epic_key are permitted here.
// premium_key and supreme_key are exclusively boss prestige drops.
export const LOGIN_REWARDS: LoginReward[] = [
  { day: 1, type: 'coins',     label: '100 FitCoins',  fitCoins: 100 },
  { day: 2, type: 'coins',     label: '150 FitCoins',  fitCoins: 150 },
  { day: 3, type: 'key',       label: 'Common Key',    keyId: 'common_key' },
  { day: 4, type: 'fragments', label: '10 Fragments',  fragments: 10 },
  { day: 5, type: 'key',       label: 'Rare Key',      keyId: 'rare_key' },
  { day: 6, type: 'fragments', label: '20 Fragments',  fragments: 20 },
  { day: 7, type: 'key',       label: 'Epic Key',      keyId: 'epic_key' },
];

export function applyLoginReward(progress: Progress, rewardDay: number): Progress {
  const reward = LOGIN_REWARDS[rewardDay - 1];
  if (!reward) return progress;
  let p = { ...progress };
  if (reward.fitCoins)  p = { ...p, fitCoins: p.fitCoins + reward.fitCoins };
  if (reward.xp)        p = { ...p, xp: p.xp + reward.xp };
  if (reward.fragments) p = { ...p, emojiFragments: (p.emojiFragments ?? 0) + reward.fragments };
  if (reward.emeralds)  p = { ...p, emeralds: (p.emeralds ?? 0) + reward.emeralds };
  if (reward.itemId && !p.unlockedItems.includes(reward.itemId)) {
    p = { ...p, unlockedItems: [...p.unlockedItems, reward.itemId] };
  }
  if (reward.keyId) {
    p = addToInventory(p, reward.keyId, 1);
  }
  return p;
}
