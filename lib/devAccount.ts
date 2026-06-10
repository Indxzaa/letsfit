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
    fitCoins: 99999999,
    totalSessions: 999,
    totalReps: 9999,
    currentStreak: 365,
    longestStreak: 365,
    unlockedAchievements: allAchievementIds,
    unlockedItems: allItemIds,
  };
}
