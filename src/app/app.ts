import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { GoalService } from './core/services/goal.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private goalService = inject(GoalService);
  private router = inject(Router);
  
  protected readonly title = signal('habitGoals');
  initialized = this.goalService.initialized;
  showNavigation = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showNavigation.set(!event.url.includes('/auth'));
    });
  }
}
