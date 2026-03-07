export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  goal: number; // days per month
  createdAt: Date;
  completedDates: string[]; // ISO date strings
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

export interface HabitStats {
  habitId: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  completedCount: number;
}
