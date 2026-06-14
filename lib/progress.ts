'use client';

const STORAGE_KEY = 'letsfit:progress:v3';
const PROGRESS_EVENT = 'letsfit:progress:changed';

export type DailyMissionStatus = {
  date: string;
  completed: string[];
  questProgress: Record<string, number>;
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  type: 'theme' | 'avatar' | 'border' | 'badge' | 'title' | 'aura';
  cost: number;
  value: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'world';
  requirement?: string; // boss ID that must be defeated to unlock
};

export type Progress = {
  xp: number;
  fitCoins: number;
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
};

const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  fitCoins: 0,
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

export function equipItem(current: Progress, slot: string, itemId: string): Progress {
  const updated: Progress = {
    ...current,
    equippedItems: { ...current.equippedItems, [slot]: itemId },
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
  questChecker: (p: Progress) => string[]
): SessionResult {
  const before = { ...current };
  const today = todayKey();

  const isPlank = exerciseSlug === 'plank';
  const effectiveReps = reps; // for plank, this is seconds held
  const repsCounted = isPlank ? 0 : reps;

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
  if (effectiveReps > 0) {
    if (isPlank) {
      // 1 XP per 2 seconds + session bonus
      xpGained = Math.floor(durationSeconds / 2) + XP_PER_SESSION;
      coinsGained = Math.floor(durationSeconds / 20) + COINS_BASE_PER_SESSION;
    } else {
      xpGained = repsCounted * XP_PER_REP + XP_PER_SESSION;
      coinsGained = Math.floor(repsCounted / 4) * COINS_PER_4_REPS + COINS_BASE_PER_SESSION;
    }
  }

  // Update quest progress
  const questProgress = { ...(current.missions.questProgress ?? {}) };
  questProgress['reps'] = (questProgress['reps'] ?? 0) + repsCounted;
  questProgress['calories'] = (questProgress['calories'] ?? 0) + caloriesBurned;
  questProgress['sessions'] = (questProgress['sessions'] ?? 0) + (effectiveReps > 0 ? 1 : 0);

  const after: Progress = {
    ...current,
    xp: current.xp + xpGained,
    fitCoins: Math.min(MAX_FIT_COINS, current.fitCoins + coinsGained),
    totalReps: current.totalReps + repsCounted,
    totalSessions: current.totalSessions + (effectiveReps > 0 ? 1 : 0),
    currentStreak: nextStreak,
    longestStreak: Math.max(current.longestStreak, nextStreak),
    lastSessionDate: effectiveReps > 0 ? today : current.lastSessionDate,
    todayReps: current.todayReps + repsCounted,
    todayCalories: current.todayCalories + caloriesBurned,
    todaySessions: current.todaySessions + (effectiveReps > 0 ? 1 : 0),
    todayDate: today,
    missions: { ...current.missions, questProgress },
  };

  // Streak milestone bonus (only awarded once per milestone)
  let streakBonus: SessionResult['streakBonus'] = null;
  if (effectiveReps > 0) {
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

  // Achievements (checked after stats updated)
  const newlyUnlocked = achievementChecker(after).filter(
    (id) => !current.unlockedAchievements.includes(id)
  );
  after.unlockedAchievements = [...current.unlockedAchievements, ...newlyUnlocked];

  // Quest completions — only fire each quest once per day
  const newlyCompletedQuests = questChecker(after).filter(
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
  };
}

export type BossResult = {
  before: Progress;
  after: Progress;
  xpGained: number;
  coinsGained: number;
  newAchievements: string[];
  leveledUp: boolean;
};

export function recordBossDefeat(
  current: Progress,
  bossId: string,
  xp: number,
  coins: number,
  achievementChecker: (p: Progress) => string[]
): BossResult {
  const before = { ...current };
  if (current.bossesDefeated.includes(bossId)) {
    return { before, after: current, xpGained: 0, coinsGained: 0, newAchievements: [], leveledUp: false };
  }
  const after: Progress = {
    ...current,
    xp: current.xp + xp,
    fitCoins: Math.min(MAX_FIT_COINS, current.fitCoins + coins),
    bossesDefeated: [...current.bossesDefeated, bossId],
  };
  const newlyUnlocked = achievementChecker(after).filter((id) => !current.unlockedAchievements.includes(id));
  after.unlockedAchievements = [...current.unlockedAchievements, ...newlyUnlocked];
  saveProgress(after);
  return {
    before,
    after,
    xpGained: xp,
    coinsGained: coins,
    newAchievements: newlyUnlocked,
    leveledUp: levelFromXp(after.xp) > levelFromXp(before.xp),
  };
}
