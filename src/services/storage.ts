import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERS: '@foodwaste_users',
  SESSION: '@foodwaste_session',
  FOOD_ITEMS: '@foodwaste_items',
  DONATIONS: '@foodwaste_donations',
  ANALYTICS: '@foodwaste_analytics',
};

export class StorageService {
  // ─── Generic helpers ─────────────────────────────────
  static async get<T>(key: string): Promise<T | null> {
    try {
      const json = await AsyncStorage.getItem(key);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error(`Storage GET error [${key}]:`, error);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage SET error [${key}]:`, error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage REMOVE error [${key}]:`, error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage CLEAR error:', error);
    }
  }
}

export { STORAGE_KEYS };
