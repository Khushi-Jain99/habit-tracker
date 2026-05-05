export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  goal: number; // legacy monthly goal (kept for future backend compatibility)
  type: HabitType;
  targetValue: number;
  unit: string;
  frequencyPerWeek: number;
  weekDays: number[];
  reminderTime?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // Frequency classification for the product spec (Daily / Weekly / Custom)
  frequencyType: 'daily' | 'weekly' | 'custom';
  // User-defined grouping (e.g., Health, Fitness, Productivity)
  category: string;
  archived: boolean;
  createdAt: Date;
  completedDates: string[]; // ISO date strings
  // Cached last completion date key (YYYY-MM-DD) for quick streak UI.
  lastCompletedDate?: string;
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

export type HabitBadge = 'Beginner' | 'Consistent' | 'Master' | 'None';

export interface HabitProgress {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  badge: HabitBadge;
  totalCompletions: number;
}

export interface GamificationStats {
  totalPoints: number;
  todayPoints: number;
  level: number;
  levelProgressPercent: number;
  nextLevelPoints: number;
  dailyCompletionPercent: number;
  completedToday: number;
  dueToday: number;
  badges: Badge[];
  perfectDay?: boolean;
  perfectWeek?: boolean;
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
