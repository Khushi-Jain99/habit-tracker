import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitProgress, GamificationStats } from '../../models/habit.model';
import { HabitDialogComponent } from '../habit-dialog/habit-dialog.component';
import { animatePress } from '../../utils/motion.util';
import { ProgressRingComponent } from '../../shared/components/progress-ring/progress-ring.component';

type FilterFrequency = 'all' | 'daily' | 'weekly' | 'custom';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, ProgressRingComponent],
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.scss']
})
export class HabitsComponent implements OnInit, OnDestroy {
  habits: Habit[] = [];
  progressByHabit = new Map<string, HabitProgress>();

  searchQuery = '';
  filterFrequency: FilterFrequency = 'all';
  filterCategory = 'All';
  availableCategories: string[] = [];

  stats: GamificationStats | null = null;
  loading = true;
  private hydratedOnce = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private habitService: HabitService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.habitService.habits$.subscribe((habits) => {
        this.habits = habits.filter((h) => !h.archived);
        this.availableCategories = Array.from(new Set(this.habits.map((h) => h.category))).sort();
        this.rebuildProgress();

        if (!this.hydratedOnce) {
          this.hydratedOnce = true;
          setTimeout(() => (this.loading = false), 350);
        }
      })
    );

    this.subscriptions.push(
      this.habitService.gamification$.subscribe((stats) => {
        this.stats = stats;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private rebuildProgress(): void {
    const map = new Map<string, HabitProgress>();
    this.habits.forEach((habit) => {
      map.set(habit.id, this.habitService.getHabitProgress(habit.id));
    });
    this.progressByHabit = map;
  }

  get filteredHabits(): Habit[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.habits
      .filter((h) => (this.filterFrequency === 'all' ? true : h.frequencyType === this.filterFrequency))
      .filter((h) => (this.filterCategory === 'All' ? true : h.category === this.filterCategory))
      .filter((h) => (q ? h.name.toLowerCase().includes(q) : true));
  }

  getProgress(habitId: string): HabitProgress {
    return (
      this.progressByHabit.get(habitId) ?? {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        badge: 'None',
        totalCompletions: 0
      }
    );
  }

  getBadgeTone(badge: string): string {
    if (badge === 'Master') return 'bg-amber-100 text-amber-700';
    if (badge === 'Consistent') return 'bg-blue-100 text-blue-700';
    if (badge === 'Beginner') return 'bg-emerald-100 text-emerald-700';
    return 'bg-surface-muted text-muted';
  }

  getStreakPercent(habitId: string): number {
    const streak = this.getProgress(habitId).currentStreak;
    if (streak <= 0) return 0;
    if (streak >= 7) return 100;
    return (streak / 7) * 100;
  }

  getStreakCaption(habitId: string): string {
    const streak = this.getProgress(habitId).currentStreak;
    if (streak >= 7) return '7+ days';
    return 'to 7';
  }

  getStreakTone(habitId: string): 'primary' | 'emerald' | 'amber' | 'slate' {
    const streak = this.getProgress(habitId).currentStreak;
    if (streak >= 30) return 'amber';
    if (streak >= 7) return 'emerald';
    if (streak > 0) return 'primary';
    return 'slate';
  }

  isCompletedToday(habitId: string): boolean {
    return this.habitService.isHabitCompleted(habitId, new Date());
  }

  toggleCompletion(habit: Habit, event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement | null;
    if (button) animatePress(button);

    this.habitService.toggleHabitCompletion(habit.id, new Date());
  }

  editHabit(habit: Habit): void {
    const dialogRef = this.dialog.open(HabitDialogComponent, {
      data: { habit, mode: 'edit' as const }
    });

    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((result) => {
        if (!result) return;
        this.habitService.updateHabit(habit.id, result);
      })
    );
  }

  deleteHabit(habitId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('Delete this habit?')) return;
    this.habitService.deleteHabit(habitId);
  }

  openAddHabit(): void {
    // Keep UX consistent: add happens on its own route.
    window.location.href = '/add-habit';
  }

  trackHabit(_: number, habit: Habit): string {
    return habit.id;
  }
}

