import { FoodItem, FoodCategory, ExpiryStatus } from '../models/types';
import { db } from '../config/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { SAMPLE_FOOD_ITEMS } from '../data/mockData';
import { differenceInDays, parseISO, addDays } from 'date-fns';

// Helper: get the foodItems subcollection reference for a user
const foodItemsRef = (userId: string) =>
  collection(db, 'users', userId, 'foodItems');

export class InventoryService {
  /**
   * Get all food items for a user from Firestore
   */
  static async getItems(userId: string): Promise<FoodItem[]> {
    const q = query(foodItemsRef(userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      userId,
      ...docSnap.data(),
    })) as FoodItem[];
  }

  /**
   * Add a new food item to Firestore
   */
  static async addItem(
    userId: string,
    name: string,
    quantity: number,
    unit: string,
    expiryDate: string,
    category: FoodCategory
  ): Promise<FoodItem> {
    const itemData = {
      userId,
      name,
      quantity,
      unit,
      expiryDate,
      category,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(foodItemsRef(userId), itemData);

    return {
      id: docRef.id,
      ...itemData,
    };
  }

  /**
   * Update an existing food item in Firestore
   */
  static async updateItem(itemId: string, updates: Partial<FoodItem>, userId?: string): Promise<FoodItem | null> {
    // We need the userId to locate the document in the subcollection
    // If userId is provided in updates, use it; otherwise we need it as parameter
    const uid = userId || updates.userId;
    if (!uid) return null;

    const docRef = doc(db, 'users', uid, 'foodItems', itemId);
    const { id, ...updateData } = updates as any;
    await updateDoc(docRef, updateData);
    return { id: itemId, ...updates } as FoodItem;
  }

  /**
   * Delete a food item from Firestore
   */
  static async deleteItem(itemId: string, userId?: string): Promise<void> {
    if (!userId) return;
    const docRef = doc(db, 'users', userId, 'foodItems', itemId);
    await deleteDoc(docRef);
  }

  /**
   * Get items filtered by category
   */
  static async getItemsByCategory(userId: string, category: FoodCategory): Promise<FoodItem[]> {
    const items = await this.getItems(userId);
    return items.filter(item => item.category === category);
  }

  /**
   * Get items that are expiring soon (within 3 days)
   */
  static async getExpiringItems(userId: string, limit?: number): Promise<FoodItem[]> {
    const items = await this.getItems(userId);
    const sorted = items
      .filter(item => {
        const days = differenceInDays(parseISO(item.expiryDate), new Date());
        return days <= 3;
      })
      .sort((a, b) => {
        return parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime();
      });

    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Calculate the expiry status of a food item
   */
  static getExpiryStatus(expiryDate: string): ExpiryStatus {
    const days = differenceInDays(parseISO(expiryDate), new Date());
    if (days < 0) return 'expired';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    return 'safe';
  }

  /**
   * Get days until expiry (negative means expired)
   */
  static getDaysUntilExpiry(expiryDate: string): number {
    return differenceInDays(parseISO(expiryDate), new Date());
  }

  /**
   * Seed initial data for a new user into Firestore
   */
  static async seedData(userId: string): Promise<void> {
    const existingItems = await this.getItems(userId);
    if (existingItems.length > 0) return; // Already seeded

    const batch = writeBatch(db);

    SAMPLE_FOOD_ITEMS.forEach(sample => {
      const newDocRef = doc(foodItemsRef(userId));
      batch.set(newDocRef, {
        userId,
        name: sample.name,
        quantity: sample.quantity,
        unit: sample.unit,
        expiryDate: addDays(new Date(), sample.daysUntilExpiry).toISOString(),
        category: sample.category,
        createdAt: new Date().toISOString(),
      });
    });

    await batch.commit();
  }

  /**
   * Decrease quantity of a food item (e.g., after cooking)
   */
  static async decreaseQuantity(itemId: string, amount: number, userId?: string): Promise<void> {
    if (!userId) return;
    const items = await this.getItems(userId);
    const item = items.find(i => i.id === itemId);

    if (item) {
      const newQty = Math.max(0, item.quantity - amount);
      if (newQty <= 0) {
        await this.deleteItem(itemId, userId);
      } else {
        await this.updateItem(itemId, { quantity: newQty }, userId);
      }
    }
  }
}
