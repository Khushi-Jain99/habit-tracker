import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { animatePress, animatePageIn } from '../../utils/motion.util';
import { HabitType } from '../../models/habit.model';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-add-habit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-habit.component.html'
})
export class AddHabitComponent implements AfterViewInit {
  name = '';
  type: HabitType = 'boolean';
  targetValue = 1;
  unit = 'times';
  frequencyPerWeek = 7;
  reminderTime = '08:00';
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  frequencyType: 'daily' | 'weekly' | 'custom' = 'daily';
  // User-defined grouping/tag (e.g., Fitness, Health)
  category = 'General';
  goal = 20;
  weekDays: number[] = [0, 1, 2, 3, 4, 5, 6];
  icon = '⭐';
  color = '#0ea5e9';

  readonly days = [
    { label: 'S', value: 0 },
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 }
  ];

  readonly icons = ['⭐', '📚', '💪', '🏃', '💧', '🧘', '💻', '🎯', '🎸', '🌙', '🍎', '🧠'];
  readonly colors = ['#0ea5e9', '#10b981', '#f97316', '#ef4444', '#6366f1', '#14b8a6', '#d946ef', '#f59e0b'];
  readonly difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  readonly categories: string[] = ['General', 'Fitness', 'Health', 'Learning', 'Productivity', 'Mindfulness'];

  constructor(
    private habitService: HabitService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    animatePageIn('.add-page');
  }

  toggleDay(day: number): void {
    if (this.frequencyType === 'daily') {
      this.weekDays = [0, 1, 2, 3, 4, 5, 6];
      this.frequencyPerWeek = 7;
      return;
    }

    if (this.frequencyType === 'weekly') {
      // One day per week for "Weekly" habits.
      this.weekDays = [day];
      this.frequencyPerWeek = 1;
      return;
    }

    this.weekDays = this.weekDays.includes(day)
      ? this.weekDays.filter((value) => value !== day)
      : [...this.weekDays, day].sort((a, b) => a - b);

    this.frequencyPerWeek = this.weekDays.length;
  }

  setFrequencyType(next: 'daily' | 'weekly' | 'custom'): void {
    this.frequencyType = next;
    if (next === 'daily') {
      this.weekDays = [0, 1, 2, 3, 4, 5, 6];
      this.frequencyPerWeek = 7;
      return;
    }

    if (next === 'weekly') {
      this.weekDays = [1];
      this.frequencyPerWeek = 1;
      return;
    }

    // custom
    if (!this.weekDays.length) this.weekDays = [1, 3, 5];
    this.frequencyPerWeek = this.weekDays.length;
  }

  save(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement | null;
    if (button) {
      animatePress(button);
    }

    if (!this.isValid()) {
      return;
    }

    this.habitService.addHabit({
      name: this.name.trim(),
      icon: this.icon,
      color: this.color,
      goal: this.goal,
      type: this.type,
      targetValue: this.targetValue,
      unit: this.unit.trim() || 'times',
      frequencyPerWeek: this.frequencyPerWeek,
      weekDays: this.weekDays,
      frequencyType: this.frequencyType,
      reminderTime: this.reminderTime,
      difficulty: this.difficulty,
      category: this.category
    });

    this.router.navigateByUrl('/');
  }

  back(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement | null;
    if (button) {
      animatePress(button);
    }
    this.router.navigateByUrl('/');
  }

  isValid(): boolean {
    return this.name.trim().length > 0
      && this.targetValue > 0
      && this.frequencyPerWeek > 0
      && this.frequencyPerWeek <= 7
      && this.goal > 0
      && this.goal <= 31
      && this.weekDays.length > 0;
  }
}
