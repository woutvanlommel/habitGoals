import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoalService } from '../../core/services/goal.service';
import { AppwriteService } from '../../core/services/appwrite.service';
import { LucideAngularModule, User, Moon, Trash2, AlertTriangle, Download, Upload, LogOut, Clock, Target } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="container settings-page">
      <header class="header">
        <h2>Settings</h2>
      </header>

      <div class="settings-group card">
        <h3>Profile</h3>
        <div class="setting-item">
          <div class="label">
            <lucide-icon [img]="User" size="20"></lucide-icon>
            <span>Username</span>
          </div>
          <input 
            [ngModel]="settings().username" 
            (ngModelChange)="updateUsername($event)"
            class="input-field" 
            placeholder="Your Name">
        </div>
      </div>

      <div class="settings-group card">
        <h3>Preferences</h3>
        <div class="setting-item">
          <div class="label">
            <lucide-icon [img]="Clock" size="20"></lucide-icon>
            <span>Focus Duration (min)</span>
          </div>
          <input 
            type="number"
            [ngModel]="settings().focusDuration || 5" 
            (ngModelChange)="updateFocusDuration($event)"
            class="input-field small" 
            min="1" max="60">
        </div>
        <div class="setting-item">
          <div class="label">
            <lucide-icon [img]="Target" size="20"></lucide-icon>
            <span>Daily Goal Target</span>
          </div>
          <input 
            type="number"
            [ngModel]="settings().dailyGoalTarget || 3" 
            (ngModelChange)="updateDailyGoalTarget($event)"
            class="input-field small" 
            min="1" max="20">
        </div>
      </div>

      <div class="settings-group card">
        <h3>Account</h3>
        <button class="btn-logout" (click)="logout()">
          <lucide-icon [img]="LogOut" size="20"></lucide-icon>
          <span>Log Out</span>
        </button>
      </div>

      <div class="settings-group card">
        <h3>Appearance</h3>
        <div class="setting-item">
          <div class="label">
            <lucide-icon [img]="Moon" size="20"></lucide-icon>
            <span>Dark Mode</span>
          </div>
          <label class="switch">
            <input type="checkbox" 
                   [ngModel]="settings().darkMode" 
                   (ngModelChange)="toggleDarkMode($event)">
            <span class="slider round"></span>
          </label>
        </div>
      </div>

      <div class="settings-group card danger-zone">
        <h3>Danger Zone</h3>
        <div class="setting-item column">
          <div class="warning-text">
            <lucide-icon [img]="AlertTriangle" size="16"></lucide-icon>
            <span>This action cannot be undone.</span>
          </div>
          <button (click)="clearData()" class="btn btn-danger full-width">
            <lucide-icon [img]="Trash2" size="18"></lucide-icon>
            Clear All Data
          </button>
        </div>
      </div>
      
      <div class="version">
        v1.0.0 • habitGoals
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      padding-top: var(--spacing-lg);
      padding-bottom: 100px;
    }

    .header {
      margin-bottom: var(--spacing-lg);
    }

    .settings-group {
      margin-bottom: var(--spacing-lg);
    }

    .settings-group h3 {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      margin-bottom: var(--spacing-md);
      letter-spacing: 0.5px;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-xs) 0;
    }

    .setting-item.column {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .label {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      font-weight: 500;
    }

    .input-field {
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 1rem;
      width: 150px;
      text-align: right;
      background: transparent;
    }

    .input-field:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    /* Toggle Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 28px;
    }

    .switch input { opacity: 0; width: 0; height: 0; }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #ccc;
      transition: .4s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
    }

    input:checked + .slider {
      background-color: var(--color-primary);
    }

    input:checked + .slider:before {
      transform: translateX(22px);
    }

    .slider.round {
      border-radius: 34px;
    }

    .slider.round:before {
      border-radius: 50%;
    }

    /* Danger Zone */
    .danger-zone {
      border: 1px solid var(--color-danger);
      background-color: #fff5f5;
    }

    .danger-zone h3 { color: var(--color-danger); }

    .warning-text {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-danger);
      font-size: 0.85rem;
    }

    .btn-danger {
      background-color: var(--color-danger);
      color: white;
      gap: 8px;
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background-color: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-logout:hover {
      background-color: #e5e7eb;
    }

    .full-width { width: 100%; }

    .version {
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      margin-top: var(--spacing-xl);
    }
  `]
})
export class SettingsComponent {
  private goalService = inject(GoalService);
  private appwrite = inject(AppwriteService);
  private router = inject(Router);
  
  settings = this.goalService.settings;
  
  User = User;
  Moon = Moon;
  Trash2 = Trash2;
  AlertTriangle = AlertTriangle;
  Download = Download;
  Upload = Upload;
  LogOut = LogOut;
  Clock = Clock;
  Target = Target;

  async logout() {
    try {
      await this.appwrite.logout();
      // Clear local state if needed, but router nav will likely reload or we should clear signals
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

  updateUsername(username: string) {
    this.goalService.updateSettings({ username });
  }

  updateFocusDuration(duration: number) {
    this.goalService.updateSettings({ focusDuration: duration });
  }

  updateDailyGoalTarget(target: number) {
    this.goalService.updateSettings({ dailyGoalTarget: target });
  }

  toggleDarkMode(darkMode: boolean) {
    this.goalService.updateSettings({ darkMode });
  }

  clearData() {
    if (confirm('Are you sure? This cannot be undone.')) {
      // this.goalService.clearData(); // Removed as requested
      alert('Please delete your account to remove all data.');
    }
  }
}
