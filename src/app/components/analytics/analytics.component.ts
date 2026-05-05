import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { HabitService } from '../../services/habit.service';
import { DashboardInsights } from '../../models/habit.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent implements OnInit {
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Completion Rate (%)',
        backgroundColor: 'rgba(51, 94, 255, 0.18)',
        borderColor: '#335eff',
        pointBackgroundColor: '#335eff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#335eff',
        fill: 'origin',
        tension: 0.4
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public lineChartType: ChartType = 'line';

  public monthlyBarChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Monthly completion (%)',
        backgroundColor: 'rgba(34, 211, 238, 0.35)',
        borderColor: '#22d3ee',
        borderWidth: 1,
        borderRadius: 10
      }
    ],
    labels: []
  };

  public monthlyBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public monthlyBarChartType: ChartType = 'bar';

  public consistencyBarChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Habit consistency (%)',
        backgroundColor: 'rgba(102, 126, 234, 0.35)',
        borderColor: '#667eea',
        borderWidth: 1,
        borderRadius: 10
      }
    ],
    labels: []
  };

  public consistencyBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => value + '%' }
      }
    },
    plugins: { legend: { display: false } }
  };

  public consistencyBarChartType: ChartType = 'bar';

  insights?: DashboardInsights;

  heatmapCells: { dateKey: string; completionRate: number | null; dueCount: number }[] = [];
  heatmapCols = 0;
  readonly heatmapRows = 7;
  readonly heatmapRowIndices = Array.from({ length: 7 }, (_, i) => i);
  heatmapColIndices: number[] = [];

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    const weekly = this.habitService.getWeeklyStats();
    this.lineChartData.labels = weekly.map((s) => {
      const d = parseDateKey(s.date);
      return d.toLocaleDateString(undefined, { weekday: 'short' });
    });
    this.lineChartData.datasets[0].data = weekly.map((s) => s.completionRate);

    const monthly = this.habitService.getMonthlyStats(6);
    this.monthlyBarChartData.labels = monthly.map((m) => m.month);
    this.monthlyBarChartData.datasets[0].data = monthly.map((m) => m.completionRate);

    this.insights = this.habitService.getWeekendMissInsight();

    this.heatmapCells = this.habitService.getActivityHeatmapData(52);
    this.heatmapCols = Math.ceil(this.heatmapCells.length / this.heatmapRows);
    this.heatmapColIndices = Array.from({ length: this.heatmapCols }, (_, i) => i);

    this.buildConsistencyChart();
  }

  private buildConsistencyChart(): void {
    const habits = this.habitService.getActiveHabits();
    const today = new Date();
    const t30 = new Date(today);
    t30.setDate(today.getDate() - 29);

    const rates = habits.map((habit) => {
      const completedSet = new Set(habit.completedDates);
      let dueTotal = 0;
      let completedTotal = 0;

      for (let d = new Date(t30); d <= today; d.setDate(d.getDate() + 1)) {
        if (!this.habitService.isHabitScheduledForDay(habit, d)) continue;
        dueTotal += 1;
        const key = toDateKey(d);
        if (completedSet.has(key)) completedTotal += 1;
      }

      const rate = dueTotal === 0 ? 0 : Math.round((completedTotal / dueTotal) * 100);
      return { name: habit.name, rate };
    });

    rates.sort((a, b) => b.rate - a.rate);
    const top = rates.slice(0, 6);

    this.consistencyBarChartData.labels = top.map((x) => x.name);
    this.consistencyBarChartData.datasets[0].data = top.map((x) => x.rate);
  }

  getHeatmapClass(rate: number | null): string {
    if (rate === null) return 'bg-surface-muted/70';
    if (rate >= 100) return 'bg-emerald-400/75';
    if (rate >= 75) return 'bg-primary-500/60';
    if (rate >= 50) return 'bg-primary-500/40';
    if (rate >= 25) return 'bg-primary-500/25';
    if (rate > 0) return 'bg-primary-500/15';
    return 'bg-surface-muted/70';
  }

  getHeatmapCell(row: number, col: number): { completionRate: number | null; dueCount: number } | null {
    const idx = col * this.heatmapRows + row;
    const cell = this.heatmapCells[idx];
    if (!cell) return null;
    return { completionRate: cell.completionRate, dueCount: cell.dueCount };
  }

  getHeatmapTitle(row: number, col: number): string {
    const cell = this.getHeatmapCell(row, col);
    if (!cell || cell.dueCount === 0) return 'No habits due';
    return `${cell.completionRate ?? 0}% of due habits completed`;
  }
}

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map((v) => Number(v));
  return new Date(y, m - 1, d);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
