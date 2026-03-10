import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { HabitService } from '../../services/habit.service';
import { ThemeService } from '../../services/theme.service';
import {
  DashboardInsights,
  GamificationStats,
  Habit,
  HabitStats,
  IntegrationStatus
} from '../../models/habit.model';
import { HabitDialogComponent } from '../habit-dialog/habit-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatDialogModule,
    MatMenuModule,
    FormsModule,
    NgChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  habits: Habit[] = [];
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
  daysInMonth: number[] = [];
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  dailyProgressChart: ChartConfiguration['data'] | null = null;
  weeklyProgressChart: ChartConfiguration['data'] | null = null;
  overallStatsChart: ChartConfiguration['data'] | null = null;
  moodChart: ChartConfiguration['data'] | null = null;
  weekdayChart: ChartConfiguration['data'] | null = null;

  dailyChartOptions: ChartConfiguration['options'];
  weeklyChartOptions: ChartConfiguration['options'];
  pieChartOptions: ChartConfiguration['options'];
  lineChartOptions: ChartConfiguration['options'];

  overallGoal = 0;
  overallCompleted = 0;
  overallLeft = 0;
  overallPercentage = 0;

  topHabits: Array<{ habit: Habit; stats: HabitStats }> = [];
  insights: DashboardInsights | null = null;
  gamification: GamificationStats | null = null;
  integrations: IntegrationStatus | null = null;
  dueToday = 0;
  heatmap: Array<{ date: string; score: number }> = [];

  constructor(
    private habitService: HabitService,
    private dialog: MatDialog,
    private themeService: ThemeService
  ) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.habitService.habits$.subscribe((habits) => {
      this.habits = habits.filter((habit) => !habit.archived);
      this.refreshDashboard();
    });

    this.habitService.gamification$.subscribe((stats) => {
      this.gamification = stats;
    });

    this.habitService.integrationStatus$.subscribe((status) => {
      this.integrations = status;
    });
  }

  private refreshDashboard(): void {
    this.updateCalendar();
    this.updateCharts();
    this.updateOverallStats();
    this.updateTopHabits();
    this.insights = this.habitService.getDashboardInsights();
    this.heatmap = this.habitService.getLast28DayHeatmap();
    this.dueToday = this.habitService.getDueHabitsForDate(new Date()).length;
  }

  private initializeChartOptions(): void {
    const isDark = this.themeService.isDarkMode();
    const textColor = isDark ? '#e2e8f0' : '#0f172a';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)';

    this.dailyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { display: false }
        }
      }
    };

    this.weeklyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { display: false }
        }
      }
    };

    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor }
        }
      }
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor, maxRotation: 45 },
          grid: { display: false }
        }
      }
    };
  }

  updateCalendar(): void {
    this.daysInMonth = [];
    const days = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      this.daysInMonth.push(i);
    }
  }

  onMonthChange(): void {
    this.refreshDashboard();
  }

  toggleCompletion(habitId: string, day: number): void {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    this.habitService.toggleHabitCompletion(habitId, dateStr);
  }

  recoverWithShield(habitId: string, day: number): void {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    this.habitService.useStreakShield(habitId, dateStr);
    this.refreshDashboard();
  }

  isCompleted(habitId: string, day: number): boolean {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    return this.habitService.isHabitCompleted(habitId, dateStr);
  }

  isScheduled(habit: Habit, day: number): boolean {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    return this.habitService.isHabitScheduledForDay(habit, date);
  }

  getWeekDay(day: number): string {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    return this.weekDays[date.getDay()];
  }

  private updateCharts(): void {
    this.updateDailyProgressChart();
    this.updateWeeklyProgressChart();
    this.updateOverallStatsChart();
    this.updateMoodChart();
    this.updateWeekdayChart();
  }

  private updateDailyProgressChart(): void {
    const labels: string[] = [];
    const data: number[] = [];

    for (let day = 1; day <= Math.min(31, this.daysInMonth.length); day++) {
      labels.push(day.toString());
      const completedCount = this.habits.filter((h) => this.isCompleted(h.id, day)).length;
      const dueCount = this.habits.filter((h) => this.isScheduled(h, day)).length;
      const percentage = dueCount > 0 ? (completedCount / dueCount) * 100 : 0;
      data.push(Math.round(percentage));
    }

    this.dailyProgressChart = {
      labels,
      datasets: [{
        label: 'Daily Progress %',
        data,
        backgroundColor: 'rgba(14, 165, 233, 0.6)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
        borderRadius: 6
      }]
    };
  }

  private updateWeeklyProgressChart(): void {
    const weeks = Math.ceil(this.daysInMonth.length / 7);
    const labels: string[] = [];
    const data: number[] = [];

    for (let week = 0; week < weeks; week++) {
      labels.push(`Week ${week + 1}`);
      const startDay = week * 7 + 1;
      const endDay = Math.min((week + 1) * 7, this.daysInMonth.length);

      let weekTotal = 0;
      let weekCount = 0;

      for (let day = startDay; day <= endDay; day++) {
        const completedCount = this.habits.filter((h) => this.isCompleted(h.id, day)).length;
        const dueCount = this.habits.filter((h) => this.isScheduled(h, day)).length;
        weekTotal += completedCount;
        weekCount += dueCount;
      }

      const percentage = weekCount > 0 ? (weekTotal / weekCount) * 100 : 0;
      data.push(Math.round(percentage));
    }

    this.weeklyProgressChart = {
      labels,
      datasets: [{
        label: 'Weekly Progress %',
        data,
        backgroundColor: 'rgba(20, 184, 166, 0.65)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
        borderRadius: 6
      }]
    };
  }

  private updateOverallStatsChart(): void {
    this.overallStatsChart = {
      labels: ['Completed', 'Remaining'],
      datasets: [{
        data: [this.overallCompleted, this.overallLeft],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(148, 163, 184, 0.35)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(148, 163, 184, 0.65)'
        ],
        borderWidth: 2
      }]
    };
  }

  private updateMoodChart(): void {
    const moodEntries = this.habitService.getMoodEntries().slice(-30);

    this.moodChart = {
      labels: moodEntries.map((e) => {
        const date = new Date(e.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: 'Mood',
          data: moodEntries.map((e) => e.mood * 10),
          borderColor: 'rgba(249, 115, 22, 1)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Motivation',
          data: moodEntries.map((e) => e.motivation * 10),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  private updateWeekdayChart(): void {
    const data = this.habitService.getWeekdayCompletionDistribution(this.selectedMonth, this.selectedYear);
    this.weekdayChart = {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [{
        label: 'Completion by Weekday %',
        data,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        tension: 0.3,
        fill: true
      }]
    };
  }

  private updateOverallStats(): void {
    this.overallGoal = 0;
    this.overallCompleted = 0;

    this.habits.forEach((habit) => {
      this.overallGoal += habit.goal;
      const stats = this.habitService.getHabitStats(habit.id, this.selectedMonth, this.selectedYear);
      this.overallCompleted += stats.completedCount;
    });

    this.overallLeft = Math.max(0, this.overallGoal - this.overallCompleted);
    this.overallPercentage = this.overallGoal > 0
      ? Math.round((this.overallCompleted / this.overallGoal) * 100)
      : 0;
  }

  private updateTopHabits(): void {
    const habitsWithStats = this.habits.map((habit) => ({
      habit,
      stats: this.habitService.getHabitStats(habit.id, this.selectedMonth, this.selectedYear)
    }));

    this.topHabits = habitsWithStats
      .sort((a, b) => b.stats.completionRate - a.stats.completionRate)
      .slice(0, 5);
  }

  getHabitStreak(habitId: string): number {
    return this.habitService.getHabitStats(habitId, this.selectedMonth, this.selectedYear).currentStreak;
  }

  openAddHabitDialog(): void {
    const dialogRef = this.dialog.open(HabitDialogComponent, {
      width: '720px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.habitService.addHabit(result);
      }
    });
  }

  openEditHabitDialog(habit: Habit): void {
    const dialogRef = this.dialog.open(HabitDialogComponent, {
      width: '720px',
      data: { habit, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.habitService.updateHabit(habit.id, result);
      }
    });
  }

  deleteHabit(habitId: string): void {
    if (confirm('Delete this habit permanently?')) {
      this.habitService.deleteHabit(habitId);
    }
  }

  archiveHabit(habitId: string): void {
    this.habitService.archiveHabit(habitId);
  }

  async enableNotifications(): Promise<void> {
    await this.habitService.enableBrowserNotifications();
  }

  sendReminderPreview(): void {
    this.habitService.sendDailyReminderPreview();
  }

  exportCalendar(): void {
    this.habitService.exportCalendarICS();
  }

  getHeatClass(score: number): string {
    return `h-${score}`;
  }
}