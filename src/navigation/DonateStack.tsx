import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SelectItemsScreen } from '../screens/donate/SelectItemsScreen';
import { NGOListScreen } from '../screens/donate/NGOListScreen';
import { DonationConfirmScreen } from '../screens/donate/DonationConfirmScreen';
import { DonationHistoryScreen } from '../screens/donate/DonationHistoryScreen';
import { Colors } from '../theme';
import { DonationItem, NGO } from '../models/types';

export type DonateStackParamList = {
  SelectItems: undefined;
  NGOList: { selectedItems: DonationItem[] };
  DonationConfirm: { selectedItems: DonationItem[]; ngo: NGO };
  DonationHistory: undefined;
};

const Stack = createNativeStackNavigator<DonateStackParamList>();

export const DonateStack: React.FC = () => {
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
        name="SelectItems"
        component={SelectItemsScreen}
        options={{ title: 'Donate Food' }}
      />
      <Stack.Screen
        name="NGOList"
        component={NGOListScreen}
        options={{ title: 'Choose NGO' }}
      />
      <Stack.Screen
        name="DonationConfirm"
        component={DonationConfirmScreen}
        options={{ title: 'Confirm Donation' }}
      />
      <Stack.Screen
        name="DonationHistory"
        component={DonationHistoryScreen}
        options={{ title: 'Donation History' }}
      />
    </Stack.Navigator>
  );
};
