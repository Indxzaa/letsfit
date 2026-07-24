'use client';

const STORAGE_KEY = 'letsfit:progress:v3';
const PROGRESS_EVENT = 'letsfit:progress:changed';

export type ActiveBoost = {
  id: string;
  usesLeft: number;
};

export type DailyMissionStatus = {
  date: string;
  completed: string[];
  questProgress: Record<string, number>;
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  type: 'avatar' | 'border' | 'badge' | 'title' | 'aura' | 'emoji' | 'frame';
  cost: number;
  value: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'world' | 'premium' | 'supreme' | 'chest-exclusive';
  currency?: 'fragments' | 'emeralds'; // if absent, cost is in fitCoins
  requirement?: string; // boss ID that must be defeated to unlock
};

export type Progress = {
  xp: number;
  fitCoins: number;
  emojiFragments: number;
  emeralds: number;
  totalReps: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  unlockedAchievements: string[];
  missions: DailyMissionStatus;
  unlockedItems: string[];
  equippedItems: Record<string, string>;
  todayReps: number;
  todayCalories: number;
  todaySessions: number;
  todayDate: string;
  rewardedStreakMilestones: number[];
  usernameChangeCount: number;
  bossesDefeated: string[];
  stagesCompleted: string[];
  loginStreak: number;
  highestLoginStreak: number;
  lastLoginDate: string;
  calendarClaimedDays: number[];
  calendarMonth: string;
  calendarLastClaimDate: string;
  loginHistory: Record<string, number[]>; // YYYY-MM -> claimed day numbers
  hasAvatar?: boolean; // true once the user has uploaded a profile picture
  inventory: Record<string, number>; // booster itemId → quantity
  activeBoosts: ActiveBoost[];
};

const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  fitCoins: 0,
  emojiFragments: 0,
  emeralds: 0,
  totalReps: 0,
  totalSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  unlockedAchievements: [],
  missions: { date: '', completed: [], questProgress: {} },
  unlockedItems: [],
  equippedItems: {},
  todayReps: 0,
  todayCalories: 0,
  todaySessions: 0,
  todayDate: '',
  rewardedStreakMilestones: [],
  usernameChangeCount: 0,
  bossesDefeated: [],
  stagesCompleted: [],
  loginStreak: 0,
  highestLoginStreak: 0,
  lastLoginDate: '',
  calendarClaimedDays: [],
  calendarMonth: '',
  calendarLastClaimDate: '',
  loginHistory: {},
  inventory: {},
  activeBoosts: [],
};

// ---- Reward economy (rebalanced) ----
// Base XP: 5 per rep, 15 per completed session
// Coins: 1 per 4 reps + 5 per session, scaled lightly with target completion
export const XP_PER_REP = 5;
export const XP_PER_SESSION = 15;
export const COINS_BASE_PER_SESSION = 5;
export const COINS_PER_4_REPS = 1;
export const MAX_FIT_COINS = 10000;
export const MAX_LEVEL = 100;

// Quest rewards (moderate)
export const QUEST_REWARD_XP = 30;
export const QUEST_REWARD_COINS = 15;

// Streak milestone bonuses
export const STREAK_MILESTONES: { day: number; coins: number; xp: number }[] = [
  { day: 3, coins: 25, xp: 50 },
  { day: 7, coins: 75, xp: 150 },
  { day: 14, coins: 150, xp: 300 },
  { day: 30, coins: 400, xp: 700 },
];

// Booster uses per activation
export const BOOSTER_USES: Record<string, number> = {
  coin_boost:     5,
  xp_boost:       3,
  fragment_boost: 3,
  emerald_boost:  1,
  lucky_charm:    1,
  // streak_shield is intentionally absent: it auto-activates in processLogin, never manually
};

// Calories per rep (or per second for plank)
export const CALORIES_PER_REP: Record<string, number> = {
  squat: 0.32,
  pushup: 0.29,
  pullup: 0.5,
  'jumping-jack': 0.2,
  plank: 0,
};
export const PLANK_CAL_PER_SEC = 0.08;

