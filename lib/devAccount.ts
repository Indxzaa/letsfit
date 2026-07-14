import { SHOP_ITEMS } from './shop';
import { ACHIEVEMENTS } from './achievements';
import type { Progress } from './progress';

const DEV_EMAIL = 'indyy8262@gmail.com';

export function isDevEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase() === DEV_EMAIL;
}

export function applyDevAccount(p: Progress): Progress {
  const allItemIds = SHOP_ITEMS.map((i) => i.id);
  const allAchievementIds = ACHIEVEMENTS.map((a) => a.id);
  // Max level requires xp = 100^2 * 50 = 500000 (level 101)
  return {
    ...p,
    xp: 500000,
    fitCoins: 6767676767,
    totalSessions: 6767,
    totalReps: 6767,
    currentStreak: 67,
    longestStreak: 67,
    emeralds: 6767676767, 
    unlockedAchievements: allAchievementIds,
    unlockedItems: allItemIds,
  };
}
