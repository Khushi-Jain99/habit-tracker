import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Badge, DashboardInsights, GamificationStats, Habit, HabitBadge, HabitProgress } from '../models/habit.model';

export interface CompletionResult {
  completed: boolean;
  pointsEarned: number;
}

interface HabitFlowStateV1 {
  version: 1;
  habits: Habit[];
  gamification?: {
    earnedBadges: Record<string, Badge>;
  };
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly STATE_KEY = 'habitflow_state_v1';
  private readonly HABITS_KEY = 'habits_v3';
  private readonly LEGACY_HABITS_KEY = 'habits_v2';

  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  habits$ = this.habitsSubject.asObservable();

  private gamificationSubject = new BehaviorSubject<GamificationStats>({
    totalPoints: 0,
    todayPoints: 0,
    level: 0,
    levelProgressPercent: 0,
    nextLevelPoints: 100,
    dailyCompletionPercent: 0,
    completedToday: 0,
    dueToday: 0,
    badges: [],
    perfectDay: false,
    perfectWeek: false
  });
  gamification$ = this.gamificationSubject.asObservable();

  private earnedBadges: Record<string, Badge> = {};

  constructor() {
    this.loadFromStorage();
    this.recomputeGamification();
  }

  private loadFromStorage(): void {
    const stateRaw = localStorage.getItem(this.STATE_KEY);
    if (stateRaw) {
      const state = JSON.parse(stateRaw) as HabitFlowStateV1;
      this.earnedBadges = state.gamification?.earnedBadges ?? {};
      this.habitsSubject.next(this.normalizeHabits(state.habits ?? []));
      return;
    }

    const stored = localStorage.getItem(this.HABITS_KEY) ?? localStorage.getItem(this.LEGACY_HABITS_KEY);
    if (stored) {
      this.earnedBadges = {};
      this.habitsSubject.next(this.normalizeHabits(JSON.parse(stored)));
      // Migrate old storage format into the new structured state.
      this.persistState();
      return;
    }

    const today = new Date();
    this.habitsSubject.next([
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
      },
      {
        id: '2',
        name: 'Workout',
        icon: '💪',
        color: '#f97316',
        goal: 16,
        type: 'boolean',
        targetValue: 1,
        unit: 'session',
        frequencyPerWeek: 4,
        weekDays: [1, 2, 4, 6],
        reminderTime: '18:00',
        difficulty: 'medium',
        frequencyType: 'custom',
        category: 'Fitness',
        archived: false,
        createdAt: today,
        completedDates: []
      }
    ]);

