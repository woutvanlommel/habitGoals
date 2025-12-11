import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { QuoteService } from '../../core/services/quote.service';
import { LucideAngularModule, Flame, BookOpen, Smile, Meh, Frown, Zap, Coffee } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="container dashboard">
      <header class="header">
        <h1 class="greeting">Good {{ timeOfDay() }}, <br> <span class="username">{{ settings().username }}</span></h1>
        <div class="date">{{ todayDate | date:'EEEE, d MMMM' }}</div>
      </header>

      <!-- Streak & Weekly Overview -->
      <section class="stats-row">
        <div class="streak-card card">
          <lucide-icon [img]="Flame" size="24" [class.active]="streak() > 0"></lucide-icon>
          <div class="streak-info">
            <span class="streak-count">{{ streak() }}</span>
            <span class="streak-label">Day Streak</span>
          </div>
        </div>
        
        <div class="weekly-card card">
          <div class="week-dots">
            <div *ngFor="let day of weeklyProgress()" 
                 class="day-dot"
                 [class.today]="day.isToday"
                 [class.completed]="day.completedAll"
                 [class.partial]="day.completedSome && !day.completedAll"
                 [title]="day.dayName">
              {{ day.dayName[0] }}
            </div>
          </div>
        </div>
      </section>

      <!-- Mood History -->
      <section class="mood-card card">
        <h3>Mood History</h3>
        <div class="mood-row">
          <div *ngFor="let day of moodHistory()" class="mood-day">
            <div class="mood-icon" [ngClass]="day.mood || 'none'">
              <lucide-icon *ngIf="day.mood === 'happy'" [img]="Smile" size="20"></lucide-icon>
              <lucide-icon *ngIf="day.mood === 'neutral'" [img]="Meh" size="20"></lucide-icon>
              <lucide-icon *ngIf="day.mood === 'sad'" [img]="Frown" size="20"></lucide-icon>
              <lucide-icon *ngIf="day.mood === 'energetic'" [img]="Zap" size="20"></lucide-icon>
              <lucide-icon *ngIf="day.mood === 'tired'" [img]="Coffee" size="20"></lucide-icon>
              <div *ngIf="!day.mood" class="mood-placeholder"></div>
            </div>
            <span class="mood-label">{{ day.dayName }}</span>
          </div>
        </div>
      </section>

      <section class="progress-card card">
        <div class="progress-circle">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path class="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path class="circle"
              [attr.stroke-dasharray]="completionRate() + ', 100'"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" class="percentage">{{ completionRate() }}%</text>
          </svg>
        </div>
        <div class="progress-text">
          <h3>Daily Goals</h3>
          <p *ngIf="totalGoals() === 0">No goals set. Target: {{ settings().dailyGoalTarget || 3 }}</p>
          <p *ngIf="totalGoals() > 0">{{ completedGoals() }} of {{ totalGoals() }} completed</p>
        </div>
      </section>

      <section class="stats-summary card">
        <div class="stat-item">
          <lucide-icon [img]="BookOpen" size="20"></lucide-icon>
          <div class="stat-text">
            <span class="stat-value">{{ totalEntries() }}</span>
            <span class="stat-label">Total Memories</span>
          </div>
        </div>
      </section>

      <section class="quote-card card">
        <p class="quote">"{{ currentQuote.text }}"</p>
        <p class="author">- {{ currentQuote.author }}</p>
      </section>

      <div class="actions">
        <a routerLink="/add" class="btn btn-primary action-btn">
          {{ totalGoals() === 0 ? 'Start Morning Routine' : 'Update Progress' }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding-top: var(--spacing-xl);
    }
    
    .header {
      margin-bottom: var(--spacing-xl);
    }

    .greeting {
      font-size: 2rem;
      font-weight: 300;
      color: var(--color-text);
      line-height: 1.2;
    }

    .username {
      font-weight: 600;
      color: var(--color-primary);
    }

    .date {
      color: var(--color-text-muted);
      margin-top: var(--spacing-xs);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Stats Row */
    .stats-row {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .streak-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      justify-content: center;
      padding: var(--spacing-md) var(--spacing-sm);
    }

    .streak-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1;
    }

    .streak-count {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--color-text);
    }

    .streak-label {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
    }

    .lucide-icon.active {
      color: var(--color-accent);
      fill: var(--color-accent);
    }

    .weekly-card {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .week-dots {
      display: flex;
      gap: 6px;
    }

    .day-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: var(--color-text-muted);
      border: 1px solid transparent;
    }

    .day-dot.today {
      border-color: var(--color-primary);
      font-weight: bold;
    }

    .day-dot.completed {
      background-color: var(--color-primary);
      color: white;
    }

    .day-dot.partial {
      background-color: #a8dadc; /* Lighter teal */
      color: white;
    }

    /* Mood History */
    .mood-card {
      margin-bottom: var(--spacing-md);
    }
    .mood-card h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
      color: var(--color-text-muted);
    }
    .mood-row {
      display: flex;
      justify-content: space-between;
    }
    .mood-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .mood-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-secondary);
      color: var(--color-text-muted);
    }
    .mood-icon.happy { color: #22c55e; background: #dcfce7; }
    .mood-icon.neutral { color: #64748b; background: #f1f5f9; }
    .mood-icon.sad { color: #3b82f6; background: #dbeafe; }
    .mood-icon.energetic { color: #eab308; background: #fef9c3; }
    .mood-icon.tired { color: #a855f7; background: #f3e8ff; }
    
    .mood-placeholder {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #cbd5e1;
    }
    .mood-label {
      font-size: 0.7rem;
      color: var(--color-text-muted);
    }

    .progress-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .progress-circle {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }

    .circular-chart {
      display: block;
      margin: 0 auto;
      max-width: 80%;
      max-height: 250px;
    }


    .circle-bg {
      fill: none;
      stroke: var(--color-secondary);
      stroke-width: 3.8;
    }

    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      stroke: var(--color-primary);
      transition: stroke-dasharray 0.6s ease;
    }

    .percentage {
      fill: var(--color-text);
      font-family: sans-serif;
      font-weight: bold;
      font-size: 0.5em;
      text-anchor: middle;
    }

    .progress-text h3 {
      font-size: 1.1rem;
      margin-bottom: var(--spacing-xs);
    }

    .progress-text p {
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }

    .quote-card {
      background-color: var(--color-secondary);
      text-align: center;
      font-style: italic;
    }

    .quote {
      font-size: 1.1rem;
      margin-bottom: var(--spacing-sm);
      color: var(--color-primary-dark);
    }

    .author {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .actions {
      margin-top: var(--spacing-xl);
      display: flex;
      justify-content: center;
    }

    .action-btn {
      width: 100%;
      padding: var(--spacing-md);
      font-size: 1.1rem;
      text-decoration: none;
    }
    
    .stats-summary {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-primary);
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }
  `]
})
export class DashboardComponent {
  private goalService = inject(GoalService);
  
  readonly Flame = Flame;
  readonly BookOpen = BookOpen;
  readonly Smile = Smile;
  readonly Meh = Meh;
  readonly Frown = Frown;
  readonly Zap = Zap;
  readonly Coffee = Coffee;

  settings = this.goalService.settings;
  todayEntry = this.goalService.today;
  streak = this.goalService.streak;
  weeklyProgress = this.goalService.weeklyProgress;
  
  todayDate = new Date();

  totalEntries = computed(() => this.goalService.history().length);
  moodHistory = this.goalService.moodHistory;

  private quoteService = inject(QuoteService);
  currentQuote = this.quoteService.getDailyQuote();

  timeOfDay = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  });

  totalGoals = computed(() => this.todayEntry()?.goals.length || 0);
  
  completedGoals = computed(() => 
    this.todayEntry()?.goals.filter(g => g.completed).length || 0
  );

  completionRate = computed(() => {
    const total = this.totalGoals();
    if (total === 0) return 0;
    return Math.round((this.completedGoals() / total) * 100);
  });
}
