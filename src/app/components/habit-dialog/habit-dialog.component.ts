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
    .dialog-container { padding: 8px; min-width: 560px; }
    h2 { display: flex; align-items: center; gap: 12px; margin: 0; padding: 16px; color: #0f766e; }
    mat-dialog-content { padding: 0 24px 24px !important; max-height: 70vh; overflow-y: auto; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .full-width { width: 100%; }
    .form-group { margin-top: 18px; }
    .section-label { display: block; margin-bottom: 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #475569; }
    .weekday-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
    .weekday-btn { border: 1px solid #cbd5e1; border-radius: 10px; height: 36px; background: #fff; cursor: pointer; font-weight: 600; }
    .weekday-btn.selected { background: #0f766e; color: #fff; border-color: #0f766e; }
    .icon-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; }
    .icon-btn { width: 48px; height: 48px; border: 2px solid #e2e8f0; border-radius: 12px; background: white; font-size: 24px; cursor: pointer; }
    .icon-btn.selected { border-color: #0f766e; background: #ecfeff; }
    .color-grid { display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px; }
    .color-btn { width: 34px; height: 34px; border: 2px solid transparent; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .color-btn.selected { border-color: #0f172a; }
    mat-dialog-actions { padding: 16px 24px; display: flex; justify-content: flex-end; gap: 10px; }
    @media (max-width: 720px) {
      .dialog-container { min-width: unset; width: 100%; }
      .grid-2 { grid-template-columns: 1fr; }
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
