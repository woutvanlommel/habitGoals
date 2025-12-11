import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { DailyEntry, Goal, UserSettings } from '../models/goal.model';
import { AppwriteService } from './appwrite.service';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private appwrite = inject(AppwriteService);

  // State
  private entries = signal<DailyEntry[]>([]);
  
  settings = signal<UserSettings>({
    username: 'Friend',
    darkMode: false
  });

  initialized = signal(false);

  // Computed
  today = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.entries().find(e => e.date === todayStr) || null;
  });

  history = computed(() => {
    return this.entries().sort((a, b) => b.date.localeCompare(a.date));
  });

  streak = computed(() => {
    const sorted = this.entries().sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) return 0;

    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if today has an entry with at least one completed goal
    const todayEntry = sorted.find(e => e.date === todayStr);
    if (todayEntry && todayEntry.goals.some(g => g.completed)) {
      streak++;
    } else {
      // If not today, check if the streak ended yesterday. 
      // If the last entry wasn't yesterday or today, streak is broken (unless we want to be lenient)
      // For strict streak: if today is missing, streak is 0 unless we check yesterday.
      // Let's assume streak continues if yesterday was done.
      const yesterdayEntry = sorted.find(e => e.date === yesterdayStr);
      if (!yesterdayEntry || !yesterdayEntry.goals.some(g => g.completed)) {
        return 0; 
      }
    }

    // Count backwards from yesterday
    let currentCheckDate = new Date();
    if (streak === 1) {
      // We counted today, so start checking yesterday
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      // We didn't count today, so start checking yesterday (which we already verified exists above if streak is 0)
       currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    }

    // Simple loop
    while (true) {
      const dateStr = currentCheckDate.toISOString().split('T')[0];
      const entry = sorted.find(e => e.date === dateStr);
      
      // Don't double count today if we already did
      if (dateStr === todayStr && streak === 1) {
         currentCheckDate.setDate(currentCheckDate.getDate() - 1);
         continue;
      }

      if (entry && entry.goals.some(g => g.completed)) {
        streak++;
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  });

  weeklyProgress = computed(() => {
    const days = [];
    const today = new Date();
    // Get last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = this.entries().find(e => e.date === dateStr);
      
      days.push({
        date: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: i === 0,
        hasEntry: !!entry,
        completedAll: entry ? entry.goals.every(g => g.completed) && entry.goals.length > 0 : false,
        completedSome: entry ? entry.goals.some(g => g.completed) : false
      });
    }
    return days;
  });

  moodHistory = computed(() => {
    const days = [];
    const today = new Date();
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = this.entries().find(e => e.date === dateStr);
      
      days.push({
        date: d,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: entry?.mood || null
      });
    }
    return days;
  });

  constructor() {
    this.init();

    // Effect for dark mode only (data sync is handled manually now)
    effect(() => {
      if (this.settings().darkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });
  }

  async init() {
    try {
      const user = await this.appwrite.getUser();
      if (user) {
        await this.loadData();
      } else {
        // Not logged in, do nothing (AuthGuard will handle redirect)
        // Or clear data
        this.entries.set([]);
      }
    } catch (error) {
      console.error('Failed to initialize Appwrite:', error);
    } finally {
      this.initialized.set(true);
    }
  }

  private async loadData() {
    const [entries, settings] = await Promise.all([
      this.appwrite.getEntries(),
      this.appwrite.getSettings()
    ]);
    
    this.entries.set(entries);
    
    if (settings) {
      this.settings.set(settings);
    } else {
      // If no settings found, try to get name from account and create default settings
      const user = await this.appwrite.getUser();
      if (user) {
        const newSettings: UserSettings = {
          username: user.name,
          darkMode: false,
          focusDuration: 5,
          dailyGoalTarget: 3
        };
        this.settings.set(newSettings);
        // Save to DB so it exists next time
        await this.appwrite.saveSettings(newSettings);
      }
    }
  }

  // Actions
  setTodayGoals(goalsText: string[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    this.setGoals(todayStr, goalsText);
  }

  async setGoals(date: string, goalsText: string[]) {
    const newGoals: Goal[] = goalsText.map(text => ({
      id: crypto.randomUUID(),
      text,
      completed: false
    }));

    // Optimistic update
    this.entries.update(entries => {
      const existingIndex = entries.findIndex(e => e.date === date);
      if (existingIndex >= 0) {
        const updated = [...entries];
        updated[existingIndex] = { ...updated[existingIndex], goals: newGoals };
        return updated;
      } else {
        return [...entries, { date, goals: newGoals }];
      }
    });

    // Sync
    const entry = this.entries().find(e => e.date === date);
    if (entry) {
      await this.appwrite.saveEntry(entry);
    }
  }

  async toggleGoal(goalId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Optimistic update
    this.entries.update(entries => {
      return entries.map(entry => {
        if (entry.date === targetDate) {
          return {
            ...entry,
            goals: entry.goals.map(g => 
              g.id === goalId ? { ...g, completed: !g.completed } : g
            )
          };
        }
        return entry;
      });
    });

    // Sync
    const entry = this.entries().find(e => e.date === targetDate);
    if (entry) {
      await this.appwrite.saveEntry(entry);
    }
  }

  async saveReflection(reflection: string, mood?: 'happy' | 'neutral' | 'sad' | 'energetic' | 'tired', image?: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Optimistic update
    this.entries.update(entries => {
      return entries.map(entry => {
        if (entry.date === targetDate) {
          return { ...entry, reflection, mood, image };
        }
        return entry;
      });
    });

    // Sync
    const entry = this.entries().find(e => e.date === targetDate);
    if (entry) {
      await this.appwrite.saveEntry(entry);
    }
  }

  async deleteEntry(date: string) {
    // Optimistic update
    this.entries.update(entries => entries.filter(e => e.date !== date));
    
    // Sync
    await this.appwrite.deleteEntry(date);
  }

  getEntry(date: string) {
    return this.entries().find(e => e.date === date);
  }

  async updateSettings(newSettings: Partial<UserSettings>) {
    // Optimistic update
    this.settings.update(s => ({ ...s, ...newSettings }));
    
    // Sync
    await this.appwrite.saveSettings(this.settings());
  }

  importData(data: DailyEntry[]) {
    // Not implemented for Appwrite yet (would require batch create)
    console.warn('Import not fully supported with Appwrite yet');
    this.entries.set(data);
  }

  clearData() {
    this.entries.set([]);
    // Would need to delete all docs in Appwrite
  }
}
