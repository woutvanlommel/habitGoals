import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BreathComponent } from './features/breath/breath.component';
import { MemoriesComponent } from './features/memories/memories.component';
import { SettingsComponent } from './features/settings/settings.component';
import { AddEntryComponent } from './features/add-entry/add-entry.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'breath', component: BreathComponent },
  { path: 'memories', component: MemoriesComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'add', component: AddEntryComponent },
  { path: '**', redirectTo: 'dashboard' }
];
