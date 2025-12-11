import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Wind, History, Plus, LayoutDashboard, Settings } from 'lucide-angular';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="bottom-nav">
      <a routerLink="/breath" routerLinkActive="active" class="nav-item">
        <lucide-icon [img]="Wind" size="24"></lucide-icon>
        <span>Breath</span>
      </a>
      
      <a routerLink="/memories" routerLinkActive="active" class="nav-item">
        <lucide-icon [img]="History" size="24"></lucide-icon>
        <span>Memories</span>
      </a>

      <div class="fab-container">
        <a routerLink="/add" class="fab">
          <lucide-icon [img]="Plus" size="32" color="white"></lucide-icon>
        </a>
      </div>

      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
        <lucide-icon [img]="LayoutDashboard" size="24"></lucide-icon>
        <span>Home</span>
      </a>

      <a routerLink="/settings" routerLinkActive="active" class="nav-item">
        <lucide-icon [img]="Settings" size="24"></lucide-icon>
        <span>Settings</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: var(--color-surface);
      display: flex;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 100;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      gap: 4px;
      width: 60px;
      transition: color 0.2s;
    }

    .nav-item.active {
      color: var(--color-primary);
    }

    .fab-container {
      position: relative;
      top: -20px;
    }

    .fab {
      width: 56px;
      height: 56px;
      background-color: var(--color-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(107, 144, 128, 0.4);
      transition: transform 0.2s;
    }

    .fab:active {
      transform: scale(0.95);
    }
  `]
})
export class NavigationComponent {
  readonly Wind = Wind;
  readonly History = History;
  readonly Plus = Plus;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Settings = Settings;
}