export function levelFromXp(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.min(level, MAX_LEVEL)) - 1;
  return l * l * 50;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) {
    const maxXp = xpForLevel(MAX_LEVEL);
    return { level: MAX_LEVEL, currentLevelXp: maxXp, nextLevelXp: maxXp, intoLevel: 0, span: 1, pct: 1 };
  }
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = nextLevelXp - currentLevelXp;
  const into = Math.max(0, xp - currentLevelXp);
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    intoLevel: into,
    span,
    pct: span > 0 ? Math.min(1, into / span) : 0,
  };
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / 86400000);
}

function emitChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

export function subscribeToProgress(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(PROGRESS_EVENT, handler);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) handler();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PROGRESS_EVENT, handler);
    window.removeEventListener('storage', onStorage);
  };
}

export function loadProgress(): Progress {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const p: Progress = { ...DEFAULT_PROGRESS, ...parsed };
    const today = todayKey();
    if (!p.missions || p.missions.date !== today) {
      p.missions = { date: today, completed: [], questProgress: {} };
    }
    if (p.todayDate !== today) {
      p.todayReps = 0;
      p.todayCalories = 0;
      p.todaySessions = 0;
      p.todayDate = today;
    }
    // Migrate: seed loginHistory from old single-month storage
    if (!p.loginHistory) p.loginHistory = {};
    if (p.calendarMonth && p.calendarClaimedDays.length > 0 && !p.loginHistory[p.calendarMonth]) {
      p.loginHistory = { ...p.loginHistory, [p.calendarMonth]: [...p.calendarClaimedDays] };
    }
    return p;
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(p: Progress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  emitChange();
}

export function clearLocalProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  emitChange();
}

export function resetProgress(): Progress {
  const fresh = { ...DEFAULT_PROGRESS };
  saveProgress(fresh);
  return fresh;
}

export function purchaseItem(
  current: Progress,
  itemId: string,
  cost: number
): { progress: Progress; reason: 'ok' | 'owned' | 'insufficient' } {
  if (current.unlockedItems.includes(itemId)) {
    return { progress: current, reason: 'owned' };
  }
  if (current.fitCoins < cost) {
    return { progress: current, reason: 'insufficient' };
  }
  const updated: Progress = {
    ...current,
    fitCoins: current.fitCoins - cost,
    unlockedItems: [...current.unlockedItems, itemId],
  };
  saveProgress(updated);
  return { progress: updated, reason: 'ok' };
}

export function purchaseWithFragments(
  current: Progress,
  itemId: string,
  cost: number
): { progress: Progress; reason: 'ok' | 'owned' | 'insufficient' } {
  if (current.unlockedItems.includes(itemId)) {
    return { progress: current, reason: 'owned' };
  }
  if ((current.emojiFragments ?? 0) < cost) {
    return { progress: current, reason: 'insufficient' };
  }
  const updated: Progress = {
    ...current,
    emojiFragments: (current.emojiFragments ?? 0) - cost,
    unlockedItems: [...current.unlockedItems, itemId],
  };
  saveProgress(updated);
  return { progress: updated, reason: 'ok' };
}

export function purchaseWithEmeralds(
  current: Progress,
  itemId: string,
  cost: number
): { progress: Progress; reason: 'ok' | 'owned' | 'insufficient' } {
  if (current.unlockedItems.includes(itemId)) {
    return { progress: current, reason: 'owned' };
  }
  if ((current.emeralds ?? 0) < cost) {
    return { progress: current, reason: 'insufficient' };
  }
  const updated: Progress = {
    ...current,
    emeralds: (current.emeralds ?? 0) - cost,
    unlockedItems: [...current.unlockedItems, itemId],
  };
  saveProgress(updated);
  return { progress: updated, reason: 'ok' };
}

export function equipItem(current: Progress, slot: string, itemId: string): Progress {
  const updated: Progress = {
    ...current,
    equippedItems: { ...current.equippedItems, [slot]: itemId },
  };
  saveProgress(updated);
  return updated;
}

export function addToInventory(p: Progress, itemId: string, qty = 1): Progress {
  const updated: Progress = {
    ...p,
    inventory: { ...p.inventory, [itemId]: (p.inventory[itemId] ?? 0) + qty },
  };
  saveProgress(updated);
  return updated;
}

