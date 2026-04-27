import React, { createContext, useContext, useState, useCallback } from 'react';
import { FoodItem, FoodCategory } from '../models/types';
import { InventoryService } from '../services/inventoryService';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  items: FoodItem[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  addItem: (name: string, quantity: number, unit: string, expiryDate: string, category: FoodCategory) => Promise<FoodItem>;
  updateItem: (itemId: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  getExpiringItems: (limit?: number) => Promise<FoodItem[]>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadItems = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userItems = await InventoryService.getItems(user.id);
      setItems(userItems);
    } catch (error) {
      console.error('Load items error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addItem = useCallback(async (
    name: string,
    quantity: number,
    unit: string,
    expiryDate: string,
    category: FoodCategory
  ): Promise<FoodItem> => {
    if (!user) throw new Error('Not authenticated');
    const newItem = await InventoryService.addItem(user.id, name, quantity, unit, expiryDate, category);
    await loadItems(); // Refresh
    return newItem;
  }, [user, loadItems]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<FoodItem>) => {
    if (!user) return;
    await InventoryService.updateItem(itemId, updates, user.id);
    await loadItems();
  }, [user, loadItems]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!user) return;
    await InventoryService.deleteItem(itemId, user.id);
    await loadItems();
  }, [user, loadItems]);

  const getExpiringItems = useCallback(async (limit?: number): Promise<FoodItem[]> => {
    if (!user) return [];
    return InventoryService.getExpiringItems(user.id, limit);
  }, [user]);

  return (
    <InventoryContext.Provider
      value={{
        items,
        isLoading,
        loadItems,
        addItem,
        updateItem,
        deleteItem,
        getExpiringItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
