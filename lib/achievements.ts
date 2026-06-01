import type { Progress } from './progress';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (p: Progress) => boolean;
};

export type DailyQuest = {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  metric: 'reps' | 'calories' | 'sessions';
  reward: { xp: number; coins: number };
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-rep', name: 'First step', description: 'Complete your first rep.', icon: '🌱', check: (p) => p.totalReps >= 1 },
  { id: 'ten-reps', name: 'Getting started', description: 'Complete 10 reps total.', icon: '✨', check: (p) => p.totalReps >= 10 },
  { id: 'fifty-reps', name: 'Half century', description: 'Complete 50 reps total.', icon: '🎯', check: (p) => p.totalReps >= 50 },
  { id: 'hundred-reps', name: 'Triple digits', description: 'Complete 100 reps total.', icon: '💯', check: (p) => p.totalReps >= 100 },
  { id: 'first-session', name: 'Showed up', description: 'Complete your first session.', icon: '🚀', check: (p) => p.totalSessions >= 1 },
  { id: 'three-day-streak', name: 'Three in a row', description: 'Train three days in a row.', icon: '🔥', check: (p) => p.currentStreak >= 3 || p.longestStreak >= 3 },
  { id: 'week-streak', name: 'Full week', description: 'Train seven days in a row.', icon: '📅', check: (p) => p.currentStreak >= 7 || p.longestStreak >= 7 },
  { id: 'level-five', name: 'Level 5', description: 'Reach level 5.', icon: '⭐', check: (p) => Math.floor(Math.sqrt(p.xp / 50)) + 1 >= 5 },
  { id: 'coin-collector', name: 'Coin collector', description: 'Earn 100 FitCoins.', icon: '🪙', check: (p) => p.fitCoins >= 100 },
  { id: 'five-sessions', name: 'Regular', description: 'Complete 5 sessions.', icon: '🏅', check: (p) => p.totalSessions >= 5 },
  { id: 'big-spender', name: 'Big spender', description: 'Unlock your first shop item.', icon: '🛍️', check: (p) => p.unlockedItems.length >= 1 },
];

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest-20-reps',
    name: 'Daily reps',
    description: 'Complete 20 total reps today.',
    icon: '💪',
    target: 20,
    metric: 'reps',
    reward: { xp: 50, coins: 25 },
  },
  {
    id: 'quest-50-cal',
    name: 'Burn it off',
    description: 'Burn 50 estimated calories today.',
    icon: '🔥',
    target: 50,
    metric: 'calories',
    reward: { xp: 50, coins: 25 },
  },
  {
    id: 'quest-3-sessions',
    name: 'Triple threat',
    description: 'Complete 3 workout sessions.',
    icon: '🎯',
    target: 3,
    metric: 'sessions',
    reward: { xp: 75, coins: 40 },
  },
];

export function checkAchievements(p: Progress): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(p)).map((a) => a.id);
}

export function checkQuests(p: Progress): string[] {
  return DAILY_QUESTS.filter((q) => {
    const value = p.missions.questProgress?.[q.metric] ?? 0;
    return value >= q.target;
  }).map((q) => q.id);
}

export function getQuestProgress(p: Progress, quest: DailyQuest): number {
  return Math.min(quest.target, p.missions.questProgress?.[quest.metric] ?? 0);
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getQuest(id: string): DailyQuest | undefined {
  return DAILY_QUESTS.find((q) => q.id === id);
}

// Backwards-compat alias for any old imports
export const DAILY_MISSIONS = DAILY_QUESTS;
