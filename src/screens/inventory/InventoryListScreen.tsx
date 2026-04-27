import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { FoodItemCard } from '../../components/FoodItemCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useInventory } from '../../context/InventoryContext';
import { FoodItem, FoodCategory } from '../../models/types';
import { InventoryStackParamList } from '../../navigation/InventoryStack';

type Props = {
  navigation: NativeStackNavigationProp<InventoryStackParamList, 'InventoryList'>;
};

const CATEGORIES: (FoodCategory | 'All')[] = ['All', 'Fridge', 'Pantry', 'Freezer'];

export const InventoryListScreen: React.FC<Props> = ({ navigation }) => {
  const { items, loadItems, deleteItem, isLoading } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'All'>('All');

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter(item => item.category === selectedCategory);

  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const handleDelete = (item: FoodItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(item.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: FoodItem }) => (
    <FoodItemCard
      item={item}
      onPress={() => navigation.navigate('AddEditItem', { item })}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <View style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterChip,
              selectedCategory === cat && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat && styles.filterChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items Count */}
      <Text style={styles.countText}>
        {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
      </Text>

      {isLoading ? (
        <LoadingSpinner message="Loading inventory..." />
      ) : sortedItems.length === 0 ? (
        <EmptyState
          icon="food-off-outline"
          title="No Items Yet"
          message="Add your food items to start tracking expiry dates and reducing waste."
        />
      ) : (
        <FlatList
          data={sortedItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditItem')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.grey200,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  countText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
