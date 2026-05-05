import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md bg-surface border border-line rounded-3xl shadow-sm p-8 space-y-6">
        <div class="space-y-2">
          <h1 class="text-3xl font-black text-ink">Welcome back</h1>
          <p class="text-sm text-muted">Log in to keep your habits on track.</p>
        </div>

        <form class="space-y-4" (ngSubmit)="onSubmit()">
          <div class="space-y-1">
            <label for="login-email" class="text-xs font-bold text-muted uppercase tracking-wider">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              class="w-full bg-surface-muted p-3 rounded-xl font-semibold text-ink outline-none border border-transparent focus:border-primary-500 transition-colors"
              placeholder="you@example.com" />
          </div>

          <div class="space-y-1">
            <label for="login-password" class="text-xs font-bold text-muted uppercase tracking-wider">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              class="w-full bg-surface-muted p-3 rounded-xl font-semibold text-ink outline-none border border-transparent focus:border-primary-500 transition-colors"
              placeholder="••••••••" />
          </div>

          <div *ngIf="error" class="text-sm text-red-500 font-semibold">{{ error }}</div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full py-3 rounded-2xl bg-primary-600 text-white font-bold shadow-md hover:bg-primary-700 transition-colors disabled:opacity-60">
            {{ loading ? 'Signing in...' : 'Login' }}
          </button>
        </form>

        <p class="text-sm text-muted">
          New here?
          <a routerLink="/signup" class="font-bold text-primary-600 hover:text-primary-700">Create an account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;
    try {
      await this.authService.login(this.email, this.password);
      await this.router.navigateByUrl('/');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Login failed.';
    } finally {
      this.loading = false;
    }
  }
}
