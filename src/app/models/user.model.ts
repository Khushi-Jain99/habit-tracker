import { Badge, Habit } from './habit.model';

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
}

export interface UserGamificationState {
  earnedBadges: Record<string, Badge>;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  habits: Habit[];
  stats: UserStats;
  gamification?: UserGamificationState;
  createdAt: string;
  updatedAt: string;
}
