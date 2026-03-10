export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  goal: number; // legacy monthly goal
  type: HabitType;
  targetValue: number;
  unit: string;
  frequencyPerWeek: number;
  weekDays: number[];
  reminderTime?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  archived: boolean;
  createdAt: Date;
  completedDates: string[]; // ISO date strings
}

export type HabitType = 'boolean' | 'count' | 'duration';

export interface HabitEntry {
  habitId: string;
  date: string;
  value: number;
  note?: string;
}

export interface DayCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface MoodEntry {
  date: string;
  mood: number; // 1-10
  motivation: number; // 1-10
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface GamificationStats {
  xp: number;
  level: number;
  streakShields: number;
  weeklyQuestProgress: number;
  weeklyQuestTarget: number;
  badges: Badge[];
}

export interface IntegrationStatus {
  calendarExportEnabled: boolean;
  browserNotificationsEnabled: boolean;
  lastCalendarSyncAt?: string;
}

export interface DashboardInsights {
  consistencyScore: number;
  bestDay: string;
  mostConsistentHabitName: string;
  completionRateLast7Days: number;
  completionRateLast30Days: number;
  aiCoachMessage: string;
}

export interface HabitStats {
  habitId: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  completedCount: number;
}
