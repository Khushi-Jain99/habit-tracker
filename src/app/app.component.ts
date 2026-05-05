import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { animateMini } from 'motion';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <div class="min-h-screen bg-base transition-colors duration-300">
        <div class="flex">
          <!-- Sidebar -->
          <aside class="hidden md:flex w-72 flex-col sticky top-0 h-screen px-4 py-6">
            <div class="flex items-center gap-3 px-3 mb-6">
              <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <span class="text-xl">🔥</span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-ink leading-tight">Habit Meter</h1>
              </div>
            </div>

            <nav class="flex-1 space-y-2">
              <a
                routerLink="/"
                [routerLinkActiveOptions]="{ exact: true }"
                routerLinkActive="!bg-primary-600 !text-white !border-primary-600"
                class="block px-4 py-3 rounded-2xl text-sm font-bold text-ink/80 bg-surface/70 border border-line/70 hover:bg-surface transition-all shadow-sm"
              >
                Dashboard
              </a>
              <a
                routerLink="/habits"
                routerLinkActive="!bg-primary-600 !text-white !border-primary-600"
                class="block px-4 py-3 rounded-2xl text-sm font-bold text-ink/80 bg-surface/70 border border-line/70 hover:bg-surface transition-all"
              >
                Habits
              </a>
              <a
                routerLink="/analytics"
                routerLinkActive="!bg-primary-600 !text-white !border-primary-600"
                class="block px-4 py-3 rounded-2xl text-sm font-bold text-ink/80 bg-surface/70 border border-line/70 hover:bg-surface transition-all"
              >
                Analytics
              </a>
              <a
                routerLink="/profile"
                routerLinkActive="!bg-primary-600 !text-white !border-primary-600"
                class="block px-4 py-3 rounded-2xl text-sm font-bold text-ink/80 bg-surface/70 border border-line/70 hover:bg-surface transition-all"
              >
                Profile
              </a>
            </nav>

            <div class="mt-auto space-y-3 px-2">
              <a
                routerLink="/add-habit"
                class="block px-4 py-3 rounded-2xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md text-center"
              >
                + New Habit
              </a>
            </div>
          </aside>

          <!-- Content -->
          <div class="flex-1">
            <!-- Mobile header -->
            <header class="md:hidden sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-line">
              <div class="px-4 h-14 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                    <span class="text-lg">🔥</span>
                  </div>
                  <div>
                    <h1 class="text-sm font-bold text-ink leading-tight">HabitFlow</h1>
                    <p class="text-xs text-muted">Level up</p>
                  </div>
                </div>
              </div>
            </header>

            <main class="max-w-7xl mx-auto px-4 py-8" id="page-shell">
              <router-outlet></router-outlet>
            </main>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    // Side-effect service: starts/stops reminder scheduling based on Profile preferences.
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => {
          const pageShell = document.getElementById('page-shell');
          if (pageShell) {
            animateMini(
              pageShell,
              { opacity: ['0.85', '1'], transform: ['translateY(10px)', 'translateY(0px)'] },
              { duration: 0.32, ease: 'easeOut' }
            );
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
