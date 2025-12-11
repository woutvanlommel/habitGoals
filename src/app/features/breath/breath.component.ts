import { Component, signal, OnDestroy, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalService } from '../../core/services/goal.service';

@Component({
  selector: 'app-breath',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container breath-page">
      <div class="header-controls" *ngIf="!isActive()">
        <h3>Duration</h3>
        <div class="duration-selector">
          <button [class.active]="duration() === 1" (click)="duration.set(1)">1 min</button>
          <button [class.active]="duration() === 3" (click)="duration.set(3)">3 min</button>
          <button [class.active]="duration() === 5" (click)="duration.set(5)">5 min</button>
          <button *ngIf="customDuration()" [class.active]="duration() === customDuration()" (click)="duration.set(customDuration()!)">{{ customDuration() }} min</button>
        </div>
      </div>

      <div class="timer" *ngIf="isActive()">{{ timeLeftFormatted() }}</div>
      <div class="instruction">{{ instruction() }}</div>
      
      <div class="circle-container">
        <div class="breathing-circle" [class.inhale]="phase() === 'inhale'" [class.exhale]="phase() === 'exhale'" [class.hold]="phase() === 'hold'"></div>
        <div class="center-dot"></div>
      </div>

      <button (click)="toggleSession()" class="btn btn-primary toggle-btn">
        {{ isActive() ? 'Stop' : 'Start Breathing' }}
      </button>
    </div>
  `,
  styles: [`
    .breath-page {
      height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xl);
    }

    .header-controls {
      text-align: center;
      margin-bottom: 1rem;
    }
    .header-controls h3 {
      font-size: 1rem;
      color: var(--color-text-muted);
      margin-bottom: 0.5rem;
    }
    .duration-selector {
      display: flex;
      gap: 10px;
    }
    .duration-selector button {
      padding: 8px 16px;
      border: 1px solid var(--color-border);
      background: var(--color-bg-secondary);
      border-radius: 20px;
      cursor: pointer;
      color: var(--color-text);
    }
    .duration-selector button.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .timer {
      font-size: 2rem;
      font-weight: 300;
      color: var(--color-text);
      font-variant-numeric: tabular-nums;
    }

    .instruction {
      font-size: 1.5rem;
      color: var(--color-text-muted);
      height: 2rem;
      font-weight: 300;
    }

    .circle-container {
      position: relative;
      width: 250px;
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .breathing-circle {
      width: 100px;
      height: 100px;
      background-color: var(--color-secondary);
      border-radius: 50%;
      opacity: 0.8;
      transform: scale(1);
      transition: transform 4s ease-in-out, background-color 4s ease;
    }

    .breathing-circle.inhale {
      transform: scale(2.5);
      background-color: var(--color-primary);
    }

    .breathing-circle.hold {
      transform: scale(2.5);
      background-color: var(--color-primary);
      opacity: 1;
    }

    .breathing-circle.exhale {
      transform: scale(1);
      background-color: var(--color-secondary);
    }

    .center-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: var(--color-text);
      border-radius: 50%;
      opacity: 0.2;
    }

    .toggle-btn {
      min-width: 150px;
    }
  `]
})
export class BreathComponent implements OnDestroy, OnInit {
  private goalService = inject(GoalService);

  isActive = signal(false);
  phase = signal<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  instruction = signal('Ready?');
  duration = signal(1); // minutes
  customDuration = signal<number | null>(null);
  timeLeft = signal(0);
  
  private cycleInterval: any;
  private timerInterval: any;

  timeLeftFormatted = computed(() => {
    const m = Math.floor(this.timeLeft() / 60);
    const s = this.timeLeft() % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  ngOnInit() {
    const settingsDuration = this.goalService.settings().focusDuration;
    if (settingsDuration) {
      this.duration.set(settingsDuration);
      if (![1, 3, 5].includes(settingsDuration)) {
        this.customDuration.set(settingsDuration);
      }
    }
  }

  toggleSession() {
    if (this.isActive()) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.isActive.set(true);
    this.timeLeft.set(this.duration() * 60);
    
    this.runCycle();
    this.cycleInterval = setInterval(() => this.runCycle(), 19000); // 4-7-8 pattern = 19s

    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      if (this.timeLeft() <= 0) {
        this.stop();
      }
    }, 1000);
  }

  stop() {
    this.isActive.set(false);
    this.phase.set('idle');
    this.instruction.set('Ready?');
    clearInterval(this.cycleInterval);
    clearInterval(this.timerInterval);
  }

  runCycle() {
    // 4-7-8 Breathing Technique
    
    // Inhale (4s)
    this.phase.set('inhale');
    this.instruction.set('Inhale (4s)...');

    // Hold (7s)
    setTimeout(() => {
      if (!this.isActive()) return;
      this.phase.set('hold');
      this.instruction.set('Hold (7s)...');
    }, 4000);

    // Exhale (8s)
    setTimeout(() => {
      if (!this.isActive()) return;
      this.phase.set('exhale');
      this.instruction.set('Exhale (8s)...');
    }, 11000); // 4 + 7
  }

  ngOnDestroy() {
    this.stop();
  }
}
