import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppwriteService } from '../../core/services/appwrite.service';
import { GoalService } from '../../core/services/goal.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Habit Goals</h1>
        <p class="subtitle">Your daily mindfulness companion</p>

        <div class="tabs">
          <button 
            [class.active]="mode() === 'login'" 
            (click)="mode.set('login')">Login</button>
          <button 
            [class.active]="mode() === 'register'" 
            (click)="mode.set('register')">Register</button>
        </div>

        <form (submit)="onSubmit($event)">
          <div class="form-group" *ngIf="mode() === 'register'">
            <label>Name</label>
            <input type="text" [(ngModel)]="name" name="name" placeholder="Your name" required>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="email@example.com" required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required minlength="8">
          </div>

          <div class="error" *ngIf="error()">{{ error() }}</div>

          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Please wait...' : (mode() === 'login' ? 'Login' : 'Create Account') }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-color, #f5f5f5);
      padding: 20px;
    }
    .auth-card {
      background: var(--card-bg, white);
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    h1 { margin: 0 0 0.5rem; color: var(--primary-color, #4f46e5); }
    .subtitle { color: #666; margin-bottom: 2rem; }
    
    .tabs {
      display: flex;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .tabs button {
      flex: 1;
      background: none;
      border: none;
      padding: 10px;
      cursor: pointer;
      font-weight: 600;
      color: #999;
      border-bottom: 2px solid transparent;
    }
    .tabs button.active {
      color: var(--primary-color, #4f46e5);
      border-bottom-color: var(--primary-color, #4f46e5);
    }

    .form-group {
      margin-bottom: 1rem;
      text-align: left;
    }
    label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500; }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    button[type="submit"] {
      width: 100%;
      padding: 12px;
      background: var(--primary-color, #4f46e5);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
    .error {
      color: #dc2626;
      background: #fee2e2;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
  `]
})
export class AuthComponent {
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  private goalService = inject(GoalService);

  mode = signal<'login' | 'register'>('login');
  email = '';
  password = '';
  name = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.mode() === 'login') {
        await this.appwrite.login(this.email, this.password);
      } else {
        await this.appwrite.register(this.email, this.password, this.name);
      }
      
      // Re-initialize goal service to load user data
      await this.goalService.init();
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      console.error(e);
      this.error.set(e.message || 'An error occurred');
    } finally {
      this.loading.set(false);
    }
  }
}
