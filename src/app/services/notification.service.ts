import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HabitService } from './habit.service';
import { PreferencesService } from './preferences.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private readonly SENT_KEY = 'habitflow_notification_sent_v1';

  private intervalId: number | undefined;
  private prefsSub: Subscription;

  constructor(
    private habitService: HabitService,
    private preferencesService: PreferencesService
  ) {
    this.prefsSub = this.preferencesService.state$.subscribe(() => {
      this.syncScheduler();
    });
    // Initial sync.
    this.syncScheduler();
  }

  ngOnDestroy(): void {
    this.prefsSub.unsubscribe();
    this.stop();
  }

  private syncScheduler(): void {
    const prefs = this.preferencesService.getSnapshot();

    const permission = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    const enabled = Boolean(prefs.notifications.enabled) && permission === 'granted';

    if (!enabled) {
      this.stop();
      return;
    }

    if (this.intervalId !== undefined) return;

    // Check frequently for "basic" reminders while the app is open.
    this.intervalId = window.setInterval(() => this.tick(), 30_000);
    // Run once immediately so "Enable" feels responsive.
    this.tick();
  }

  private stop(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private tick(): void {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const timeKey = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateKey = this.toDateKey(now);

    const dueHabits = this.habitService.getDueHabitsForDate(now);
    if (!dueHabits.length) return;

    const sentMap = this.loadSentMap();

    for (const habit of dueHabits) {
      if (!habit.reminderTime) continue;
      if (habit.reminderTime !== timeKey) continue;
      if (this.habitService.isHabitCompleted(habit.id, now)) continue;

      const sentKey = `${habit.id}|${dateKey}|${timeKey}`;
      if (sentMap[sentKey]) continue;

      // "Basic" reminder; browser will display.
      // eslint-disable-next-line no-new
      new Notification('HabitFlow Reminder', {
        body: `${habit.icon} ${habit.name} — time to check in.`,
        tag: sentKey
      });

      sentMap[sentKey] = Date.now();
    }

    this.persistSentMap(sentMap);
  }

  private loadSentMap(): Record<string, number> {
    try {
      const raw = localStorage.getItem(this.SENT_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, number>;
    } catch {
      return {};
    }
  }

  private persistSentMap(map: Record<string, number>): void {
    try {
      localStorage.setItem(this.SENT_KEY, JSON.stringify(map));
    } catch {
      // Ignore storage errors.
    }
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

