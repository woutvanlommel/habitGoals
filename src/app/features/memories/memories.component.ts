import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { LucideAngularModule, Calendar, CheckCircle2, Trash2, Edit2 } from 'lucide-angular';

@Component({
  selector: 'app-memories',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="container memories-page">
      <header class="header">
        <h2>Memories</h2>
        <p class="subtitle">Your journey so far.</p>
      </header>

      <div class="history-list">
        <div *ngIf="history().length === 0" class="empty-state">
          <p>No memories yet. Start your first day!</p>
        </div>

        <div *ngFor="let entry of history()" class="memory-card card">
          <div class="memory-header">
            <div class="date-badge">
              <lucide-icon [img]="Calendar" size="14"></lucide-icon>
              <span>{{ entry.date | date:'mediumDate' }}</span>
            </div>
            <div class="header-right">
              <span *ngIf="entry.mood" class="mood-icon">{{ getMoodEmoji(entry.mood) }}</span>
              <div class="completion-badge" [class.perfect]="getCompletionRate(entry) === 100">
                {{ getCompletionRate(entry) }}%
              </div>
              <div class="actions">
                <button (click)="editEntry(entry.date)" class="btn-icon small">
                  <lucide-icon [img]="Edit2" size="16"></lucide-icon>
                </button>
                <button (click)="deleteEntry(entry.date)" class="btn-icon small danger">
                  <lucide-icon [img]="Trash2" size="16"></lucide-icon>
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="entry.image" class="memory-image">
            <img [src]="entry.image" alt="Memory photo">
          </div>

          <div class="goals-summary">
            <div *ngFor="let goal of entry.goals" class="mini-goal" [class.done]="goal.completed">
              <lucide-icon [img]="CheckCircle2" size="14" [class.done-icon]="goal.completed"></lucide-icon>
              <span class="truncate">{{ goal.text }}</span>
            </div>
          </div>

          <div *ngIf="entry.reflection" class="reflection-snippet">
            <p>"{{ entry.reflection }}"</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .memories-page {
      padding-top: var(--spacing-lg);
      padding-bottom: 100px;
    }

    .header {
      margin-bottom: var(--spacing-lg);
    }

    .subtitle {
      color: var(--color-text-muted);
    }

    .empty-state {
      text-align: center;
      color: var(--color-text-muted);
      margin-top: var(--spacing-xl);
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .memory-card {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .memory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--spacing-sm);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .actions {
      display: flex;
      gap: var(--spacing-xs);
      margin-left: var(--spacing-sm);
    }

    .btn-icon.small {
      padding: 4px;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-secondary);
      color: var(--color-text-muted);
      transition: all 0.2s;
    }

    .btn-icon.small:hover {
      background-color: var(--color-border);
      color: var(--color-text);
    }

    .btn-icon.small.danger:hover {
      background-color: var(--color-danger);
      color: white;
    }

    .mood-icon {
      font-size: 1.2rem;
    }

    .date-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }

    .completion-badge {
      font-weight: bold;
      color: var(--color-primary);
      font-size: 0.9rem;
    }

    .completion-badge.perfect {
      color: var(--color-accent);
    }

    .memory-image {
      width: 100%;
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-bottom: var(--spacing-xs);
    }

    .memory-image img {
      width: 100%;
      height: auto;
      display: block;
      max-height: 200px;
      object-fit: cover;
    }

    .goals-summary {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mini-goal {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .mini-goal.done {
      color: var(--color-text);
    }

    .done-icon {
      color: var(--color-primary);
    }

    .truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .reflection-snippet {
      background-color: var(--color-secondary);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-style: italic;
      font-size: 0.9rem;
      color: var(--color-primary-dark);
    }
  `]
})
export class MemoriesComponent {
  private goalService = inject(GoalService);
  private router = inject(Router);
  
  history = this.goalService.history;
  
  Calendar = Calendar;
  CheckCircle2 = CheckCircle2;
  Trash2 = Trash2;
  Edit2 = Edit2;

  getCompletionRate(entry: any) {
    if (!entry.goals || entry.goals.length === 0) return 0;
    const completed = entry.goals.filter((g: any) => g.completed).length;
    return Math.round((completed / entry.goals.length) * 100);
  }

  getMoodEmoji(mood: string) {
    const map: Record<string, string> = {
      'happy': '😊',
      'neutral': '😐',
      'sad': '😔',
      'energetic': '⚡',
      'tired': '😴'
    };
    return map[mood] || '😐';
  }

  deleteEntry(date: string) {
    if (confirm('Are you sure you want to delete this memory?')) {
      this.goalService.deleteEntry(date);
    }
  }

  editEntry(date: string) {
    this.router.navigate(['/add'], { queryParams: { date } });
  }
}
