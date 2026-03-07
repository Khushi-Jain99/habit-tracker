import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Habit, MoodEntry, HabitStats } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  public habits$ = this.habitsSubject.asObservable();

  private moodEntriesSubject = new BehaviorSubject<MoodEntry[]>([]);
  public moodEntries$ = this.moodEntriesSubject.asObservable();

  private readonly HABITS_KEY = 'habits';
  private readonly MOOD_KEY = 'moodEntries';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedHabits = localStorage.getItem(this.HABITS_KEY);
    const storedMood = localStorage.getItem(this.MOOD_KEY);
    
    if (storedHabits) {
      const habits = JSON.parse(storedHabits);
      this.habitsSubject.next(habits);
    } else {
      this.initializeSampleData();
    }

    if (storedMood) {
      this.moodEntriesSubject.next(JSON.parse(storedMood));
    } else {
      this.initializeSampleMoodData();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.HABITS_KEY, JSON.stringify(this.habitsSubject.value));
  }

  private saveMoodToStorage(): void {
    localStorage.setItem(this.MOOD_KEY, JSON.stringify(this.moodEntriesSubject.value));
  }

  private initializeSampleData(): void {
    const sampleHabits: Habit[] = [
      {
        id: '1',
        name: 'Wake up at 06:00',
        icon: '⏰',
        color: '#FF6B6B',
        goal: 31,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.85)
      },
      {
        id: '2',
        name: 'Meditation',
        icon: '🧘',
        color: '#4ECDC4',
        goal: 31,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.75)
      },
      {
        id: '3',
        name: 'Cold Shower',
        icon: '🚿',
        color: '#45B7D1',
        goal: 31,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.80)
      },
      {
        id: '4',
        name: 'Work',
        icon: '💼',
        color: '#96CEB4',
        goal: 22,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.90)
      },
      {
        id: '5',
        name: 'Read 10 pages',
        icon: '📚',
        color: '#FFEAA7',
        goal: 31,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.70)
      },
      {
        id: '6',
        name: 'No sugar',
        icon: '🍬',
        color: '#DFE6E9',
        goal: 31,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.82)
      },
      {
        id: '7',
        name: 'No alcohol',
        icon: '🍺',
        color: '#74B9FF',
        goal: 31,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.88)
      },
      {
        id: '8',
        name: 'GYM',
        icon: '💪',
        color: '#FD79A8',
        goal: 20,
        createdAt: new Date('2026-01-01'),
        completedDates: this.generateSampleCompletions(0.78)
      }
    ];
    
    this.habitsSubject.next(sampleHabits);
    this.saveToStorage();
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
        mood: Math.floor(Math.random() * 4) + 6, // 6-10
        motivation: Math.floor(Math.random() * 4) + 5 // 5-9
      });
    }
    
    this.moodEntriesSubject.next(entries.reverse());
    this.saveMoodToStorage();
  }

  getHabits(): Habit[] {
    return this.habitsSubject.value;
  }

  addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>): void {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date(),
      completedDates: []
    };
    
    const habits = [...this.habitsSubject.value, newHabit];
    this.habitsSubject.next(habits);
    this.saveToStorage();
  }

  updateHabit(id: string, updates: Partial<Habit>): void {
    const habits = this.habitsSubject.value.map(h => 
      h.id === id ? { ...h, ...updates } : h
    );
    this.habitsSubject.next(habits);
    this.saveToStorage();
  }

  deleteHabit(id: string): void {
    const habits = this.habitsSubject.value.filter(h => h.id !== id);
    this.habitsSubject.next(habits);
    this.saveToStorage();
  }

  toggleHabitCompletion(habitId: string, date: string): void {
    const habits = this.habitsSubject.value.map(habit => {
      if (habit.id === habitId) {
        const completedDates = [...habit.completedDates];
        const index = completedDates.indexOf(date);
        
        if (index > -1) {
          completedDates.splice(index, 1);
        } else {
          completedDates.push(date);
        }
        
        return { ...habit, completedDates };
      }
      return habit;
    });
    
    this.habitsSubject.next(habits);
    this.saveToStorage();
  }

  isHabitCompleted(habitId: string, date: string): boolean {
    const habit = this.habitsSubject.value.find(h => h.id === habitId);
    return habit ? habit.completedDates.includes(date) : false;
  }

  getHabitStats(habitId: string, month: number, year: number): HabitStats {
    const habit = this.habitsSubject.value.find(h => h.id === habitId);
    if (!habit) {
      return { habitId, completionRate: 0, currentStreak: 0, longestStreak: 0, completedCount: 0 };
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return date.toISOString().split('T')[0];
    });

    const completedThisMonth = monthDates.filter(date => 
      habit.completedDates.includes(date)
    );

    const completionRate = (completedThisMonth.length / habit.goal) * 100;
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
      
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreak(habit: Habit): number {
    const sortedDates = [...habit.completedDates].sort();
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    
    return Math.max(longestStreak, currentStreak);
  }

  addMoodEntry(entry: MoodEntry): void {
    const entries = [...this.moodEntriesSubject.value];
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    
    if (existingIndex > -1) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    this.moodEntriesSubject.next(entries.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    this.saveMoodToStorage();
  }

  getMoodEntries(): MoodEntry[] {
    return this.moodEntriesSubject.value;
  }
}