export function activateBooster(p: Progress, id: string): Progress | null {
  const qty = p.inventory?.[id] ?? 0;
  if (qty <= 0) return null;
  const uses = BOOSTER_USES[id];
  if (!uses) return null;
  const existing = (p.activeBoosts ?? []).find(b => b.id === id);
  const newActiveBoosts: ActiveBoost[] = existing
    ? (p.activeBoosts ?? []).map(b => b.id === id ? { ...b, usesLeft: b.usesLeft + uses } : b)
    : [...(p.activeBoosts ?? []), { id, usesLeft: uses }];
  const updated: Progress = {
    ...p,
    inventory: { ...p.inventory, [id]: qty - 1 },
    activeBoosts: newActiveBoosts,
  };
  saveProgress(updated);
  return updated;
}

export type SessionResult = {
  before: Progress;
  after: Progress;
  xpGained: number;
  coinsGained: number;
  caloriesBurned: number;
  leveledUp: boolean;
  newAchievements: string[];
  completedQuests: string[];
  streakBonus: { day: number; coins: number; xp: number } | null;
  formAccuracyTooLow?: boolean;
  averageFormAccuracy?: number;
};

function streakBonusFor(prev: number, next: number): { day: number; coins: number; xp: number } | null {
  for (const m of STREAK_MILESTONES) {
    if (prev < m.day && next >= m.day) return m;
  }
  return null;
}

