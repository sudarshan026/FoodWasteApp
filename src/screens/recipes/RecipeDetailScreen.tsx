import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { RecipeStackParamList } from '../../navigation/RecipeStack';
import { RecipeService } from '../../services/recipeService';
import { Recipe } from '../../models/types';

type Props = {
  navigation: NativeStackNavigationProp<RecipeStackParamList, 'RecipeDetail'>;
  route: RouteProp<RecipeStackParamList, 'RecipeDetail'>;
};

export const RecipeDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { recipeMatch } = route.params;
  const { recipe: basicRecipe } = recipeMatch;
  const { items, loadItems } = useInventory();
  const { user } = useAuth();
  
  const [detailedRecipe, setDetailedRecipe] = useState<Recipe | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [cooking, setCooking] = useState(false);
  const [cooked, setCooked] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const details = await RecipeService.getRecipeById(basicRecipe.id);
        if (details) setDetailedRecipe(details);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingDetails(false);
      }
    };
    loadDetails();
  }, [basicRecipe.id]);

  const handleMarkCooked = async () => {
    Alert.alert(
      'Mark as Cooked',
      'This will reduce the quantity of matched ingredients in your inventory.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setCooking(true);
            try {
              const { InventoryService } = require('../../services/inventoryService');
              for (const ingredient of recipeMatch.matchedIngredients) {
                const matchedItem = items.find(
                  i => i.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                       ingredient.name.toLowerCase().includes(i.name.toLowerCase())
                );
                if (matchedItem) {
                  await InventoryService.decreaseQuantity(matchedItem.id, 1, user?.id);
                }
              }
              await loadItems();
              setCooked(true);
              Alert.alert('🎉 Yummy!', 'Recipe marked as cooked. Inventory has been updated.');
            } catch (error) {
              Alert.alert('Error', 'Failed to update inventory.');
            } finally {
              setCooking(false);
            }
          },
        },
      ]
    );
  };

  if (loadingDetails || !detailedRecipe) {
    return <LoadingSpinner message="Fetching recipe details..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        {detailedRecipe.image ? (
          <Image source={{ uri: detailedRecipe.image }} style={styles.heroImage} />
        ) : (
          <Text style={styles.heroEmoji}>🍲</Text>
        )}
        <Text style={styles.heroTitle}>{detailedRecipe.name}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.white} />
            <Text style={styles.metaText}>{detailedRecipe.cookingTime} min</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account-group" size={18} color={Colors.white} />
            <Text style={styles.metaText}>{detailedRecipe.servings} servings</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="signal" size={18} color={Colors.white} />
            <Text style={styles.metaText}>{detailedRecipe.difficulty}</Text>
          </View>
        </View>
      </View>

      {/* Ingredients */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🧂 Ingredients</Text>
        {detailedRecipe.ingredients.map((ing, index) => {
          const isMatched = recipeMatch.matchedIngredients.some(
            m => m.name.toLowerCase() === ing.name.toLowerCase()
          );
          return (
            <View key={index} style={styles.ingredientRow}>
              <MaterialCommunityIcons
                name={isMatched ? 'check-circle' : 'circle-outline'}
                size={20}
                color={isMatched ? Colors.primary : Colors.grey400}
              />
              <Text
                style={[
                  styles.ingredientName,
                  !isMatched && styles.ingredientMissing,
                ]}
              >
                {ing.name}
              </Text>
              <Text style={styles.ingredientQty}>{ing.quantity}</Text>
            </View>
          );
        })}
        <View style={styles.matchSummary}>
          <Text style={styles.matchSummaryText}>
            {recipeMatch.matchedCount}/{recipeMatch.totalIngredients} ingredients available (
            {recipeMatch.matchPercentage}% match)
          </Text>
        </View>
      </Card>

      {/* Instructions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
        {detailedRecipe.instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </Card>

      {/* Cook button */}
      <Button
        title={cooked ? '✅ Cooked!' : '🍳 Mark as Cooked'}
        onPress={handleMarkCooked}
        loading={cooking}
        disabled={cooked}
        variant={cooked ? 'secondary' : 'primary'}
        fullWidth
        style={styles.cookButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.huge,
  },
  // Hero
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.base,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.md,
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.white,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.md,
  },
  // Section
  section: {
    margin: Spacing.base,
    marginBottom: 0,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  ingredientName: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  ingredientMissing: {
    color: Colors.textLight,
  },
  ingredientQty: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  matchSummary: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
  },
  matchSummaryText: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  // Steps
  stepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    ...Typography.captionBold,
    color: Colors.white,
  },
  stepText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  cookButton: {
    margin: Spacing.base,
    marginTop: Spacing.xl,
  },
});
