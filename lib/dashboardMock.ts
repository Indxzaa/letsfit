export type DailyWorkout = {
  date: string;
  label: string;
  reps: number;
  minutes: number;
  accuracy: number;
};

export type HistoryEntry = {
  id: string;
  date: string;
  exercise: string;
  reps: number;
  duration: number;
  accuracy: number;
};

export type CalendarDay = {
  date: string;
  active: boolean;
  intensity: number;
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export const WEEKLY_WORKOUTS: DailyWorkout[] = [
  { date: isoDate(6), label: DAY_NAMES[0], reps: 24, minutes: 12, accuracy: 86 },
  { date: isoDate(5), label: DAY_NAMES[1], reps: 32, minutes: 16, accuracy: 91 },
  { date: isoDate(4), label: DAY_NAMES[2], reps: 0, minutes: 0, accuracy: 0 },
  { date: isoDate(3), label: DAY_NAMES[3], reps: 28, minutes: 14, accuracy: 88 },
  { date: isoDate(2), label: DAY_NAMES[4], reps: 20, minutes: 10, accuracy: 92 },
  { date: isoDate(1), label: DAY_NAMES[5], reps: 38, minutes: 18, accuracy: 94 },
  { date: isoDate(0), label: DAY_NAMES[6], reps: 22, minutes: 11, accuracy: 90 },
];

export const WORKOUT_HISTORY: HistoryEntry[] = [
  {
    id: 'h-1',
    date: 'Today',
    exercise: 'Squats',
    reps: 22,
    duration: 11,
    accuracy: 90,
  },
  {
    id: 'h-2',
    date: 'Yesterday',
    exercise: 'Squats',
    reps: 38,
    duration: 18,
    accuracy: 94,
  },
  {
    id: 'h-3',
    date: '2 days ago',
    exercise: 'Squats',
    reps: 20,
    duration: 10,
    accuracy: 92,
  },
  {
    id: 'h-4',
    date: '3 days ago',
    exercise: 'Squats',
    reps: 28,
    duration: 14,
    accuracy: 88,
  },
  {
    id: 'h-5',
    date: '5 days ago',
    exercise: 'Squats',
    reps: 32,
    duration: 16,
    accuracy: 91,
  },
  {
    id: 'h-6',
    date: '6 days ago',
    exercise: 'Squats',
    reps: 24,
    duration: 12,
    accuracy: 86,
  },
];

export function buildCalendar(weeks: number = 12): CalendarDay[] {
  const totalDays = weeks * 7;
  const days: CalendarDay[] = [];
  const pattern = [
    2, 3, 0, 2, 3, 4, 1, 1, 2, 0, 3, 2, 4, 3, 0, 1, 2, 3, 4, 2, 0, 1, 3, 2, 4,
    3, 0, 2, 3, 4, 1, 0, 2, 3, 0, 4, 2, 3, 1, 0, 2, 3, 4, 0, 2, 3, 1, 0, 2, 3,
    4, 0, 1, 2, 3, 4, 0, 2, 3, 1, 0, 4, 3, 2, 0, 1, 3, 4, 2, 0, 3, 4, 2, 3, 0,
    4, 3, 2, 1, 4, 3, 2, 4,
  ];
  for (let i = totalDays - 1; i >= 0; i--) {
    const intensity = pattern[i % pattern.length];
    days.push({
      date: isoDate(i),
      active: intensity > 0,
      intensity,
    });
  }
  return days;
}

export const DASHBOARD_SUMMARY = {
  weeklyReps: WEEKLY_WORKOUTS.reduce((s, d) => s + d.reps, 0),
  weeklyMinutes: WEEKLY_WORKOUTS.reduce((s, d) => s + d.minutes, 0),
  averageAccuracy: Math.round(
    WEEKLY_WORKOUTS.filter((d) => d.accuracy > 0).reduce(
      (s, d) => s + d.accuracy,
      0
    ) / WEEKLY_WORKOUTS.filter((d) => d.accuracy > 0).length
  ),
  activeDays: WEEKLY_WORKOUTS.filter((d) => d.reps > 0).length,
};