export function recordSession(
  current: Progress,
  reps: number,
  exerciseSlug: string,
  durationSeconds: number,
  achievementChecker: (p: Progress) => string[],
  questChecker: (p: Progress) => string[],
  averageFormAccuracy?: number | null,
  isTimed?: boolean
): SessionResult {
  const before = { ...current };
  const today = todayKey();

  const isPlank = exerciseSlug === 'plank';
  const effectiveReps = reps; // for plank, this is seconds held
  const repsCounted = isPlank ? 0 : reps;

  // Form accuracy validation for timer-based exercises
  const MIN_FORM_ACCURACY = 60;
  const formAccuracyTooLow = isTimed && averageFormAccuracy != null && averageFormAccuracy < MIN_FORM_ACCURACY;

  // Streak update
  let nextStreak = current.currentStreak;
  if (current.lastSessionDate === null) {
    nextStreak = 1;
  } else if (current.lastSessionDate === today) {
    nextStreak = Math.max(1, current.currentStreak);
  } else {
    const gap = daysBetween(current.lastSessionDate, today);
    nextStreak = gap === 1 ? current.currentStreak + 1 : 1;
  }

  // Calories
  const caloriesBurned = isPlank
    ? Math.round(durationSeconds * PLANK_CAL_PER_SEC)
    : Math.round(repsCounted * (CALORIES_PER_REP[exerciseSlug] ?? 0.3));

  // Base rewards (rebalanced)
  let xpGained = 0;
  let coinsGained = 0;

  // Only award rewards if form accuracy is sufficient (or not a timed exercise)
  if (effectiveReps > 0 && !formAccuracyTooLow) {
    if (isPlank) {
      // 1 XP per 2 seconds + session bonus
      xpGained = Math.floor(durationSeconds / 2) + XP_PER_SESSION;
      coinsGained = Math.floor(durationSeconds / 20) + COINS_BASE_PER_SESSION;
    } else {
      xpGained = repsCounted * XP_PER_REP + XP_PER_SESSION;
      coinsGained = Math.floor(repsCounted / 4) * COINS_PER_4_REPS + COINS_BASE_PER_SESSION;
    }
  }

  // Apply active workout boosts (only if rewards are being granted)
  const sessionBoostIds = ['xp_boost', 'coin_boost'];
  const currentBoosts = current.activeBoosts ?? [];
  if (effectiveReps > 0 && !formAccuracyTooLow) {
    if (currentBoosts.some(b => b.id === 'xp_boost' && b.usesLeft > 0)) xpGained = xpGained * 2;
    if (currentBoosts.some(b => b.id === 'coin_boost' && b.usesLeft > 0)) coinsGained = Math.round(coinsGained * 1.5);
  }
  const updatedBoosts = effectiveReps > 0 && !formAccuracyTooLow
    ? currentBoosts
        .map(b => sessionBoostIds.includes(b.id) ? { ...b, usesLeft: b.usesLeft - 1 } : b)
        .filter(b => b.usesLeft > 0)
    : currentBoosts;

  // Update quest progress (only if form accuracy is sufficient)
  const questProgress = { ...(current.missions.questProgress ?? {}) };
  if (!formAccuracyTooLow) {
    questProgress['reps'] = (questProgress['reps'] ?? 0) + repsCounted;
    questProgress['calories'] = (questProgress['calories'] ?? 0) + caloriesBurned;
    questProgress['sessions'] = (questProgress['sessions'] ?? 0) + (effectiveReps > 0 ? 1 : 0);
  }

  const after: Progress = {
    ...current,
    xp: current.xp + xpGained,
    fitCoins: Math.min(MAX_FIT_COINS, current.fitCoins + coinsGained),
    totalReps: formAccuracyTooLow ? current.totalReps : current.totalReps + repsCounted,
    totalSessions: formAccuracyTooLow ? current.totalSessions : current.totalSessions + (effectiveReps > 0 ? 1 : 0),
    currentStreak: nextStreak,
    longestStreak: Math.max(current.longestStreak, nextStreak),
    lastSessionDate: (effectiveReps > 0 && !formAccuracyTooLow) ? today : current.lastSessionDate,
    todayReps: formAccuracyTooLow ? current.todayReps : current.todayReps + repsCounted,
    todayCalories: formAccuracyTooLow ? current.todayCalories : current.todayCalories + caloriesBurned,
    todaySessions: formAccuracyTooLow ? current.todaySessions : current.todaySessions + (effectiveReps > 0 ? 1 : 0),
    todayDate: today,
    missions: { ...current.missions, questProgress },
    activeBoosts: updatedBoosts,
  };

  // Streak milestone bonus (only awarded once per milestone, and only if form is good)
  let streakBonus: SessionResult['streakBonus'] = null;
  if (effectiveReps > 0 && !formAccuracyTooLow) {
    const candidate = streakBonusFor(current.currentStreak, nextStreak);
    if (candidate && !current.rewardedStreakMilestones.includes(candidate.day)) {
      streakBonus = candidate;
      after.fitCoins = Math.min(MAX_FIT_COINS, after.fitCoins + candidate.coins);
      after.xp += candidate.xp;
      after.rewardedStreakMilestones = [
        ...current.rewardedStreakMilestones,
        candidate.day,
      ];
    }
  }

  // Achievements (checked after stats updated, only if form is good)
  const newlyUnlocked = formAccuracyTooLow ? [] : achievementChecker(after).filter(
    (id) => !current.unlockedAchievements.includes(id)
  );
  after.unlockedAchievements = [...current.unlockedAchievements, ...newlyUnlocked];

  // Quest completions — only fire each quest once per day (only if form is good)
  const newlyCompletedQuests = formAccuracyTooLow ? [] : questChecker(after).filter(
    (id) => !current.missions.completed.includes(id)
  );
  if (newlyCompletedQuests.length > 0) {
    after.fitCoins = Math.min(MAX_FIT_COINS, after.fitCoins + newlyCompletedQuests.length * QUEST_REWARD_COINS);
    after.xp += newlyCompletedQuests.length * QUEST_REWARD_XP;
    after.missions = {
      ...after.missions,
      completed: [...after.missions.completed, ...newlyCompletedQuests],
    };
  }

  saveProgress(after);

  return {
    before,
    after,
    xpGained:
      xpGained +
      newlyCompletedQuests.length * QUEST_REWARD_XP +
      (streakBonus?.xp ?? 0),
    coinsGained:
      coinsGained +
      newlyCompletedQuests.length * QUEST_REWARD_COINS +
      (streakBonus?.coins ?? 0),
    caloriesBurned,
    leveledUp: levelFromXp(after.xp) > levelFromXp(before.xp),
    newAchievements: newlyUnlocked,
    completedQuests: newlyCompletedQuests,
    streakBonus,
    formAccuracyTooLow,
    averageFormAccuracy: averageFormAccuracy ?? undefined,
  };
}

