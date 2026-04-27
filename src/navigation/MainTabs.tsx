import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { InventoryStack } from './InventoryStack';
import { RecipeStack } from './RecipeStack';
import { DonateStack } from './DonateStack';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { Colors, Typography } from '../theme';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  HomeTab: 'home',
  InventoryTab: 'fridge-outline',
  RecipesTab: 'chef-hat',
  DonateTab: 'heart-outline',
  AnalyticsTab: 'chart-bar',
};

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = TAB_ICONS[route.name] || 'circle';
          return (
            <MaterialCommunityIcons
              name={iconName as any}
              size={focused ? 26 : 24}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey500,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          ...Typography.tabLabel,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryStack}
        options={{ tabBarLabel: 'Inventory' }}
      />
      <Tab.Screen
        name="RecipesTab"
        component={RecipeStack}
        options={{ tabBarLabel: 'Recipes' }}
      />
      <Tab.Screen
        name="DonateTab"
        component={DonateStack}
        options={{ tabBarLabel: 'Donate' }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
    </Tab.Navigator>
  );
};
