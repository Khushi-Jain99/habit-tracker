import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { GamificationStats } from '../../models/habit.model';
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
      this.habitService.gamification$.subscribe((s) => (this.stats = s))
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

