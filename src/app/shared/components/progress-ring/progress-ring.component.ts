import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type RingTone = 'primary' | 'emerald' | 'amber' | 'slate';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-center" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 36 36" class="block">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke-width="4"
          class="opacity-20"
          [ngClass]="trackClass"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke-width="4"
          stroke-linecap="round"
          [ngClass]="ringClass"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center leading-tight">
          <div class="text-sm font-black text-ink">
            {{ valueText }}
          </div>
          <div class="text-[10px] font-bold uppercase tracking-tight" [ngClass]="toneTextClass">
            {{ caption }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProgressRingComponent {
  @Input() percent = 0; // 0..100
  @Input() valueText: string | number = '';
  @Input() caption = '';
  @Input() tone: RingTone = 'primary';
  @Input() size = 54;

  private readonly radius = 14;
  readonly circumference = 2 * Math.PI * this.radius;

  get dashOffset(): number {
    const clamped = Math.max(0, Math.min(100, this.percent));
    const progress = clamped / 100;
    return this.circumference * (1 - progress);
  }

  get trackClass(): string {
    if (this.tone === 'emerald') return 'stroke-emerald-400';
    if (this.tone === 'amber') return 'stroke-amber-400';
    if (this.tone === 'slate') return 'stroke-slate-400';
    return 'stroke-primary-500';
  }

  get ringClass(): string {
    if (this.tone === 'emerald') return 'stroke-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.35)]';
    if (this.tone === 'amber') return 'stroke-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.35)]';
    if (this.tone === 'slate') return 'stroke-slate-300 drop-shadow-[0_0_10px_rgba(148,163,184,0.25)]';
    return 'stroke-primary-500 drop-shadow-[0_0_10px_rgba(51,94,255,0.35)]';
  }

  get toneTextClass(): string {
    if (this.tone === 'emerald') return 'text-emerald-500';
    if (this.tone === 'amber') return 'text-amber-500';
    if (this.tone === 'slate') return 'text-muted';
    return 'text-primary-500';
  }
}

