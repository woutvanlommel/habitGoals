import { Injectable, signal, computed, effect } from '@angular/core';
import { DailyEntry, Goal, UserSettings } from '../models/goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private readonly STORAGE_KEY = 'habit_goals_data';
  private readonly SETTINGS_KEY = 'habit_goals_settings';

  // State
  private entries = signal<DailyEntry[]>([]);
  
  settings = signal<UserSettings>({
    username: 'Friend',
    darkMode: false
  });

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

  constructor() {
    this.loadData();

    // Auto-save effects
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries()));
    });

    effect(() => {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings()));
      if (this.settings().darkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });
  }

  private loadData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.entries.set(JSON.parse(data));
    }

    const settings = localStorage.getItem(this.SETTINGS_KEY);
    if (settings) {
      this.settings.set(JSON.parse(settings));
    }
  }

  // Actions
  setTodayGoals(goalsText: string[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    this.setGoals(todayStr, goalsText);
  }

  setGoals(date: string, goalsText: string[]) {
    const newGoals: Goal[] = goalsText.map(text => ({
      id: crypto.randomUUID(),
      text,
      completed: false
    }));

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
  }

  toggleGoal(goalId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
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
  }

  saveReflection(reflection: string, mood?: 'happy' | 'neutral' | 'sad' | 'energetic' | 'tired', image?: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    this.entries.update(entries => {
      return entries.map(entry => {
        if (entry.date === targetDate) {
          return { ...entry, reflection, mood, image };
        }
        return entry;
      });
    });
  }

  deleteEntry(date: string) {
    this.entries.update(entries => entries.filter(e => e.date !== date));
  }

  getEntry(date: string) {
    return this.entries().find(e => e.date === date);
  }

  updateSettings(newSettings: Partial<UserSettings>) {
    this.settings.update(s => ({ ...s, ...newSettings }));
  }

  importData(data: DailyEntry[]) {
    this.entries.set(data);
  }

  clearData() {
    this.entries.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
