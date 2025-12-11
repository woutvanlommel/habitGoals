import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-breath',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container breath-page">
      <div class="instruction">{{ instruction() }}</div>
      
      <div class="circle-container">
        <div class="breathing-circle" [class.inhale]="phase() === 'inhale'" [class.exhale]="phase() === 'exhale'"></div>
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
export class BreathComponent implements OnDestroy {
  isActive = signal(false);
  phase = signal<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  instruction = signal('Ready?');
  
  private intervalId: any;

  toggleSession() {
    if (this.isActive()) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.isActive.set(true);
    this.runCycle();
    this.intervalId = setInterval(() => this.runCycle(), 8000); // 4s in, 4s out
  }

  stop() {
    this.isActive.set(false);
    this.phase.set('idle');
    this.instruction.set('Ready?');
    clearInterval(this.intervalId);
  }

  runCycle() {
    // Inhale
    this.phase.set('inhale');
    this.instruction.set('Inhale...');

    // Exhale
    setTimeout(() => {
      if (!this.isActive()) return;
      this.phase.set('exhale');
      this.instruction.set('Exhale...');
    }, 4000);
  }

  ngOnDestroy() {
    this.stop();
  }
}