    this.persistState();
  }

  private normalizeHabits(rawHabits: any[]): Habit[] {
    return rawHabits.map((habit, index) => ({
      id: String(habit.id ?? Date.now() + index),
      name: String(habit.name ?? `Habit ${index + 1}`),
      icon: String(habit.icon ?? '⭐'),
      color: String(habit.color ?? '#0ea5e9'),
      goal: Number(habit.goal ?? 20),
      type: habit.type ?? 'boolean',
      targetValue: Number(habit.targetValue ?? 1),
      unit: String(habit.unit ?? 'times'),
      frequencyPerWeek: Number(habit.frequencyPerWeek ?? 5),
      weekDays: Array.isArray(habit.weekDays) && habit.weekDays.length ? habit.weekDays : [1, 2, 3, 4, 5, 6, 0],
      reminderTime: habit.reminderTime ?? '08:30',
      difficulty: habit.difficulty ?? 'medium',
      // Back-compat migration:
      // - legacy `category` was actually frequency type ('daily' | 'weekly')
      // - new field is `frequencyType`, while grouping category becomes free-form string
      frequencyType: habit.frequencyType ?? (habit.category === 'weekly' ? 'weekly' : habit.category === 'daily' ? 'daily' : 'custom'),
      category: typeof habit.category === 'string' && !['daily', 'weekly'].includes(habit.category) ? habit.category : 'General',
      archived: Boolean(habit.archived ?? false),
      createdAt: new Date(habit.createdAt ?? new Date()),
      completedDates: Array.isArray(habit.completedDates) ? habit.completedDates : [],
      lastCompletedDate: habit.lastCompletedDate ?? this.computeLastCompletedDate(Array.isArray(habit.completedDates) ? habit.completedDates : [])
    }));
  }

  private computeLastCompletedDate(completedDates: string[]): string | undefined {
    const dateKeys = completedDates.filter(Boolean);
    if (!dateKeys.length) return undefined;
    // Date keys are YYYY-MM-DD so lexical order matches chronological order.
    return dateKeys.slice().sort().at(-1);
  }

  private persistState(): void {
    const state: HabitFlowStateV1 = {
      version: 1,
      habits: this.habitsSubject.value,
      gamification: {
        earnedBadges: this.earnedBadges
      },
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
  }

  private toDateKey(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getHabits(): Habit[] {
    return this.habitsSubject.value;
  }

  getActiveHabits(): Habit[] {
    return this.habitsSubject.value.filter((habit) => !habit.archived);
  }

  addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'archived'>): void {
    const next: Habit = {
      ...habit,
      id: Date.now().toString(),
      archived: false,
      createdAt: new Date(),
      completedDates: [],
      lastCompletedDate: undefined
    };

    this.habitsSubject.next([...this.habitsSubject.value, next]);
    this.persistState();
    this.recomputeGamification();
  }

  updateHabit(id: string, updates: Partial<Habit>): void {
    const next = this.habitsSubject.value.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit));
    this.habitsSubject.next(next);
    this.persistState();
    this.recomputeGamification();
  }

  archiveHabit(id: string): void {
    this.updateHabit(id, { archived: true });
  }

  deleteHabit(id: string): void {
    const next = this.habitsSubject.value.filter((habit) => habit.id !== id);
    this.habitsSubject.next(next);
    this.persistState();
    this.recomputeGamification();
  }

  isHabitScheduledForDay(habit: Habit, date: Date): boolean {
    return habit.weekDays.includes(date.getDay());
  }

  isHabitCompleted(habitId: string, dateInput: Date | string): boolean {
    const date = this.toDateKey(dateInput);
    const habit = this.habitsSubject.value.find((item) => item.id === habitId);
    return Boolean(habit?.completedDates.includes(date));
  }

  // Central toggle handler that also returns points gained for animated UI feedback.
  toggleHabitCompletion(habitId: string, dateInput: Date | string = new Date()): CompletionResult {
    const date = this.toDateKey(dateInput);
    const habits = this.habitsSubject.value;
    const habit = habits.find((item) => item.id === habitId);

    if (!habit) {
      return { completed: false, pointsEarned: 0 };
    }

    // Only allow toggling for days this habit is actually scheduled for.
    if (!this.isHabitScheduledForDay(habit, typeof dateInput === 'string' ? new Date(dateInput) : dateInput)) {
      return { completed: false, pointsEarned: 0 };
    }

    const wasCompleted = habit.completedDates.includes(date);
    let pointsEarned = 0;

    const nextHabits = habits.map((currentHabit) => {
      if (currentHabit.id !== habitId) {
        return currentHabit;
      }

      const completedDates = [...currentHabit.completedDates];
      const dateIndex = completedDates.indexOf(date);

      if (wasCompleted && dateIndex > -1) {
        completedDates.splice(dateIndex, 1);
      }

      if (!wasCompleted && dateIndex === -1) {
        completedDates.push(date);
      }

      const lastCompletedDate = wasCompleted ? this.computeLastCompletedDate(completedDates) : date;

      return {
        ...currentHabit,
        completedDates,
        lastCompletedDate
      };
    });

    if (!wasCompleted) {
      pointsEarned += 10;
      const updatedHabit = nextHabits.find((item) => item.id === habitId);
      if (updatedHabit) {
        const currentStreak = this.calculateCurrentStreak(updatedHabit);
        if (currentStreak > 0 && currentStreak % 7 === 0) {
          pointsEarned += 50;
        }
      }
    }

    this.habitsSubject.next(nextHabits);
    this.persistState();
    this.recomputeGamification();

    return {
      completed: !wasCompleted,
      pointsEarned
    };
  }

  getDueHabitsForDate(date: Date): Habit[] {
    return this.getActiveHabits().filter((habit) => this.isHabitScheduledForDay(habit, date));
  }

  getDailyCompletion(date: Date): { due: number; completed: number; percent: number } {
    const dateKey = this.toDateKey(date);
    const dueHabits = this.getDueHabitsForDate(date);
    const completed = dueHabits.filter((habit) => habit.completedDates.includes(dateKey)).length;
    const due = dueHabits.length;

    return {
      due,
      completed,
      percent: due === 0 ? 0 : Math.round((completed / due) * 100)
    };
  }

  getHabitProgress(habitId: string): HabitProgress {
    const habit = this.habitsSubject.value.find((item) => item.id === habitId);
    if (!habit) {
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        badge: 'None',
        totalCompletions: 0
      };
    }

    const currentStreak = this.calculateCurrentStreak(habit);
    const longestStreak = this.calculateLongestStreak(habit);

    return {
      habitId,
      currentStreak,
      longestStreak,
      badge: this.getBadgeFromStreak(longestStreak),
      totalCompletions: habit.completedDates.length
    };
  }

  getAllHabitProgress(): HabitProgress[] {
    return this.getActiveHabits().map((habit) => this.getHabitProgress(habit.id));
  }

  // Reusable streak function used by both points and UI badges.
  calculateCurrentStreak(habit: Habit): number {
    const completedSet = new Set(habit.completedDates);
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      if (!this.isHabitScheduledForDay(habit, date)) {
        continue;
      }

      const key = this.toDateKey(date);
      if (completedSet.has(key)) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }

  // Longest streak only advances on scheduled days for this habit.
  calculateLongestStreak(habit: Habit): number {
    const completedSet = new Set(habit.completedDates);
    let longest = 0;
    let current = 0;

    const start = new Date(habit.createdAt);
    const end = new Date();

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (!this.isHabitScheduledForDay(habit, date)) {
        continue;
      }

      const key = this.toDateKey(date);
      if (completedSet.has(key)) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }

    return longest;
  }

  // Badge thresholds required by the product spec.
  getBadgeFromStreak(streak: number): HabitBadge {
    if (streak >= 30) {
      return 'Master';
    }
    if (streak >= 7) {
      return 'Consistent';
    }
    if (streak >= 3) {
      return 'Beginner';
    }
    return 'None';
  }

  calculateLevel(totalPoints: number): number {
    return Math.floor(totalPoints / 100);
  }

  private buildGlobalBadges(progressByHabit: HabitProgress[]): Badge[] {
    const longest = Math.max(0, ...progressByHabit.map((item) => item.longestStreak));
    const badges: Badge[] = [];

    if (longest >= 3) {
      badges.push({ id: 'beginner', label: 'Beginner', description: 'Reached a 3-day streak', icon: '🥉' });
    }
    if (longest >= 7) {
      badges.push({ id: 'consistent', label: 'Consistent', description: 'Reached a 7-day streak', icon: '🥈' });
    }
    if (longest >= 30) {
      badges.push({ id: 'master', label: 'Master', description: 'Reached a 30-day streak', icon: '🥇' });
    }

    return badges;
  }

  private calculateTotalPoints(progressByHabit: HabitProgress[]): number {
    let points = 0;

    for (const progress of progressByHabit) {
      points += progress.totalCompletions * 10;
      points += Math.floor(progress.longestStreak / 7) * 50;
    }

    return points;
  }

  getWeeklyStats(): { date: string; completionRate: number }[] {
    const stats: { date: string; completionRate: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const completion = this.getDailyCompletion(date);
      stats.push({
        date: this.toDateKey(date),
        completionRate: completion.percent
      });
    }

    return stats;
  }

  getMonthlyStats(monthsBack = 6): { month: string; completionRate: number }[] {
    const stats: { month: string; completionRate: number }[] = [];
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let m = monthsBack - 1; m >= 0; m--) {
      const monthStart = new Date(end.getFullYear(), end.getMonth() - m, 1);
      const monthEnd = new Date(end.getFullYear(), end.getMonth() - m + 1, 0);

      let dueTotal = 0;
      let completedTotal = 0;

      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const { due, completed } = this.getDailyCompletion(d);
        dueTotal += due;
        completedTotal += completed;
      }

      const completionRate = dueTotal === 0 ? 0 : Math.round((completedTotal / dueTotal) * 100);
      const label = monthStart.toLocaleDateString(undefined, { month: 'short' });
      stats.push({ month: label, completionRate });
    }

    return stats;
  }

  getActivityHeatmapData(weeks = 52): { dateKey: string; completionRate: number | null; dueCount: number }[] {
    const results: { dateKey: string; completionRate: number | null; dueCount: number }[] = [];
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - weeks * 7 + 1);

    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
      const { due, completed, percent } = this.getDailyCompletion(d);
      results.push({
        dateKey: this.toDateKey(d),
        completionRate: due === 0 ? null : percent,
        dueCount: due,
      });
    }

    return results;
  }

  getWeekendMissInsight(): DashboardInsights {
    const insights: DashboardInsights = {
      consistencyScore: 0,
      bestDay: '',
      mostConsistentHabitName: '',
      completionRateLast7Days: 0,
      completionRateLast30Days: 0,
      aiCoachMessage: ''
    };

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 59); // last 60 days

    // weekday: 0 (Sun) ... 6 (Sat)
    const dueByWeekday = new Array(7).fill(0);
    const completedByWeekday = new Array(7).fill(0);

    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const { due, completed } = this.getDailyCompletion(d);
      const wd = d.getDay();
      dueByWeekday[wd] += due;
      completedByWeekday[wd] += completed;
    }

    const completionRate = dueByWeekday.map((due, wd) => {
      if (due === 0) return 0;
      return Math.round((completedByWeekday[wd] / due) * 100);
    });

    const weekdayAvg = (completionRate[1] + completionRate[2] + completionRate[3] + completionRate[4] + completionRate[5]) / 5;
    const weekendAvg = (completionRate[0] + completionRate[6]) / 2;

    const completionRateLast7Days = this.getWeeklyStats().reduce((sum, x) => sum + x.completionRate, 0) / 7;
    const completionRateLast30Days = (() => {
      let dueTotal = 0;
      let completedTotal = 0;
      const t30 = new Date(today);
      t30.setDate(today.getDate() - 29);
      for (let d = new Date(t30); d <= today; d.setDate(d.getDate() + 1)) {
        const { due, completed } = this.getDailyCompletion(d);
        dueTotal += due;
        completedTotal += completed;
      }
      return dueTotal === 0 ? 0 : Math.round((completedTotal / dueTotal) * 100);
    })();

    insights.completionRateLast7Days = Math.round(completionRateLast7Days);
    insights.completionRateLast30Days = completionRateLast30Days;
    insights.consistencyScore = Math.round((insights.completionRateLast7Days * 0.6 + insights.completionRateLast30Days * 0.4));

    const bestWdIndex = completionRate.indexOf(Math.max(...completionRate));
    insights.bestDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][bestWdIndex];

    // Determine most consistent habit by completion rate over last 30 days.
    let mostConsistent: { name: string; rate: number } = { name: '', rate: -1 };
    for (const habit of this.getActiveHabits()) {
      const completedSet = new Set(habit.completedDates);
      let dueTotal = 0;
      let completedTotal = 0;
      const t30 = new Date(today);
      t30.setDate(today.getDate() - 29);
      for (let d = new Date(t30); d <= today; d.setDate(d.getDate() + 1)) {
        if (!this.isHabitScheduledForDay(habit, d)) continue;
        dueTotal += 1;
        const key = this.toDateKey(d);
        if (completedSet.has(key)) completedTotal += 1;
      }
      const rate = dueTotal === 0 ? 0 : Math.round((completedTotal / dueTotal) * 100);
      if (rate > mostConsistent.rate) {
        mostConsistent = { name: habit.name, rate };
      }
    }
    insights.mostConsistentHabitName = mostConsistent.name;

    if (weekendAvg < weekdayAvg - 12) {
      insights.aiCoachMessage = `You often miss habits on weekends. Try shifting your plan for Saturday/Sunday or adding a smaller “micro-habit” just for those days.`;
    } else if (insights.completionRateLast7Days >= 75) {
      insights.aiCoachMessage = `Strong momentum. Your completion rate is trending high—keep the neon streak alive.`;
    } else {
      insights.aiCoachMessage = `You’re building consistency. Focus on finishing one habit early each day to lift your overall completion.`;
    }

    return insights;
  }

  private isPerfectDay(date: Date): boolean {
    const { due, completed } = this.getDailyCompletion(date);
    return due > 0 && completed === due;
  }

  private isPerfectWeek(date: Date): boolean {
    // Week starts on Monday (local).
    const day = date.getDay(); // 0 Sun - 6 Sat
    const diffToMonday = (day + 6) % 7;
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - diffToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let dueTotal = 0;
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const { due, completed } = this.getDailyCompletion(d);
      dueTotal += due;
      if (due > 0 && completed !== due) return false;
    }

    return dueTotal > 0;
  }

  private awardBadgeOnce(id: string, badge: Omit<Badge, 'earnedAt'>): void {
    if (this.earnedBadges[id]) return;
    this.earnedBadges[id] = { ...badge, earnedAt: new Date().toISOString() };
  }

  private recomputeGamification(): void {
    const today = new Date();
    const progressByHabit = this.getAllHabitProgress();
    const totalPoints = this.calculateTotalPoints(progressByHabit);
    const level = this.calculateLevel(totalPoints);
    const daily = this.getDailyCompletion(today);
    const todayKey = this.toDateKey(today);

    const perfectDay = this.isPerfectDay(today);
    const perfectWeek = this.isPerfectWeek(today);

    // Global achievements
    const any7Day = progressByHabit.some((p) => p.longestStreak >= 7);
    const any30Day = progressByHabit.some((p) => p.longestStreak >= 30);

    if (any7Day) {
      this.awardBadgeOnce('streak_7', {
        id: 'streak_7',
        label: '7-day Streak',
        description: 'Reached a 7-day streak (across habits).',
        icon: '🔥'
      });
    }

    if (any30Day) {
      this.awardBadgeOnce('streak_30', {
        id: 'streak_30',
        label: '30-day Streak',
        description: 'Reached a 30-day streak (across habits).',
        icon: '🏆'
      });
    }

    if (perfectDay) {
      this.awardBadgeOnce('perfect_day', {
        id: 'perfect_day',
        label: 'Perfect Day',
        description: 'Completed every habit due today.',
        icon: '✨'
      });
    }

    if (perfectWeek) {
      this.awardBadgeOnce('perfect_week', {
        id: 'perfect_week',
        label: 'Perfect Week',
        description: 'Completed every habit due this week.',
        icon: '💎'
      });
    }

    const todayPoints = this.getActiveHabits().reduce((sum, habit) => {
      return sum + (habit.completedDates.includes(todayKey) ? 10 : 0);
    }, 0);

    const levelProgressPercent = (() => {
      const inLevel = totalPoints % 100;
      return Math.max(0, Math.round((inLevel / 100) * 100));
    })();
    const nextLevelPoints = (level + 1) * 100;

    // Persist earned badges when they change.
    // (We do this lazily during recompute to keep toggling snappy.)
    this.persistState();

    this.gamificationSubject.next({
      totalPoints,
      todayPoints,
      level,
      levelProgressPercent,
      nextLevelPoints,
      dailyCompletionPercent: daily.percent,
      completedToday: daily.completed,
      dueToday: daily.due,
      badges: Object.values(this.earnedBadges),
      perfectDay,
      perfectWeek
    });
  }
}
