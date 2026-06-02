import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Habit } from '../models/habit.model';
import { UserGamificationState, UserHeatmapCell, UserProfile, UserRecord, UserStats } from '../models/user.model';

interface UserStorageStateV1 {
  version: 1;
  users: UserRecord[];
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_KEY = 'habitflow_users_v1';
  private readonly SESSION_KEY = 'habitflow_session_v1';

  private users: UserRecord[] = [];
  private currentUserSubject = new BehaviorSubject<UserRecord | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.users = this.loadUsers();
    this.bootstrapLegacyUser();
    this.restoreSession();
  }

  getUsers(): UserRecord[] {
    return [...this.users];
  }

  getCurrentUser(): UserRecord | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(userId: string | null): void {
    if (!userId) {
      localStorage.removeItem(this.SESSION_KEY);
      this.currentUserSubject.next(null);
      return;
    }

    const match = this.users.find((user) => user.id === userId) ?? null;
    if (match) {
      localStorage.setItem(this.SESSION_KEY, userId);
    } else {
      localStorage.removeItem(this.SESSION_KEY);
    }
    this.currentUserSubject.next(match);
  }

  createUser(name: string, email: string, password?: string, habits: Habit[] = []): UserRecord {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      avatarUrl: '',
      bio: '',
      timezone: this.getTimezone(),
      locale: this.getLocale()
    };
    const newUser: UserRecord = {
      id: this.generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      profile,
      habits,
      stats: {
        xp: 0,
        level: 0,
        streak: 0
      },
      gamification: {
        earnedBadges: {}
      },
      heatmap: [],
      createdAt: now,
      updatedAt: now
    };

    this.users = [...this.users, newUser];
    this.persistUsers();
    this.setCurrentUser(newUser.id);
    return newUser;
  }

  updateUser(userId: string, updates: Partial<UserRecord>): UserRecord | null {
    const currentUser = this.users.find((user) => user.id === userId);
    if (!currentUser) return null;

    const nextUser: UserRecord = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users = this.users.map((user) => (user.id === userId ? nextUser : user));
    this.persistUsers();

    if (this.currentUserSubject.value?.id === nextUser.id) {
      this.currentUserSubject.next(nextUser);
    }
    return nextUser;
  }

  updateCurrentUserData(payload: {
    habits?: Habit[];
    stats?: UserStats;
    gamification?: UserGamificationState;
    heatmap?: UserHeatmapCell[];
    profile?: UserProfile;
  }): void {
    const current = this.currentUserSubject.value;
    if (!current) return;
    this.updateUser(current.id, {
      habits: payload.habits ?? current.habits,
      stats: payload.stats ?? current.stats,
      gamification: payload.gamification ?? current.gamification,
      heatmap: payload.heatmap ?? current.heatmap,
      profile: payload.profile ?? current.profile
    });
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  private restoreSession(): void {
    const sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      this.currentUserSubject.next(null);
      return;
    }
    const match = this.users.find((user) => user.id === sessionId) ?? null;
    this.currentUserSubject.next(match);
  }

  private persistUsers(): void {
    const payload: UserStorageStateV1 = {
      version: 1,
      users: this.users,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.USERS_KEY, JSON.stringify(payload));
  }

  private loadUsers(): UserRecord[] {
    try {
      const raw = localStorage.getItem(this.USERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as UserStorageStateV1;
      const users = parsed.users ?? [];
      return users.map((user) => this.normalizeUser(user));
    } catch {
      return [];
    }
  }

  private normalizeUser(user: UserRecord): UserRecord {
    const now = new Date().toISOString();
    return {
      id: user.id ?? this.generateId(),
      name: user.name ?? 'User',
      email: user.email ?? '',
      password: user.password,
      profile: user.profile ?? {
        avatarUrl: '',
        bio: '',
        timezone: this.getTimezone(),
        locale: this.getLocale()
      },
      habits: Array.isArray(user.habits) ? user.habits : [],
      stats: user.stats ?? { xp: 0, level: 0, streak: 0 },
      gamification: user.gamification ?? { earnedBadges: {} },
      heatmap: Array.isArray(user.heatmap) ? user.heatmap : [],
      createdAt: user.createdAt ?? now,
      updatedAt: user.updatedAt ?? now
    };
  }

  private bootstrapLegacyUser(): void {
    if (this.users.length > 0) return;

    const legacyHabits = this.loadLegacyHabits();
    const habits = legacyHabits.length ? legacyHabits : this.createDefaultHabits();
    const user = this.createUser('Demo User', 'demo@habitflow.local', undefined, habits);
    this.updateUser(user.id, {
      stats: { xp: 0, level: 0, streak: 0 }
    });
  }

  private loadLegacyHabits(): Habit[] {
    const keys = ['habitflow_state_v1', 'habits_v3', 'habits_v2'];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as { habits?: Habit[] } | Habit[];
        if (Array.isArray(parsed)) return parsed as Habit[];
        if (parsed && Array.isArray(parsed.habits)) return parsed.habits;
      } catch {
        continue;
      }
    }
    return [];
  }

  createDefaultHabits(): Habit[] {
    const today = new Date();
    return [
      {
        id: '1',
        name: 'Read 20 minutes',
        icon: '📚',
        color: '#1f6feb',
        goal: 20,
        type: 'duration',
        targetValue: 20,
        unit: 'min',
        frequencyPerWeek: 7,
        weekDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '20:00',
        difficulty: 'easy',
        frequencyType: 'daily',
        category: 'Learning',
        archived: false,
        createdAt: today,
        completedDates: []
      }
    ];
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  private getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
    } catch {
      return 'UTC';
    }
  }

  private getLocale(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
    return 'en';
  }
}
