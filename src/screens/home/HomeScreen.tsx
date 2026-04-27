import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { FoodItemCard } from '../../components/FoodItemCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { FoodItem, Analytics } from '../../models/types';
import { AnalyticsService } from '../../services/analyticsService';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, loadItems, isLoading } = useInventory();
  const navigation = useNavigation<any>();
  const [expiringItems, setExpiringItems] = useState<FoodItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await loadItems();
    if (user) {
      const analyticsData = await AnalyticsService.getAnalytics(user.id);
      setAnalytics(analyticsData);
    }
  }, [user, loadItems]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    // Filter expiring items from loaded items
    const expiring = items
      .filter(item => {
        const days = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return days <= 3;
      })
      .sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )
      .slice(0, 3);
    setExpiringItems(expiring);
  }, [items]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const QuickAction = ({
    icon,
    label,
    color,
    onPress,
  }: {
    icon: string;
    label: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: color + '15' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={Colors.white} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'there'} 👋
            </Text>
            <Text style={styles.headerSubtitle}>
              Let's reduce food waste today!
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Impact Summary */}
        <View style={styles.impactRow}>
          <Card style={styles.impactCard}>
            <View style={[styles.impactIconBg, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="currency-inr" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.impactValue}>₹{analytics?.moneySaved?.toFixed(0) || '0'}</Text>
            <Text style={styles.impactLabel}>Money Saved</Text>
          </Card>
          <Card style={styles.impactCard}>
            <View style={[styles.impactIconBg, { backgroundColor: '#E8F8F5' }]}>
              <MaterialCommunityIcons name="recycle" size={20} color="#1ABC9C" />
            </View>
            <Text style={styles.impactValue}>{analytics?.wasteReduced?.toFixed(1) || '0'} kg</Text>
            <Text style={styles.impactLabel}>Waste Reduced</Text>
          </Card>
        </View>

        {/* Expiring Soon */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Expiring Soon</Text>
            <TouchableOpacity onPress={() => navigation.navigate('InventoryTab')}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {expiringItems.length > 0 ? (
            expiringItems.map(item => (
              <FoodItemCard
                key={item.id}
                item={item}
                compact
                onPress={() =>
                  navigation.navigate('InventoryTab', {
                    screen: 'AddEditItem',
                    params: { item },
                  })
                }
              />
            ))
          ) : (
            <Card>
              <View style={styles.emptyExpiring}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={32}
                  color={Colors.primary}
                />
                <Text style={styles.emptyExpiringText}>
                  No items expiring soon. Great job! 🎉
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="plus-circle"
              label="Add Item"
              color={Colors.primary}
              onPress={() =>
                navigation.navigate('InventoryTab', {
                  screen: 'AddEditItem',
                })
              }
            />
            <QuickAction
              icon="chef-hat"
              label="Recipes"
              color="#F39C12"
              onPress={() => navigation.navigate('RecipesTab')}
            />
            <QuickAction
              icon="heart"
              label="Donate"
              color="#E74C3C"
              onPress={() => navigation.navigate('DonateTab')}
            />
          </View>
        </View>

        {/* Inventory Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Inventory Overview</Text>
          <Card>
            <View style={styles.inventoryOverview}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>
                  {items.filter(i => i.category === 'Fridge').length}
                </Text>
                <Text style={styles.overviewLabel}>Fridge</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>
                  {items.filter(i => i.category === 'Pantry').length}
                </Text>
                <Text style={styles.overviewLabel}>Pantry</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>
                  {items.filter(i => i.category === 'Freezer').length}
                </Text>
                <Text style={styles.overviewLabel}>Freezer</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <Text style={[styles.overviewValue, { color: Colors.primary }]}>
                  {items.length}
                </Text>
                <Text style={styles.overviewLabel}>Total</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.base,
    paddingTop: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.grey100,
    borderRadius: BorderRadius.full,
  },
  // Impact
  impactRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  impactCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  impactIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  impactValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  impactLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  seeAll: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  // Empty
  emptyExpiring: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyExpiringText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.base,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  // Inventory Overview
  inventoryOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  overviewLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overviewDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.divider,
  },
});
