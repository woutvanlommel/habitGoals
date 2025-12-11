import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BreathComponent } from './features/breath/breath.component';
import { MemoriesComponent } from './features/memories/memories.component';
import { SettingsComponent } from './features/settings/settings.component';
import { AddEntryComponent } from './features/add-entry/add-entry.component';
import { AuthComponent } from './features/auth/auth.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'breath', component: BreathComponent, canActivate: [authGuard] },
  { path: 'memories', component: MemoriesComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'add', component: AddEntryComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
