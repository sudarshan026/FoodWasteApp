import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InventoryListScreen } from '../screens/inventory/InventoryListScreen';
import { AddEditItemScreen } from '../screens/inventory/AddEditItemScreen';
import { Colors } from '../theme';
import { FoodItem } from '../models/types';

export type InventoryStackParamList = {
  InventoryList: undefined;
  AddEditItem: { item?: FoodItem } | undefined;
};

const Stack = createNativeStackNavigator<InventoryStackParamList>();

export const InventoryStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.card },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="InventoryList"
        component={InventoryListScreen}
        options={{ title: 'My Inventory' }}
      />
      <Stack.Screen
        name="AddEditItem"
        component={AddEditItemScreen}
        options={({ route }) => ({
          title: route.params?.item ? 'Edit Item' : 'Add Item',
        })}
      />
    </Stack.Navigator>
  );
};
