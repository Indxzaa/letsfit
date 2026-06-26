import type { Progress } from './progress';

export type LoginReward = {
  day: number;
  icon: string;
  label: string;
  fitCoins?: number;
  xp?: number;
  itemId?: string;
};

export const LOGIN_REWARDS: LoginReward[] = [
  { day: 1, icon: '🪙', label: '100 FitCoins',        fitCoins: 100 },
  { day: 2, icon: '🪙', label: '150 FitCoins',        fitCoins: 150 },
  { day: 3, icon: '⚡', label: 'XP Boost (+200 XP)',  xp: 200 },
  { day: 4, icon: '💪', label: 'Flex Avatar',         itemId: 'avatar-flex' },
  { day: 5, icon: '🪙', label: '300 FitCoins',        fitCoins: 300 },
  { day: 6, icon: '✨', label: 'Neon Border',          itemId: 'border-neon' },
  { day: 7, icon: '🎨', label: 'Aqua Depths Theme',   itemId: 'theme-aqua-depths' },
];

export function applyLoginReward(progress: Progress, rewardDay: number): Progress {
  const reward = LOGIN_REWARDS[rewardDay - 1];
  if (!reward) return progress;
  let p = { ...progress };
  if (reward.fitCoins) p = { ...p, fitCoins: p.fitCoins + reward.fitCoins };
  if (reward.xp)       p = { ...p, xp: p.xp + reward.xp };
  if (reward.itemId && !p.unlockedItems.includes(reward.itemId)) {
    p = { ...p, unlockedItems: [...p.unlockedItems, reward.itemId] };
  }
  return p;
}
