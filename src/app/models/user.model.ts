import { Badge, Habit } from './habit.model';

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
}

export interface UserProfile {
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  locale?: string;
}

export interface UserHeatmapCell {
  dateKey: string;
  completionRate: number | null;
  dueCount: number;
  completedCount: number;
}

export interface UserGamificationState {
  earnedBadges: Record<string, Badge>;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  profile: UserProfile;
  habits: Habit[];
  stats: UserStats;
  gamification?: UserGamificationState;
  heatmap?: UserHeatmapCell[];
  createdAt: string;
  updatedAt: string;
}
