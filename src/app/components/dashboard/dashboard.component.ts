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
import { Habit, HabitStats } from '../../models/habit.model';
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
  
  dailyChartOptions: ChartConfiguration['options'];
  weeklyChartOptions: ChartConfiguration['options'];
  pieChartOptions: ChartConfiguration['options'];
  lineChartOptions: ChartConfiguration['options'];
  
  overallGoal = 0;
  overallCompleted = 0;
  overallLeft = 0;
  overallPercentage = 0;
  
  topHabits: Array<{ habit: Habit; stats: HabitStats }> = [];

  constructor(
    private habitService: HabitService,
    private dialog: MatDialog,
    private themeService: ThemeService
  ) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.habitService.habits$.subscribe(habits => {
      this.habits = habits;
      this.updateCalendar();
      this.updateCharts();
      this.updateOverallStats();
      this.updateTopHabits();
    });
  }

  private initializeChartOptions(): void {
    const isDark = this.themeService.isDarkMode();
    const textColor = isDark ? '#e0e0e0' : '#333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    this.dailyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#1a1a2e' : 'white',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#667eea' : '#e0e0e0',
          borderWidth: 1
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
          ticks: { color: textColor },
          grid: { display: false }
        }
      }
    };

    this.weeklyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#1a1a2e' : 'white',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#667eea' : '#e0e0e0',
          borderWidth: 1
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
        },
        tooltip: {
          backgroundColor: isDark ? '#1a1a2e' : 'white',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#667eea' : '#e0e0e0',
          borderWidth: 1
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
        },
        tooltip: {
          backgroundColor: isDark ? '#1a1a2e' : 'white',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: isDark ? '#667eea' : '#e0e0e0',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
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
    this.updateCalendar();
    this.updateCharts();
    this.updateOverallStats();
    this.updateTopHabits();
  }

  toggleCompletion(habitId: string, day: number): void {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    this.habitService.toggleHabitCompletion(habitId, dateStr);
  }

  isCompleted(habitId: string, day: number): boolean {
    const date = new Date(this.selectedYear, this.selectedMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    return this.habitService.isHabitCompleted(habitId, dateStr);
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
  }

  private updateDailyProgressChart(): void {
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let day = 1; day <= Math.min(31, this.daysInMonth.length); day++) {
      labels.push(day.toString());
      const completedCount = this.habits.filter(h => 
        this.isCompleted(h.id, day)
      ).length;
      const percentage = this.habits.length > 0 ? (completedCount / this.habits.length) * 100 : 0;
      data.push(Math.round(percentage));
    }

    this.dailyProgressChart = {
      labels,
      datasets: [{
        label: 'Daily Progress %',
        data,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
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
        const completedCount = this.habits.filter(h => 
          this.isCompleted(h.id, day)
        ).length;
        weekTotal += completedCount;
        weekCount += this.habits.length;
      }
      
      const percentage = weekCount > 0 ? (weekTotal / weekCount) * 100 : 0;
      data.push(Math.round(percentage));
    }

    this.weeklyProgressChart = {
      labels,
      datasets: [{
        label: 'Weekly Progress %',
        data,
        backgroundColor: 'rgba(118, 75, 162, 0.6)',
        borderColor: 'rgba(118, 75, 162, 1)',
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
          'rgba(102, 126, 234, 0.8)',
          'rgba(200, 200, 200, 0.3)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(200, 200, 200, 0.5)'
        ],
        borderWidth: 2
      }]
    };
  }

  private updateMoodChart(): void {
    const moodEntries = this.habitService.getMoodEntries().slice(-30);
    
    this.moodChart = {
      labels: moodEntries.map(e => {
        const date = new Date(e.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: 'Mood',
          data: moodEntries.map(e => e.mood),
          borderColor: 'rgba(255, 107, 107, 1)',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Motivation',
          data: moodEntries.map(e => e.motivation),
          borderColor: 'rgba(78, 205, 196, 1)',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  private updateOverallStats(): void {
    this.overallGoal = 0;
    this.overallCompleted = 0;
    
    this.habits.forEach(habit => {
      this.overallGoal += habit.goal;
      const stats = this.habitService.getHabitStats(
        habit.id,
        this.selectedMonth,
        this.selectedYear
      );
      this.overallCompleted += stats.completedCount;
    });
    
    this.overallLeft = Math.max(0, this.overallGoal - this.overallCompleted);
    this.overallPercentage = this.overallGoal > 0 
      ? Math.round((this.overallCompleted / this.overallGoal) * 100)
      : 0;
  }

  private updateTopHabits(): void {
    const habitsWithStats = this.habits.map(habit => ({
      habit,
      stats: this.habitService.getHabitStats(
        habit.id,
        this.selectedMonth,
        this.selectedYear
      )
    }));

    this.topHabits = habitsWithStats
      .sort((a, b) => b.stats.completionRate - a.stats.completionRate)
      .slice(0, 5);
  }

  getHabitStreak(habitId: string): number {
    return this.habitService.getHabitStats(
      habitId,
      this.selectedMonth,
      this.selectedYear
    ).currentStreak;
  }

  openAddHabitDialog(): void {
    const dialogRef = this.dialog.open(HabitDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.habitService.addHabit(result);
      }
    });
  }

  openEditHabitDialog(habit: Habit): void {
    const dialogRef = this.dialog.open(HabitDialogComponent, {
      width: '500px',
      data: { habit, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.habitService.updateHabit(habit.id, result);
      }
    });
  }

  deleteHabit(habitId: string): void {
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      this.habitService.deleteHabit(habitId);
    }
  }
}