export type BonusReward = {
  type: 'emeralds' | 'fragments' | 'key';
  itemId?: string;
  amount: number;
  label: string;
};

export type BossResult = {
  before: Progress;
  after: Progress;
  xpGained: number;
  coinsGained: number;
  newAchievements: string[];
  leveledUp: boolean;
  bonusRewards: BonusReward[];
};

// Per-world key drop tables — single mutually-exclusive roll per boss kill.
// Remaining probability (after all tiers) is "Nothing".
// | World            | Common | Rare | Epic | Premium | Supreme |
// |------------------|--------|------|------|---------|---------|
// | 1 Forest         | 40%    | 25%  | 10%  | 1%      | 0.1%    |
// | 2 Winter         | 50%    | 20%  | 12%  | 1%      | 0.1%    |
// | 3 Witch          | 30%    | 25%  | 15%  | 1%      | 0.1%    |
// | 4 Elven Sanctuary| 20%    | 30%  | 20%  | 2%      | 0.2%    |
type KeyDropEntry = { itemId: string; label: string; chance: number };
const KEY_DROP_TABLES: Record<number, KeyDropEntry[]> = {
  1: [
    { itemId: 'common_key',  label: 'Common Key',  chance: 0.40 },
    { itemId: 'rare_key',    label: 'Rare Key',    chance: 0.25 },
    { itemId: 'epic_key',    label: 'Epic Key',    chance: 0.10 },
    { itemId: 'premium_key', label: 'Premium Key', chance: 0.01 },
    { itemId: 'supreme_key', label: 'Supreme Key', chance: 0.001 },
  ],
  2: [
    { itemId: 'common_key',  label: 'Common Key',  chance: 0.50 },
    { itemId: 'rare_key',    label: 'Rare Key',    chance: 0.20 },
    { itemId: 'epic_key',    label: 'Epic Key',    chance: 0.12 },
    { itemId: 'premium_key', label: 'Premium Key', chance: 0.01 },
    { itemId: 'supreme_key', label: 'Supreme Key', chance: 0.001 },
  ],
  3: [
    { itemId: 'common_key',  label: 'Common Key',  chance: 0.30 },
    { itemId: 'rare_key',    label: 'Rare Key',    chance: 0.25 },
    { itemId: 'epic_key',    label: 'Epic Key',    chance: 0.15 },
    { itemId: 'premium_key', label: 'Premium Key', chance: 0.01 },
    { itemId: 'supreme_key', label: 'Supreme Key', chance: 0.001 },
  ],
  4: [
    { itemId: 'common_key',  label: 'Common Key',  chance: 0.20 },
    { itemId: 'rare_key',    label: 'Rare Key',    chance: 0.30 },
    { itemId: 'epic_key',    label: 'Epic Key',    chance: 0.20 },
    { itemId: 'premium_key', label: 'Premium Key', chance: 0.02 },
    { itemId: 'supreme_key', label: 'Supreme Key', chance: 0.002 },
  ],
};

function rollBossKeyDrop(world: number): BonusReward | null {
  const table = KEY_DROP_TABLES[world];
  if (!table) return null;
  const roll = Math.random();
  let cumulative = 0;
  for (const entry of table) {
    cumulative += entry.chance;
    if (roll < cumulative) {
      return { type: 'key', itemId: entry.itemId, amount: 1, label: entry.label };
    }
  }
  return null; // remaining probability: nothing
}

function generateBossBonus(world: number): BonusReward[] {
  const bonuses: BonusReward[] = [];
  const fragMult    = world === 2 ? 2 : 1; // Winter: ×2 fragments
  const emeraldMult = world === 3 ? 2 : 1; // Witch: ×2 emeralds

  if (Math.random() < 0.40) {
    const amt = Math.round(2 * emeraldMult);
    bonuses.push({ type: 'emeralds', amount: amt, label: `+${amt} Emeralds` });
  }
  if (Math.random() < 0.50) {
    const amt = Math.round(15 * fragMult);
    bonuses.push({ type: 'fragments', amount: amt, label: `+${amt} Fragments` });
  }

  const keyDrop = rollBossKeyDrop(world);
  if (keyDrop) bonuses.push(keyDrop);

  return bonuses;
}

