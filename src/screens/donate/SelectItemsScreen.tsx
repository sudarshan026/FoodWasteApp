import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useInventory } from '../../context/InventoryContext';
import { FoodItem, DonationItem } from '../../models/types';
import { DonateStackParamList } from '../../navigation/DonateStack';

type Props = {
  navigation: NativeStackNavigationProp<DonateStackParamList, 'SelectItems'>;
};

export const SelectItemsScreen: React.FC<Props> = ({ navigation }) => {
  const { items, loadItems } = useInventory();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadItems();
      setSelected(new Set());
    }, [loadItems])
  );

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    const selectedItems: DonationItem[] = items
      .filter(item => selected.has(item.id))
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      }));

    navigation.navigate('NGOList', { selectedItems });
  };

  const renderItem = ({ item }: { item: FoodItem }) => {
    const isSelected = selected.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
        onPress={() => toggleItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.checkbox}>
          <MaterialCommunityIcons
            name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={isSelected ? Colors.primary : Colors.grey400}
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemQuantity}>
            {item.quantity} {item.unit} • {item.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.headerInfo}>
        <MaterialCommunityIcons name="information-outline" size={18} color={Colors.primary} />
        <Text style={styles.headerInfoText}>
          Select food items you'd like to donate
        </Text>
      </View>

      {/* History button */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('DonationHistory')}
      >
        <MaterialCommunityIcons name="history" size={18} color={Colors.primary} />
        <Text style={styles.historyText}>View Donation History</Text>
      </TouchableOpacity>

      {items.length === 0 ? (
        <EmptyState
          icon="food-off-outline"
          title="No Items to Donate"
          message="Add items to your inventory first, then come back to donate surplus food."
        />
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {selected.size > 0 && (
            <View style={styles.bottomBar}>
              <Text style={styles.selectedCount}>
                {selected.size} item{selected.size !== 1 ? 's' : ''} selected
              </Text>
              <Button
                title="Choose NGO →"
                onPress={handleNext}
                style={styles.nextButton}
              />
            </View>
          )}
        </>
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
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.base,
  },
  headerInfoText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    flex: 1,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  historyText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  checkbox: {
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  itemQuantity: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 8,
  },
  selectedCount: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  nextButton: {
    minWidth: 140,
  },
});
