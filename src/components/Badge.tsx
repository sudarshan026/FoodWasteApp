import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { ExpiryStatus } from '../models/types';

interface BadgeProps {
  status: ExpiryStatus;
  label?: string;
  style?: ViewStyle;
}

const BADGE_CONFIG: Record<ExpiryStatus, { bg: string; text: string; label: string }> = {
  expired: { bg: Colors.danger, text: Colors.white, label: 'Expired' },
  today: { bg: Colors.danger, text: Colors.white, label: 'Today' },
  soon: { bg: Colors.warning, text: Colors.white, label: 'Soon' },
  safe: { bg: Colors.safe, text: Colors.white, label: 'Safe' },
};

export const Badge: React.FC<BadgeProps> = ({ status, label, style }) => {
  const config = BADGE_CONFIG[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        style,
      ]}
    >
      <Text style={[styles.text, { color: config.text }]}>
        {label || config.label}
      </Text>
    </View>
  );
};

// Simple category badge
interface CategoryBadgeProps {
  category: string;
  style?: ViewStyle;
}

const CATEGORY_COLORS: Record<string, string> = {
  Fridge: '#3498DB',
  Pantry: '#F39C12',
  Freezer: '#9B59B6',
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, style }) => {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: CATEGORY_COLORS[category] || Colors.grey500 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: Colors.white }]}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
