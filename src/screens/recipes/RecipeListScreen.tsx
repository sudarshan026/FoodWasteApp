import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useInventory } from '../../context/InventoryContext';
import { RecipeService, RecipeMatch } from '../../services/recipeService';
import { RecipeStackParamList } from '../../navigation/RecipeStack';

type Props = {
  navigation: NativeStackNavigationProp<RecipeStackParamList, 'RecipeList'>;
};

export const RecipeListScreen: React.FC<Props> = ({ navigation }) => {
  const { items, loadItems } = useInventory();
  const [recipes, setRecipes] = useState<RecipeMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        await loadItems();
      };
      load();
    }, [loadItems])
  );

  React.useEffect(() => {
    if (items.length >= 0) {
      const loadRecipes = async () => {
        try {
          const matched = await RecipeService.getMatchingRecipes(items);
          setRecipes(matched);
        } catch (error) {
          console.error('Error loading recipes:', error);
        } finally {
          setLoading(false);
        }
      };
      loadRecipes();
    }
  }, [items]);

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return Colors.safe;
    if (percentage >= 50) return Colors.warning;
    return Colors.danger;
  };

  const renderRecipe = ({ item }: { item: RecipeMatch }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('RecipeDetail', { recipeMatch: item })}
    >
      <Card style={styles.recipeCard}>
        <View style={styles.recipeHeader}>
          {item.recipe.image ? (
            <Image source={{ uri: item.recipe.image }} style={styles.recipeImage} />
          ) : (
            <Text style={styles.recipeEmoji}>🍲</Text>
          )}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeName}>{item.recipe.name}</Text>
            <View style={styles.recipeMetaRow}>
              <View style={styles.recipeMeta}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.recipeMetaText}>{item.recipe.cookingTime} min</Text>
              </View>
              <View style={styles.recipeMeta}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.recipeMetaText}>{item.recipe.servings} servings</Text>
              </View>
              <View style={styles.recipeMeta}>
                <MaterialCommunityIcons
                  name="signal"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.recipeMetaText}>{item.recipe.difficulty}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Match indicator */}
        <View style={styles.matchRow}>
          <View style={styles.matchBarBg}>
            <View
              style={[
                styles.matchBarFill,
                {
                  width: `${item.matchPercentage}%`,
                  backgroundColor: getMatchColor(item.matchPercentage),
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.matchText,
              { color: getMatchColor(item.matchPercentage) },
            ]}
          >
            {item.matchPercentage}% match
          </Text>
        </View>

        <Text style={styles.ingredientsSummary}>
          ✅ {item.matchedCount} of {item.totalIngredients} ingredients available
          {item.missingIngredients.length > 0 &&
            ` • Missing: ${item.missingIngredients.map(i => i.name).join(', ')}`}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Finding recipes for you..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.headerInfo}>
        <MaterialCommunityIcons name="lightbulb-outline" size={18} color={Colors.primary} />
        <Text style={styles.headerInfoText}>
          Recipes are suggested based on your current inventory ({items.length} items)
        </Text>
      </View>

      {recipes.length === 0 ? (
        <EmptyState
          icon="chef-hat"
          title="No Recipe Matches"
          message="Add more items to your inventory to get recipe suggestions."
        />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={item => item.recipe.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.base,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.base,
  },
  headerInfoText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    flex: 1,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  recipeCard: {
    marginBottom: Spacing.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  recipeEmoji: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  matchBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.grey200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  matchBarFill: {
    height: 6,
    borderRadius: 3,
  },
  matchText: {
    ...Typography.captionBold,
    minWidth: 70,
    textAlign: 'right',
  },
  ingredientsSummary: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
