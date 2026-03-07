import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from './services/theme.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSlideToggleModule,
    DashboardComponent
  ],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkMode">
      <mat-toolbar class="toolbar">
        <div class="toolbar-content">
          <div class="logo-section">
            <span class="logo-icon">✨</span>
            <h1>Habit Tracker</h1>
          </div>
          <div class="toolbar-actions">
            <mat-slide-toggle 
              [checked]="isDarkMode" 
              (change)="toggleTheme()"
              class="theme-toggle">
              <span class="toggle-label">
                <mat-icon>{{ isDarkMode ? 'dark_mode' : 'light_mode' }}</mat-icon>
              </span>
            </mat-slide-toggle>
          </div>
        </div>
      </mat-toolbar>
      
      <main class="main-content">
        <app-dashboard></app-dashboard>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: background 0.3s ease;
    }

    .dark-theme {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .toolbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .dark-theme .toolbar {
      background: rgba(26, 26, 46, 0.95);
      color: white;
    }

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 32px;
      animation: sparkle 2s ease-in-out infinite;
    }

    @keyframes sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(5deg); }
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dark-theme h1 {
      background: linear-gradient(135deg, #a8b3ff 0%, #c79fff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .theme-toggle {
      ::ng-deep .mat-slide-toggle-bar {
        background: rgba(102, 126, 234, 0.3);
      }
      
      ::ng-deep .mat-slide-toggle-thumb {
        background: #667eea;
      }
    }

    .toggle-label {
      display: flex;
      align-items: center;
    }

    .main-content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }

      h1 {
        font-size: 20px;
      }

      .logo-icon {
        font-size: 24px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.darkMode$.subscribe(darkMode => {
      this.isDarkMode = darkMode;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
