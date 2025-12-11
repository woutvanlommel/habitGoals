export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  goals: Goal[];
  reflection?: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'energetic' | 'tired';
  image?: string; // Base64 data URL
}

export interface UserSettings {
  username: string;
  darkMode: boolean;
  focusDuration?: number;
  dailyGoalTarget?: number;
}
