import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { Badge, GamificationStats } from '../../models/habit.model';
import { PreferencesService, PreferencesStateV1 } from '../../services/preferences.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserRecord } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
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

  prefs: PreferencesStateV1 | null = null;
  currentUser: UserRecord | null = null;
  nameDraft = '';
  totalHabits = 0;
  completionRate = 0;
  longestStreak = 0;
  totalCompletedDays = 0;
  allBadges: Badge[] = [
    { id: 'beginner', label: 'Beginner', description: 'Reach a 3-day streak', icon: '🥉' },
    { id: 'consistent', label: 'Consistent', description: 'Reach a 7-day streak', icon: '🥈' },
    { id: 'master', label: 'Master', description: 'Reach a 30-day streak', icon: '🥇' },
    { id: 'perfect_day', label: 'Perfect Day', description: 'Complete every habit due today', icon: '✨' },
    { id: 'perfect_week', label: 'Perfect Week', description: 'Complete every habit due this week', icon: '💎' },
    { id: 'streak_7', label: '7-day Streak', description: '7-day streak across habits', icon: '🔥' },
    { id: 'streak_30', label: '30-day Streak', description: '30-day streak across habits', icon: '🏆' }
  ];
  private subscriptions: Subscription[] = [];

  constructor(
    private habitService: HabitService,
    private preferencesService: PreferencesService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.habitService.gamification$.subscribe((s) => {
        this.stats = s;
        this.completionRate = s.dailyCompletionPercent;
      })
    );

    this.subscriptions.push(
      this.habitService.habits$.subscribe((habits) => {
        this.totalHabits = habits.filter((habit) => !habit.archived).length;
        const progress = this.habitService.getAllHabitProgress();
        this.longestStreak = Math.max(0, ...progress.map((item) => item.longestStreak));
        this.totalCompletedDays = progress.reduce((sum, item) => sum + item.totalCompletions, 0);
      })
    );

    this.subscriptions.push(
      this.preferencesService.state$.subscribe((p) => (this.prefs = p))
    );

    this.subscriptions.push(
      this.userService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        this.nameDraft = user?.name ?? '';
      })
    );

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async requestNotifications(): Promise<void> {
    if (typeof Notification === 'undefined') return;

    try {
      const permission = await Notification.requestPermission();
      this.preferencesService.setNotificationPermission(permission);
      this.preferencesService.setNotificationsEnabled(permission === 'granted');
    } catch {
      // Ignore; the UI will reflect unchanged permission state.
    }
  }

  toggleSound(): void {
    const next = !(this.prefs?.sound.enabled ?? true);
    this.preferencesService.setSoundEnabled(next);
  }

  isBadgeUnlocked(badge: Badge): boolean {
    return this.stats.badges.some((earned) => earned.id === badge.id);
  }

  saveName(): void {
    const trimmed = this.nameDraft.trim();
    if (!this.currentUser || !trimmed) return;
    this.userService.updateUser(this.currentUser.id, { name: trimmed });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}

