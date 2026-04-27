import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { FoodItem, ExpiryStatus } from '../models/types';
import { Badge, CategoryBadge } from './Badge';
import { Card } from './Card';
import { InventoryService } from '../services/inventoryService';
import { format, parseISO } from 'date-fns';

interface FoodItemCardProps {
  item: FoodItem;
  onPress?: () => void;
  onDelete?: () => void;
  showCategory?: boolean;
  compact?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  Fridge: 'fridge-outline',
  Pantry: 'cupboard-outline',
  Freezer: 'snowflake',
};

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  item,
  onPress,
  onDelete,
  showCategory = true,
  compact = false,
}) => {
  const status = InventoryService.getExpiryStatus(item.expiryDate);
  const daysLeft = InventoryService.getDaysUntilExpiry(item.expiryDate);

  const statusColors: Record<ExpiryStatus, string> = {
    expired: Colors.dangerLight,
    today: Colors.dangerLight,
    soon: Colors.warningLight,
    safe: Colors.safeLight,
  };

  const borderColors: Record<ExpiryStatus, string> = {
    expired: Colors.danger,
    today: Colors.danger,
    soon: Colors.warning,
    safe: Colors.safe,
  };

  const getExpiryText = () => {
    if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} day(s) ago`;
    if (daysLeft === 0) return 'Expires today!';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `${daysLeft} days left`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.compactContainer, { borderLeftColor: borderColors[status] }]}
      >
        <View style={styles.compactBody}>
          <Text style={styles.compactName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.compactExpiry}>{getExpiryText()}</Text>
        </View>
        <Badge status={status} />
      </TouchableOpacity>
    );
  }

  return (
    <Card
      style={[
        styles.card,
        { borderLeftWidth: 4, borderLeftColor: borderColors[status] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name={CATEGORY_ICONS[item.category] as any || 'food-outline'}
              size={20}
              color={borderColors[status]}
            />
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <Badge status={status} />
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="scale"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.detailText}>
              {item.quantity} {item.unit}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.detailText}>
              {format(parseISO(item.expiryDate), 'MMM dd, yyyy')}
            </Text>
          </View>

          {showCategory && <CategoryBadge category={item.category} />}
        </View>

        <Text
          style={[
            styles.expiryText,
            { color: borderColors[status] },
          ]}
        >
          {getExpiryText()}
        </Text>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color={Colors.danger}
          />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  expiryText: {
    ...Typography.captionBold,
  },
  deleteButton: {
    position: 'absolute',
    right: Spacing.base,
    bottom: Spacing.base,
    padding: Spacing.xs,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  compactBody: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  compactName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  compactExpiry: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
