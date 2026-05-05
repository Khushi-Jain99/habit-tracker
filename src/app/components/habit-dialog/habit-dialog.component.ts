import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Habit, HabitType } from '../../models/habit.model';

interface DialogData {
  habit?: Habit;
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-habit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'add' ? 'add_circle' : 'edit' }}</mat-icon>
        {{ data.mode === 'add' ? 'Create Habit' : 'Edit Habit' }}
      </h2>

      <mat-dialog-content>
        <div class="dialog-shell">
          <section class="form-card">
            <div class="card-header">
              <h3>Basic Info</h3>
              <p>Define the habit name, type, and target.</p>
            </div>
            <div class="grid-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Habit Name</mat-label>
                <input matInput [(ngModel)]="habitName" placeholder="e.g., Morning Exercise">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Type</mat-label>
                <mat-select [(ngModel)]="habitType">
                  <mat-option value="boolean">Binary (Done / Not done)</mat-option>
                  <mat-option value="count">Count (e.g., 8 glasses)</mat-option>
                  <mat-option value="duration">Duration (e.g., 20 min)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Target Value</mat-label>
                <input matInput type="number" [(ngModel)]="targetValue" min="1">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Unit</mat-label>
                <input matInput [(ngModel)]="unit" placeholder="times, min, pages">
              </mat-form-field>
            </div>
          </section>

          <section class="form-card">
            <div class="card-header">
              <h3>Settings</h3>
              <p>Set cadence, reminders, and category details.</p>
            </div>
            <div class="grid-2">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Frequency Type</mat-label>
                <mat-select [(ngModel)]="frequencyType" (ngModelChange)="onFrequencyTypeChange($event)">
                  <mat-option value="daily">Daily</mat-option>
                  <mat-option value="weekly">Weekly</mat-option>
                  <mat-option value="custom">Custom frequency</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reminder Time</mat-label>
                <input matInput type="time" [(ngModel)]="reminderTime">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category (Tag)</mat-label>
                <mat-select [(ngModel)]="category">
                  <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Difficulty</mat-label>
                <mat-select [(ngModel)]="difficulty">
                  <mat-option value="easy">Easy</mat-option>
                  <mat-option value="medium">Medium</mat-option>
                  <mat-option value="hard">Hard</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Monthly Goal (days)</mat-label>
                <input matInput type="number" [(ngModel)]="habitGoal" min="1" max="31">
              </mat-form-field>
            </div>
          </section>

          <section class="form-card">
            <div class="card-header">
              <h3>Schedule</h3>
              <p>Pick weekdays, icon, and color.</p>
            </div>

            <div class="form-group">
              <label class="section-label">Schedule (Weekdays)</label>
              <div class="weekday-grid">
                <button
                  *ngFor="let day of weekdays"
                  type="button"
                  class="weekday-btn"
                  [class.selected]="weekDays.includes(day.value)"
                  (click)="toggleDay(day.value)">
                  {{ day.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="section-label">Choose an Icon</label>
              <div class="icon-grid">
                <button
                  *ngFor="let icon of icons"
                  type="button"
                  class="icon-btn"
                  [class.selected]="habitIcon === icon"
                  (click)="habitIcon = icon">
                  {{ icon }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="section-label">Choose a Color</label>
              <div class="color-grid">
                <button
                  *ngFor="let color of colors"
                  type="button"
                  class="color-btn"
                  [class.selected]="habitColor === color"
                  [style.background]="color"
                  (click)="habitColor = color">
                  <mat-icon *ngIf="habitColor === color">check</mat-icon>
                </button>
              </div>
            </div>
          </section>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!isValid()">
          {{ data.mode === 'add' ? 'Create Habit' : 'Save Changes' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 10px 12px 6px; min-width: 640px; color: rgb(var(--color-text)); }
    h2 { display: flex; align-items: center; gap: 12px; margin: 0 0 16px; padding: 16px 16px 4px; font-size: 22px; font-weight: 800; color: rgb(var(--color-text)); }
    mat-dialog-content { padding: 0 24px 28px !important; max-height: 72vh; overflow-y: auto; }
    .dialog-shell { display: grid; gap: 18px; }
    .form-card { background: rgb(var(--color-surface)); border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; box-shadow: 0 10px 24px rgba(var(--color-shadow), 0.08); }
    .card-header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
    .card-header h3 { margin: 0; font-size: 15px; font-weight: 800; color: rgb(var(--color-text)); }
    .card-header p { margin: 0; font-size: 12px; color: rgb(var(--color-muted)); }
    .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .full-width { width: 100%; }
    .form-group { margin-top: 16px; }
    .section-label { display: block; margin-bottom: 10px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: rgb(var(--color-muted)); }
    .weekday-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
    .weekday-btn { border: 1px solid rgb(var(--color-border)); border-radius: 999px; height: 38px; background: rgb(var(--color-surface-muted)); cursor: pointer; font-weight: 600; color: rgb(var(--color-text)); transition: all 0.2s ease; }
    .weekday-btn:hover { border-color: rgb(var(--color-primary-500)); background: rgb(var(--color-surface)); }
    .weekday-btn.selected { background: linear-gradient(135deg, rgb(var(--color-primary-500)), rgb(var(--color-primary-600))); color: #fff; border-color: transparent; box-shadow: 0 8px 16px rgba(var(--color-shadow), 0.12); }
    .icon-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; }
    .icon-btn { width: 48px; height: 48px; border: 1px solid rgb(var(--color-border)); border-radius: 14px; background: rgb(var(--color-surface-muted)); font-size: 22px; cursor: pointer; transition: all 0.2s ease; }
    .icon-btn:hover { border-color: rgb(var(--color-primary-500)); transform: translateY(-2px); }
    .icon-btn.selected { border-color: rgb(var(--color-primary-500)); background: rgb(var(--color-surface)); box-shadow: 0 8px 16px rgba(var(--color-shadow), 0.12); }
    .color-grid { display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px; }
    .color-btn { width: 34px; height: 34px; border: 2px solid transparent; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
    .color-btn:hover { transform: scale(1.05); }
    .color-btn.selected { border-color: rgb(var(--color-text)); box-shadow: 0 6px 14px rgba(var(--color-shadow), 0.15); }
    mat-dialog-actions { padding: 12px 24px 20px; display: flex; justify-content: flex-end; gap: 10px; }
    mat-dialog-actions button[mat-button] { border: 1px solid rgb(var(--color-border)); border-radius: 999px; padding: 8px 18px; background: transparent; }
    mat-dialog-actions button[mat-raised-button] { border-radius: 999px; padding: 8px 20px; box-shadow: 0 10px 20px rgba(var(--color-shadow), 0.15); }
    mat-dialog-actions button[mat-raised-button]:hover { box-shadow: 0 12px 24px rgba(var(--color-shadow), 0.2); }
    @media (max-width: 720px) {
      .dialog-container { min-width: unset; width: 100%; }
      .dialog-shell { gap: 14px; }
      .grid-2 { grid-template-columns: 1fr; gap: 14px; }
      .icon-grid { grid-template-columns: repeat(6, 1fr); }
      .color-grid { grid-template-columns: repeat(7, 1fr); }
    }
  `]
})
export class HabitDialogComponent {
  habitName = '';
  habitIcon = '⭐';
  habitColor = '#0ea5e9';
  habitGoal = 20;
  habitType: HabitType = 'boolean';
  targetValue = 1;
  unit = 'times';
  frequencyPerWeek = 5;
  reminderTime = '08:30';
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  frequencyType: 'daily' | 'weekly' | 'custom' = 'daily';
  category = 'General';
  weekDays: number[] = [1, 2, 3, 4, 5, 6, 0];

  weekdays = [
    { label: 'S', value: 0 },
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 }
  ];

  icons = [
    '⏰', '🧘', '🚿', '💼', '📚', '🍬', '🍺', '💪',
    '🏃', '🥗', '💧', '😴', '📝', '🎯', '🎨', '🎸',
    '🧠', '❤️', '☕', '🌅', '🌙', '✨', '🔥', '💎',
    '🎓', '💻', '📱', '🎮', '🏋️', '🚴', '🏊', '🧩'
  ];

  colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
    '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#334155', '#0f172a'
  ];

  readonly categories: string[] = ['General', 'Fitness', 'Health', 'Learning', 'Productivity', 'Mindfulness'];

  constructor(
    public dialogRef: MatDialogRef<HabitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.habit) {
      this.habitName = data.habit.name;
      this.habitIcon = data.habit.icon;
      this.habitColor = data.habit.color;
      this.habitGoal = data.habit.goal;
      this.habitType = data.habit.type;
      this.targetValue = data.habit.targetValue;
      this.unit = data.habit.unit;
      this.frequencyPerWeek = data.habit.frequencyPerWeek;
      this.reminderTime = data.habit.reminderTime ?? '08:30';
      this.difficulty = data.habit.difficulty;
      this.weekDays = [...data.habit.weekDays];
      this.frequencyType = data.habit.frequencyType;
      this.category = data.habit.category;
    }

    this.syncFrequencyFromWeekdays();
  }

  onFrequencyTypeChange(next: 'daily' | 'weekly' | 'custom'): void {
    this.frequencyType = next;

    if (next === 'daily') {
      this.weekDays = [0, 1, 2, 3, 4, 5, 6];
    } else if (next === 'weekly') {
      this.weekDays = [1];
    }

    this.syncFrequencyFromWeekdays();
  }

  private syncFrequencyFromWeekdays(): void {
    this.weekDays = Array.from(new Set(this.weekDays)).sort((a, b) => a - b);
    this.frequencyPerWeek = Math.max(1, Math.min(7, this.weekDays.length));
  }

  toggleDay(day: number): void {
    if (this.frequencyType === 'daily') {
      this.weekDays = [0, 1, 2, 3, 4, 5, 6];
      this.syncFrequencyFromWeekdays();
      return;
    }

    if (this.frequencyType === 'weekly') {
      this.weekDays = [day];
      this.syncFrequencyFromWeekdays();
      return;
    }

    if (this.weekDays.includes(day)) {
      this.weekDays = this.weekDays.filter((x) => x !== day);
    } else {
      this.weekDays = [...this.weekDays, day].sort((a, b) => a - b);
    }

    this.syncFrequencyFromWeekdays();
  }

  isValid(): boolean {
    return this.habitName.trim().length > 0
      && this.habitGoal > 0
      && this.habitGoal <= 31
      && this.targetValue > 0
      && this.frequencyPerWeek > 0
      && this.frequencyPerWeek <= 7
      && this.category.trim().length > 0
      && this.weekDays.length > 0;
  }

  onSave(): void {
    if (!this.isValid()) {
      return;
    }

    this.dialogRef.close({
      name: this.habitName.trim(),
      icon: this.habitIcon,
      color: this.habitColor,
      goal: this.habitGoal,
      type: this.habitType,
      targetValue: this.targetValue,
      unit: this.unit.trim() || 'times',
      frequencyPerWeek: this.frequencyPerWeek,
      weekDays: this.weekDays,
      reminderTime: this.reminderTime,
      difficulty: this.difficulty,
      frequencyType: this.frequencyType,
      category: this.category.trim()
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
