import { Injectable } from '@angular/core';
import { Client, Account, Databases, ID, Query, Permission, Role } from 'appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite.config';
import { DailyEntry, UserSettings } from '../models/goal.model';

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  client = new Client();
  account: Account;
  databases: Databases;

  constructor() {
    this.client
      .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
      .setProject(APPWRITE_CONFIG.PROJECT_ID);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
  }

  async getUser() {
    try {
      return await this.account.get();
    } catch (error) {
      return null;
    }
  }

  async register(email: string, password: string, name: string) {
    try {
      const userAccount = await this.account.create(ID.unique(), email, password, name);
      const session = await this.login(email, password);

      // Create user document in database
      try {
        await this.databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.USERS_COLLECTION_ID,
          userAccount.$id,
          {
            email: email,
            name: name
          },
          [
            Permission.read(Role.user(userAccount.$id)),
            Permission.update(Role.user(userAccount.$id)),
            Permission.delete(Role.user(userAccount.$id))
          ]
        );

        // Create default settings document
        await this.databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.SETTINGS_COLLECTION_ID,
          userAccount.$id, // Use user ID as document ID for 1:1 relationship
          {
            username: name,
            darkMode: false,
            focusDuration: 5,
            dailyGoalTarget: 3
          },
          [
            Permission.read(Role.user(userAccount.$id)),
            Permission.update(Role.user(userAccount.$id)),
            Permission.delete(Role.user(userAccount.$id))
          ]
        );

      } catch (dbError) {
        console.error('Failed to create user/settings document:', dbError);
      }

      return session;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      return await this.account.deleteSession('current');
    } catch (error) {
      throw error;
    }
  }

  async getEntries(): Promise<DailyEntry[]> {
    try {
      const response = await this.databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.ENTRIES_COLLECTION_ID,
        [Query.limit(100)] // Adjust limit as needed
      );
      // Map documents back to DailyEntry, removing Appwrite specific fields if necessary
      return response.documents.map(doc => {
        const { $id, $databaseId, $collectionId, $createdAt, $updatedAt, $permissions, ...data } = doc;
        // Parse goals if stored as string, or ensure structure matches
        // Assuming goals are stored as JSON string in Appwrite for simplicity, 
        // or we map them correctly if using sub-attributes.
        // For this implementation, let's assume we store the whole entry object as attributes.
        // However, Appwrite requires a schema. 
        // To make it easy for the user, we might store the complex 'goals' array as a stringified JSON 
        // if they don't want to create complex relationships immediately.
        // Let's assume 'goals' is a string attribute in Appwrite for now to keep schema simple.
        return {
          ...data,
          date: $id, // Ensure date is present (using ID)
          goals: typeof data['goals'] === 'string' ? JSON.parse(data['goals']) : data['goals']
        } as unknown as DailyEntry;
      });
    } catch (error) {
      console.error('Error fetching entries:', error);
      return [];
    }
  }

  async saveEntry(entry: DailyEntry) {
    try {
      // We use the date as the document ID to ensure uniqueness per day
      // But Appwrite IDs have specific requirements (chars). Date '2023-10-27' is valid chars? 
      // Allowed: ^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,35}$
      // '2023-10-27' contains hyphens, so it's valid.
      
      // Prepare data. Stringify complex objects if Appwrite schema is simple.
      const data = {
        ...entry,
        goals: JSON.stringify(entry.goals)
      };

      try {
        // Try to update first
        return await this.databases.updateDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.ENTRIES_COLLECTION_ID,
          entry.date,
          data
        );
      } catch (e) {
        // If not found, create
        return await this.databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.ENTRIES_COLLECTION_ID,
          entry.date,
          data
        );
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  }

  async deleteEntry(date: string) {
    try {
      await this.databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.ENTRIES_COLLECTION_ID,
        date
      );
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }

  async getSettings(): Promise<UserSettings | null> {
    try {
      const response = await this.databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.SETTINGS_COLLECTION_ID,
        [Query.limit(1)]
      );
      if (response.documents.length > 0) {
        const { $id, ...data } = response.documents[0];
        return data as unknown as UserSettings;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async saveSettings(settings: UserSettings) {
    try {
      // First check if settings exist for this user
      const existing = await this.databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.SETTINGS_COLLECTION_ID,
        [Query.limit(1)]
      );

      if (existing.documents.length > 0) {
        // Update existing
        await this.databases.updateDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.SETTINGS_COLLECTION_ID,
          existing.documents[0].$id,
          settings as any
        );
      } else {
        // Create new
        await this.databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.SETTINGS_COLLECTION_ID,
          ID.unique(),
          settings as any
        );
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}
