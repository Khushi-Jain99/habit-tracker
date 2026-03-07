import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Habit } from '../../models/habit.model';

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
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'add' ? 'add_circle' : 'edit' }}</mat-icon>
        {{ data.mode === 'add' ? 'Add New Habit' : 'Edit Habit' }}
      </h2>
      
      <mat-dialog-content>
        <div class="form-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Habit Name</mat-label>
            <input matInput [(ngModel)]="habitName" placeholder="e.g., Morning Exercise">
          </mat-form-field>
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
        
        <div class="form-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Monthly Goal (days)</mat-label>
            <input matInput type="number" [(ngModel)]="habitGoal" min="1" max="31">
          </mat-form-field>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!isValid()">
          {{ data.mode === 'add' ? 'Add Habit' : 'Save Changes' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 8px;
      min-width: 450px;
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 16px;
      color: #667eea;
      
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }
    
    mat-dialog-content {
      padding: 0 24px 24px !important;
      max-height: 600px;
      overflow-y: auto;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    .section-label {
      display: block;
      font-weight: 600;
      margin-bottom: 12px;
      color: #555;
      font-size: 14px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
    }
    
    .icon-btn {
      width: 48px;
      height: 48px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      background: white;
      font-size: 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        border-color: #667eea;
        transform: scale(1.1);
      }
      
      &.selected {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        transform: scale(1.1);
      }
    }
    
    .color-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
    }
    
    .color-btn {
      width: 48px;
      height: 48px;
      border: 3px solid transparent;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      
      &:hover {
        transform: scale(1.15);
      }
      
      &.selected {
        border-color: #333;
        transform: scale(1.15);
        
        mat-icon {
          color: white;
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    @media (max-width: 600px) {
      .dialog-container {
        min-width: unset;
        width: 100%;
      }
      
      .icon-grid {
        grid-template-columns: repeat(6, 1fr);
      }
      
      .color-grid {
        grid-template-columns: repeat(5, 1fr);
      }
    }
  `]
})
export class HabitDialogComponent {
  habitName = '';
  habitIcon = '⭐';
  habitColor = '#667eea';
  habitGoal = 31;
  
  icons = [
    '⏰', '🧘', '🚿', '💼', '📚', '🍬', '🍺', '💪',
    '🏃', '🥗', '💧', '😴', '📝', '🎯', '🎨', '🎸',
    '🧠', '❤️', '☕', '🌅', '🌙', '✨', '🔥', '💎',
    '🎓', '💻', '📱', '🎮', '🏋️', '🧘‍♀️', '🚴', '🏊'
  ];
  
  colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9',
    '#74B9FF', '#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE', '#FD79A8',
    '#FF7675', '#00B894', '#00CEC9', '#0984E3', '#B2BEC3', '#FDCB6E'
  ];

  constructor(
    public dialogRef: MatDialogRef<HabitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.habit) {
      this.habitName = data.habit.name;
      this.habitIcon = data.habit.icon;
      this.habitColor = data.habit.color;
      this.habitGoal = data.habit.goal;
    }
  }

  isValid(): boolean {
    return this.habitName.trim().length > 0 && this.habitGoal > 0 && this.habitGoal <= 31;
  }

  onSave(): void {
    if (this.isValid()) {
      const result = {
        name: this.habitName.trim(),
        icon: this.habitIcon,
        color: this.habitColor,
        goal: this.habitGoal
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