export function processLogin(progress: Progress): { updated: Progress; isNew: boolean; shieldUsed: boolean } {
  const today = todayKey();
  if (progress.lastLoginDate === today) return { updated: progress, isNew: false, shieldUsed: false };

  let updated: Progress = { ...progress, lastLoginDate: today };
  let shieldUsed = false;

  // Auto-consume streak shield if exactly one calendar day was missed
  const lastClaim = progress.calendarLastClaimDate;
  if (lastClaim && (progress.inventory?.['streak_shield'] ?? 0) > 0) {
    const missed = daysBetween(lastClaim, today);
    if (missed === 2) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      updated = {
        ...updated,
        inventory: { ...updated.inventory, streak_shield: (updated.inventory?.['streak_shield'] ?? 1) - 1 },
        calendarLastClaimDate: yesterday,
      };
      shieldUsed = true;
    }
  }

  return { updated, isNew: true, shieldUsed };
}

export function claimCalendarDay(
  progress: Progress,
  day: number
): { updated: Progress; rewardIndex: number } | null {
  const today = todayKey();
  if (day !== new Date().getDate()) return null;
  if (progress.lastLoginDate !== today) return null;

  const currentMonth = today.slice(0, 7);
  const claimedDays = progress.calendarMonth === currentMonth ? [...progress.calendarClaimedDays] : [];
  if (claimedDays.includes(day)) return null;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = progress.calendarLastClaimDate === yesterday ? progress.loginStreak + 1 : 1;

  const updatedHistory = {
    ...(progress.loginHistory ?? {}),
    [currentMonth]: [...claimedDays, day],
  };
  const updated: Progress = {
    ...progress,
    calendarClaimedDays: [...claimedDays, day],
    calendarMonth: currentMonth,
    calendarLastClaimDate: today,
    loginStreak: newStreak,
    highestLoginStreak: Math.max(progress.highestLoginStreak ?? 0, newStreak),
    loginHistory: updatedHistory,
  };
  return { updated, rewardIndex: (day - 1) % 7 };
}

export function recordBossDefeat(
  current: Progress,
  bossId: string,
  xp: number,
  coins: number,
  achievementChecker: (p: Progress) => string[],
  world = 0
): BossResult {
  const before = { ...current };
  if (current.bossesDefeated.includes(bossId)) {
    return { before, after: current, xpGained: 0, coinsGained: 0, newAchievements: [], leveledUp: false, bonusRewards: [] };
  }
  // Forest (world 1): +50% FitCoins
  const coinBonus = world === 1 ? Math.round(coins * 0.5) : 0;
  const totalCoins = coins + coinBonus;
  const bonusRewards = generateBossBonus(world);

  let after: Progress = {
    ...current,
    xp: current.xp + xp,
    fitCoins: Math.min(MAX_FIT_COINS, current.fitCoins + totalCoins),
    bossesDefeated: [...current.bossesDefeated, bossId],
  };

  for (const bonus of bonusRewards) {
    if (bonus.type === 'emeralds') {
      after = { ...after, emeralds: (after.emeralds ?? 0) + bonus.amount };
    } else if (bonus.type === 'fragments') {
      after = { ...after, emojiFragments: (after.emojiFragments ?? 0) + bonus.amount };
    } else if (bonus.type === 'key' && bonus.itemId) {
      after = addToInventory(after, bonus.itemId, bonus.amount);
    }
  }

  const newlyUnlocked = achievementChecker(after).filter((id) => !current.unlockedAchievements.includes(id));
  after.unlockedAchievements = [...current.unlockedAchievements, ...newlyUnlocked];
  saveProgress(after);
  return {
    before,
    after,
    xpGained: xp,
    coinsGained: totalCoins,
    newAchievements: newlyUnlocked,
    leveledUp: levelFromXp(after.xp) > levelFromXp(before.xp),
    bonusRewards,
  };
}
