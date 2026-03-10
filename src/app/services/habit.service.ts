import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Badge,
  DashboardInsights,
  GamificationStats,
  Habit,
  HabitEntry,
  HabitStats,
  IntegrationStatus,
  MoodEntry
} from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  public habits$ = this.habitsSubject.asObservable();

  private moodEntriesSubject = new BehaviorSubject<MoodEntry[]>([]);
  public moodEntries$ = this.moodEntriesSubject.asObservable();

  private habitEntriesSubject = new BehaviorSubject<HabitEntry[]>([]);
  public habitEntries$ = this.habitEntriesSubject.asObservable();

  private gamificationSubject = new BehaviorSubject<GamificationStats>({
    xp: 0,
    level: 1,
    streakShields: 2,
    weeklyQuestProgress: 0,
    weeklyQuestTarget: 15,
    badges: []
  });
  public gamification$ = this.gamificationSubject.asObservable();

  private integrationStatusSubject = new BehaviorSubject<IntegrationStatus>({
    calendarExportEnabled: true,
    browserNotificationsEnabled: false
  });
  public integrationStatus$ = this.integrationStatusSubject.asObservable();

  private readonly HABITS_KEY = 'habits_v2';
  private readonly LEGACY_HABITS_KEY = 'habits';
  private readonly MOOD_KEY = 'moodEntries';
  private readonly ENTRIES_KEY = 'habitEntries_v2';
  private readonly GAMIFICATION_KEY = 'gamification_v2';
  private readonly INTEGRATIONS_KEY = 'integrations_v2';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedHabits = localStorage.getItem(this.HABITS_KEY);
    const legacyHabits = localStorage.getItem(this.LEGACY_HABITS_KEY);
    const storedMood = localStorage.getItem(this.MOOD_KEY);
    const storedEntries = localStorage.getItem(this.ENTRIES_KEY);
    const storedGamification = localStorage.getItem(this.GAMIFICATION_KEY);
    const storedIntegrations = localStorage.getItem(this.INTEGRATIONS_KEY);

    if (storedHabits) {
      this.habitsSubject.next(this.normalizeHabits(JSON.parse(storedHabits)));
    } else if (legacyHabits) {
      const migrated = this.normalizeHabits(JSON.parse(legacyHabits));
      this.habitsSubject.next(migrated);
      this.saveHabitsToStorage();
    } else {
      this.initializeSampleData();
    }

    if (storedMood) {
      this.moodEntriesSubject.next(JSON.parse(storedMood));
    } else {
      this.initializeSampleMoodData();
    }

    if (storedEntries) {
      this.habitEntriesSubject.next(JSON.parse(storedEntries));
    } else {
      this.buildEntriesFromCompletions();
    }

    if (storedGamification) {
      this.gamificationSubject.next(JSON.parse(storedGamification));
    }

    if (storedIntegrations) {
      this.integrationStatusSubject.next(JSON.parse(storedIntegrations));
    }

    this.recomputeGamification();
  }

  private normalizeHabits(rawHabits: any[]): Habit[] {
    return rawHabits.map((habit, index) => ({
      id: String(habit.id ?? Date.now() + index),
      name: habit.name ?? `Habit ${index + 1}`,
      icon: habit.icon ?? '⭐',
      color: habit.color ?? '#1f9d8b',
      goal: Number(habit.goal ?? 20),
      type: habit.type ?? 'boolean',
      targetValue: Number(habit.targetValue ?? 1),
      unit: habit.unit ?? (habit.type === 'duration' ? 'min' : 'times'),
      frequencyPerWeek: Number(habit.frequencyPerWeek ?? 5),
      weekDays: Array.isArray(habit.weekDays) && habit.weekDays.length ? habit.weekDays : [1, 2, 3, 4, 5, 6, 0],
      reminderTime: habit.reminderTime ?? '08:30',
      difficulty: habit.difficulty ?? 'medium',
      archived: Boolean(habit.archived ?? false),
      createdAt: new Date(habit.createdAt ?? new Date()),
      completedDates: Array.isArray(habit.completedDates) ? habit.completedDates : []
    }));
  }

  private saveHabitsToStorage(): void {
    localStorage.setItem(this.HABITS_KEY, JSON.stringify(this.habitsSubject.value));
  }

  private saveMoodToStorage(): void {
    localStorage.setItem(this.MOOD_KEY, JSON.stringify(this.moodEntriesSubject.value));
  }

  private saveEntriesToStorage(): void {
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(this.habitEntriesSubject.value));
  }

  private saveGamificationToStorage(): void {
    localStorage.setItem(this.GAMIFICATION_KEY, JSON.stringify(this.gamificationSubject.value));
  }

  private saveIntegrationsToStorage(): void {
    localStorage.setItem(this.INTEGRATIONS_KEY, JSON.stringify(this.integrationStatusSubject.value));
  }

  private initializeSampleData(): void {
    const sampleHabits: Habit[] = [
      {
        id: '1',
        name: 'Morning Deep Work',
        icon: '💻',
        color: '#0ea5e9',
        goal: 22,
        type: 'duration',
        targetValue: 90,
        unit: 'min',
        frequencyPerWeek: 5,
        weekDays: [1, 2, 3, 4, 5],
        reminderTime: '08:00',
        difficulty: 'hard',
        archived: false,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.8)
      },
      {
        id: '2',
        name: 'Meditation',
        icon: '🧘',
        color: '#10b981',
        goal: 28,
        type: 'duration',
        targetValue: 15,
        unit: 'min',
        frequencyPerWeek: 7,
        weekDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '07:00',
        difficulty: 'easy',
        archived: false,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.75)
      },
      {
        id: '3',
        name: 'Hydration',
        icon: '💧',
        color: '#3b82f6',
        goal: 31,
        type: 'count',
        targetValue: 8,
        unit: 'glasses',
        frequencyPerWeek: 7,
        weekDays: [0, 1, 2, 3, 4, 5, 6],
        reminderTime: '10:00',
        difficulty: 'medium',
        archived: false,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.85)
      },
      {
        id: '4',
        name: 'Workout',
        icon: '🏋️',
        color: '#ef4444',
        goal: 18,
        type: 'boolean',
        targetValue: 1,
        unit: 'session',
        frequencyPerWeek: 4,
        weekDays: [1, 2, 4, 6],
        reminderTime: '18:30',
        difficulty: 'hard',
        archived: false,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.7)
      }
    ];

    this.habitsSubject.next(sampleHabits);
    this.saveHabitsToStorage();
    this.buildEntriesFromCompletions();
  }

  private generateSampleCompletions(rate: number): string[] {
    const completions: string[] = [];
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= Math.min(today.getDate(), daysInMonth); i++) {
      if (Math.random() < rate) {
        const date = new Date(today.getFullYear(), today.getMonth(), i);
        completions.push(date.toISOString().split('T')[0]);
      }
    }
    return completions;
  }

  private initializeSampleMoodData(): void {
    const entries: MoodEntry[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        date: date.toISOString().split('T')[0],
        mood: Math.floor(Math.random() * 4) + 6,
        motivation: Math.floor(Math.random() * 4) + 5
      });
    }

    this.moodEntriesSubject.next(entries.reverse());
    this.saveMoodToStorage();
  }

  private buildEntriesFromCompletions(): void {
    const entries: HabitEntry[] = [];
    this.habitsSubject.value.forEach((habit) => {
      habit.completedDates.forEach((date) => {
        entries.push({
          habitId: habit.id,
          date,
          value: habit.targetValue
        });
      });
    });
    this.habitEntriesSubject.next(entries);
    this.saveEntriesToStorage();
  }

  getHabits(): Habit[] {
    return this.habitsSubject.value;
  }

  getActiveHabits(): Habit[] {
    return this.habitsSubject.value.filter((h) => !h.archived);
  }

  addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'archived'>): void {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date(),
      archived: false,
      completedDates: []
    };

    const habits = [...this.habitsSubject.value, newHabit];
    this.habitsSubject.next(habits);
    this.saveHabitsToStorage();
  }

  updateHabit(id: string, updates: Partial<Habit>): void {
    const habits = this.habitsSubject.value.map((h) =>
      h.id === id ? { ...h, ...updates } : h
    );
    this.habitsSubject.next(habits);
    this.saveHabitsToStorage();
  }

  archiveHabit(id: string): void {
    this.updateHabit(id, { archived: true });
  }

  deleteHabit(id: string): void {
    const habits = this.habitsSubject.value.filter((h) => h.id !== id);
    const entries = this.habitEntriesSubject.value.filter((entry) => entry.habitId !== id);
    this.habitsSubject.next(habits);
    this.habitEntriesSubject.next(entries);
    this.saveHabitsToStorage();
    this.saveEntriesToStorage();
  }

  toggleHabitCompletion(habitId: string, date: string, value?: number, note?: string): void {
    const habit = this.habitsSubject.value.find((h) => h.id === habitId);
    if (!habit) {
      return;
    }

    const effectiveValue = value ?? habit.targetValue;
    const isCompleted = this.isHabitCompleted(habitId, date);

    const habits = this.habitsSubject.value.map((currentHabit) => {
      if (currentHabit.id !== habitId) {
        return currentHabit;
      }

      const completedDates = [...currentHabit.completedDates];
      const index = completedDates.indexOf(date);

      if (isCompleted && index > -1) {
        completedDates.splice(index, 1);
      } else if (!isCompleted) {
        completedDates.push(date);
      }

      return { ...currentHabit, completedDates };
    });

    const entries = [...this.habitEntriesSubject.value];
    const existingEntryIndex = entries.findIndex((entry) => entry.habitId === habitId && entry.date === date);

    if (isCompleted && existingEntryIndex > -1) {
      entries.splice(existingEntryIndex, 1);
    } else {
      const nextEntry: HabitEntry = { habitId, date, value: effectiveValue, note };
      if (existingEntryIndex > -1) {
        entries[existingEntryIndex] = nextEntry;
      } else {
        entries.push(nextEntry);
      }
    }

    this.habitsSubject.next(habits);
    this.habitEntriesSubject.next(entries);
    this.saveHabitsToStorage();
    this.saveEntriesToStorage();
    this.recomputeGamification();
  }

  useStreakShield(habitId: string, date: string): boolean {
    const game = this.gamificationSubject.value;
    if (game.streakShields <= 0) {
      return false;
    }

    this.toggleHabitCompletion(habitId, date, 1, 'Recovered with streak shield');
    const updated: GamificationStats = {
      ...game,
      streakShields: game.streakShields - 1
    };
    this.gamificationSubject.next(updated);
    this.saveGamificationToStorage();
    return true;
  }

  isHabitCompleted(habitId: string, date: string): boolean {
    const habit = this.habitsSubject.value.find((h) => h.id === habitId);
    return habit ? habit.completedDates.includes(date) : false;
  }

  isHabitScheduledForDay(habit: Habit, date: Date): boolean {
    return habit.weekDays.includes(date.getDay());
  }

  getDueHabitsForDate(date: Date): Habit[] {
    return this.getActiveHabits().filter((habit) => this.isHabitScheduledForDay(habit, date));
  }

  getHabitStats(habitId: string, month: number, year: number): HabitStats {
    const habit = this.habitsSubject.value.find((h) => h.id === habitId);
    if (!habit) {
      return { habitId, completionRate: 0, currentStreak: 0, longestStreak: 0, completedCount: 0 };
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return date.toISOString().split('T')[0];
    });

    const scheduledDates = monthDates.filter((dateString) => {
      const date = new Date(dateString);
      return habit.weekDays.includes(date.getDay());
    });

    const completedThisMonth = scheduledDates.filter((date) => habit.completedDates.includes(date));
    const expected = Math.max(1, Math.min(habit.goal, scheduledDates.length));

    const completionRate = (completedThisMonth.length / expected) * 100;
    const currentStreak = this.calculateCurrentStreak(habit);
    const longestStreak = this.calculateLongestStreak(habit);

    return {
      habitId,
      completionRate: Math.min(completionRate, 100),
      currentStreak,
      longestStreak,
      completedCount: completedThisMonth.length
    };
  }

  private calculateCurrentStreak(habit: Habit): number {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (!this.isHabitScheduledForDay(habit, date)) {
        continue;
      }

      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(habit: Habit): number {
    const sortedDates = [...habit.completedDates].sort();
    if (!sortedDates.length) {
      return 0;
    }

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  }

  addMoodEntry(entry: MoodEntry): void {
    const entries = [...this.moodEntriesSubject.value];
    const existingIndex = entries.findIndex((e) => e.date === entry.date);

    if (existingIndex > -1) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    this.moodEntriesSubject.next(entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    this.saveMoodToStorage();
  }

  getMoodEntries(): MoodEntry[] {
    return this.moodEntriesSubject.value;
  }

  getCompletionRateLastNDays(days: number): number {
    const today = new Date();
    let due = 0;
    let completed = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dueHabits = this.getDueHabitsForDate(date);
      due += dueHabits.length;
      completed += dueHabits.filter((habit) => habit.completedDates.includes(dateStr)).length;
    }

    return due > 0 ? Math.round((completed / due) * 100) : 0;
  }

  getWeekdayCompletionDistribution(month: number, year: number): number[] {
    const weekdayCounts = Array(7).fill(0);
    const weekdayCompleted = Array(7).fill(0);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const weekday = date.getDay();
      const dueHabits = this.getDueHabitsForDate(date);

      weekdayCounts[weekday] += dueHabits.length;
      weekdayCompleted[weekday] += dueHabits.filter((habit) => habit.completedDates.includes(dateStr)).length;
    }

    return weekdayCompleted.map((value, i) =>
      weekdayCounts[i] > 0 ? Math.round((value / weekdayCounts[i]) * 100) : 0
    );
  }

  getLast28DayHeatmap(): Array<{ date: string; score: number }> {
    const today = new Date();
    const result: Array<{ date: string; score: number }> = [];

    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dueHabits = this.getDueHabitsForDate(date);
      const completed = dueHabits.filter((habit) => habit.completedDates.includes(dateStr)).length;
      const score = dueHabits.length > 0 ? Math.round((completed / dueHabits.length) * 4) : 0;
      result.push({ date: dateStr, score });
    }

    return result;
  }

  getDashboardInsights(): DashboardInsights {
    const habits = this.getActiveHabits();
    const completionRateLast7Days = this.getCompletionRateLastNDays(7);
    const completionRateLast30Days = this.getCompletionRateLastNDays(30);
    const weekdayDistribution = this.getWeekdayCompletionDistribution(new Date().getMonth(), new Date().getFullYear());

    const bestDayIndex = weekdayDistribution.indexOf(Math.max(...weekdayDistribution));
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const ranked = habits
      .map((habit) => ({ habit, stats: this.getHabitStats(habit.id, new Date().getMonth(), new Date().getFullYear()) }))
      .sort((a, b) => b.stats.completionRate - a.stats.completionRate);

    const consistencyScore = Math.round(completionRateLast7Days * 0.6 + completionRateLast30Days * 0.4);
    const best = ranked[0]?.habit?.name ?? 'No habits yet';

    let aiCoachMessage = 'Your consistency is building well. Keep your strongest habit as an anchor.';
    if (completionRateLast7Days < 50) {
      aiCoachMessage = 'AI Coach: You are overloaded this week. Reduce one hard habit and protect momentum.';
    } else if (completionRateLast7Days > 85) {
      aiCoachMessage = 'AI Coach: Excellent execution. Increase one habit target by 10% to keep growth steady.';
    }

    return {
      consistencyScore,
      bestDay: weekdays[bestDayIndex],
      mostConsistentHabitName: best,
      completionRateLast7Days,
      completionRateLast30Days,
      aiCoachMessage
    };
  }

  private recomputeGamification(): void {
    const habits = this.getActiveHabits();
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const completedCount = habits.reduce((acc, habit) => {
      const stats = this.getHabitStats(habit.id, month, year);
      return acc + stats.completedCount;
    }, 0);

    const bonus = this.getCompletionRateLastNDays(7) >= 80 ? 100 : 0;
    const xp = completedCount * 10 + bonus;
    const level = Math.max(1, Math.floor(xp / 300) + 1);

    const badges: Badge[] = [];

    if (this.getCompletionRateLastNDays(7) >= 80) {
      badges.push({
        id: 'focus-week',
        label: 'Focus Week',
        description: 'Completed 80%+ due habits in 7 days',
        icon: '⚡',
        earnedAt: new Date().toISOString()
      });
    }

    if (habits.some((habit) => this.getHabitStats(habit.id, month, year).currentStreak >= 7)) {
      badges.push({
        id: 'streak-7',
        label: '7-Day Streak',
        description: 'Maintained one habit for at least 7 scheduled days',
        icon: '🔥',
        earnedAt: new Date().toISOString()
      });
    }

    if (level >= 5) {
      badges.push({
        id: 'level-5',
        label: 'Level 5 Achiever',
        description: 'Reached level 5',
        icon: '🏆',
        earnedAt: new Date().toISOString()
      });
    }

    const existing = this.gamificationSubject.value;
    const updated: GamificationStats = {
      ...existing,
      xp,
      level,
      weeklyQuestProgress: Math.min(existing.weeklyQuestTarget, Math.floor(this.getCompletionRateLastNDays(7) / 100 * existing.weeklyQuestTarget)),
      badges
    };

    this.gamificationSubject.next(updated);
    this.saveGamificationToStorage();
  }

  getGamificationStats(): GamificationStats {
    return this.gamificationSubject.value;
  }

  async enableBrowserNotifications(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    const status = this.integrationStatusSubject.value;
    this.integrationStatusSubject.next({
      ...status,
      browserNotificationsEnabled: permission === 'granted'
    });
    this.saveIntegrationsToStorage();
    return permission === 'granted';
  }

  sendDailyReminderPreview(): void {
    const status = this.integrationStatusSubject.value;
    if (!status.browserNotificationsEnabled || !('Notification' in window)) {
      return;
    }

    const dueCount = this.getDueHabitsForDate(new Date()).length;
    new Notification('Habit Tracker Reminder', {
      body: `You have ${dueCount} habits due today. Keep the streak alive.`,
      icon: 'favicon.svg'
    });
  }

  getIntegrationStatus(): IntegrationStatus {
    return this.integrationStatusSubject.value;
  }

  exportCalendarICS(): void {
    const habits = this.getActiveHabits();
    const today = new Date();
    const next30: Date[] = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      next30.push(date);
    }

    const events = habits.flatMap((habit) =>
      next30
        .filter((date) => this.isHabitScheduledForDay(habit, date))
        .map((date) => {
          const start = `${date.toISOString().split('T')[0].replace(/-/g, '')}T${(habit.reminderTime ?? '0900').replace(':', '')}00`;
          const uid = `${habit.id}-${date.toISOString().split('T')[0]}@habit-tracker`;
          return [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            `DTSTART:${start}`,
            `SUMMARY:${habit.name}`,
            `DESCRIPTION:Habit target ${habit.targetValue} ${habit.unit}`,
            'END:VEVENT'
          ].join('\n');
        })
    );

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Habit Tracker//EN',
      ...events,
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'habit-tracker-calendar.ics';
    link.click();
    URL.revokeObjectURL(url);

    const status = this.integrationStatusSubject.value;
    this.integrationStatusSubject.next({
      ...status,
      lastCalendarSyncAt: new Date().toISOString()
    });
    this.saveIntegrationsToStorage();
  }
}
