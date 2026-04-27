import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecipeListScreen } from '../screens/recipes/RecipeListScreen';
import { RecipeDetailScreen } from '../screens/recipes/RecipeDetailScreen';
import { Colors } from '../theme';
import { RecipeMatch } from '../services/recipeService';

export type RecipeStackParamList = {
  RecipeList: undefined;
  RecipeDetail: { recipeMatch: RecipeMatch };
};

const Stack = createNativeStackNavigator<RecipeStackParamList>();

export const RecipeStack: React.FC = () => {
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
        name="RecipeList"
        component={RecipeListScreen}
        options={{ title: 'Recipe Suggestions' }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: 'Recipe' }}
      />
    </Stack.Navigator>
  );
};
