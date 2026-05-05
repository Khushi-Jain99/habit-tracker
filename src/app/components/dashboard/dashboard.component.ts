import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { animateMini } from 'motion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HabitService } from '../../services/habit.service';
import { DashboardInsights, GamificationStats, Habit, HabitProgress } from '../../models/habit.model';
import { animateFadeScale, animatePageIn, animatePress } from '../../utils/motion.util';
import { ProgressRingComponent } from '../../shared/components/progress-ring/progress-ring.component';
import confetti from 'canvas-confetti';
import { HabitDialogComponent } from '../habit-dialog/habit-dialog.component';

interface PointsPopup {
  id: number;
  habitId: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProgressRingComponent, MatDialogModule, HabitDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  habits: Habit[] = [];
  todayHabits: Habit[] = [];
  progressByHabit = new Map<string, HabitProgress>();

  stats: GamificationStats = {
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
  };

  activeFilter: 'all' | 'daily' | 'weekly' | 'custom' = 'all';

  pointsPopups: PointsPopup[] = [];
  private popupId = 0;
  private subscriptions: Subscription[] = [];

  weeklyStats: { date: string; completionRate: number }[] = [];
  insights?: DashboardInsights;
  private confettiDateKey?: string;

  constructor(
    private habitService: HabitService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.subscriptions.push(
      this.habitService.habits$.subscribe((habits) => {
        this.habits = habits.filter((habit) => !habit.archived);
        this.todayHabits = this.habitService.getDueHabitsForDate(new Date());
        this.rebuildProgress();
      })
    );

    this.subscriptions.push(
      this.habitService.gamification$.subscribe((stats) => {
        this.stats = stats;
        this.animateDailyProgress();
        this.weeklyStats = this.habitService.getWeeklyStats();
        this.insights = this.habitService.getWeekendMissInsight();

        const todayKey = new Date().toISOString().slice(0, 10);
        if (this.stats.perfectDay && this.stats.dueToday > 0 && this.stats.completedToday === this.stats.dueToday && this.confettiDateKey !== todayKey) {
          this.confettiDateKey = todayKey;
          this.launchConfetti();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    animatePageIn('.dashboard-page');
    this.animateDailyProgress();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private rebuildProgress(): void {
    const map = new Map<string, HabitProgress>();
    this.habits.forEach((habit) => {
      map.set(habit.id, this.habitService.getHabitProgress(habit.id));
    });
    this.progressByHabit = map;
  }

  private animateDailyProgress(): void {
    requestAnimationFrame(() => {
      const progressFill = document.querySelector('.daily-progress-fill');
      if (progressFill) {
        animateMini(progressFill, { width: `${this.stats.dailyCompletionPercent}%` }, { duration: 0.55, ease: 'easeOut' });
      }
    });
  }

  getProgress(habitId: string): HabitProgress {
    return this.progressByHabit.get(habitId) ?? {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      badge: 'None',
      totalCompletions: 0
    };
  }

  get filteredHabits(): Habit[] {
    if (this.activeFilter === 'all') return this.todayHabits;
    return this.todayHabits.filter((h) => h.frequencyType === this.activeFilter);
  }

  setFilter(filter: 'all' | 'daily' | 'weekly' | 'custom'): void {
    this.activeFilter = filter;
  }

  getBadgeTone(badge: string): string {
    if (badge === 'Master') return 'bg-amber-100 text-amber-700';
    if (badge === 'Consistent') return 'bg-blue-100 text-blue-700';
    if (badge === 'Beginner') return 'bg-emerald-100 text-emerald-700';
    return 'bg-surface-muted text-muted';
  }

  private getStreakToneFromCount(streak: number): 'primary' | 'emerald' | 'amber' | 'slate' {
    if (streak >= 30) return 'amber';
    if (streak >= 7) return 'emerald';
    if (streak > 0) return 'primary';
    return 'slate';
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
    return this.getStreakToneFromCount(streak);
  }

  onCompleteHabit(habit: Habit, event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement | null;
    if (button) {
      animatePress(button);
    }

    const result = this.habitService.toggleHabitCompletion(habit.id, new Date());

    if (result.completed) {
      if (button) {
        const row = button.closest('.habit-item');
        if (row) {
          animateFadeScale(row);
        }
      }

      this.pointsPopups = [
        ...this.pointsPopups,
        {
          id: ++this.popupId,
          habitId: habit.id,
          value: result.pointsEarned
        }
      ];

      setTimeout(() => {
        this.pointsPopups = this.pointsPopups.filter((popup) => popup.id !== this.popupId);
      }, 1100);
    }
  }

  isCompletedToday(habitId: string): boolean {
    return this.habitService.isHabitCompleted(habitId, new Date());
  }

  goToAddHabit(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (target) {
      animatePress(target);
    }
    this.router.navigateByUrl('/add-habit');
  }

  onDeleteHabit(habitId: string, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this habit?')) {
      this.habitService.deleteHabit(habitId);
    }
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

  trackHabit(_: number, habit: Habit): string {
    return habit.id;
  }

  private launchConfetti(): void {
    // Uses `canvas-confetti` which auto-renders to a canvas overlay.
    confetti({
      particleCount: 240,
      spread: 85,
      startVelocity: 40,
      gravity: 0.9,
      origin: { y: 0.65 }
    });
    confetti({
      particleCount: 140,
      spread: 60,
      startVelocity: 25,
      gravity: 1.05,
      origin: { y: 0.9 }
    });
  }

  getDayLabel(dateKey: string): string {
    const [y, m, d] = dateKey.split('-').map((v) => Number(v));
    if (!y || !m || !d) return dateKey;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, { weekday: 'short' });
  }
}
