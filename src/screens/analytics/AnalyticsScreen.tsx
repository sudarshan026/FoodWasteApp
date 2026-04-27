import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsService } from '../../services/analyticsService';
import { Analytics } from '../../models/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const AnalyticsScreen: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    try {
      const data = await AnalyticsService.getAnalytics(user.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading || !analytics) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Title */}
        <Text style={styles.title}>📊 Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Your food saving impact</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconBg, { backgroundColor: '#E8F8F5' }]}>
              <MaterialCommunityIcons name="recycle" size={24} color="#1ABC9C" />
            </View>
            <Text style={styles.summaryValue}>{analytics.wasteReduced.toFixed(1)} kg</Text>
            <Text style={styles.summaryLabel}>Waste Reduced</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconBg, { backgroundColor: Colors.primaryLight }]}>
              <MaterialCommunityIcons name="currency-inr" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.summaryValue}>₹{analytics.moneySaved.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Money Saved</Text>
          </Card>
        </View>

        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconBg, { backgroundColor: '#FADBD8' }]}>
              <MaterialCommunityIcons name="heart" size={24} color={Colors.danger} />
            </View>
            <Text style={styles.summaryValue}>{analytics.totalDonations}</Text>
            <Text style={styles.summaryLabel}>Donations</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <View style={[styles.summaryIconBg, { backgroundColor: '#FEF5E7' }]}>
              <MaterialCommunityIcons name="food-apple" size={24} color="#F39C12" />
            </View>
            <Text style={styles.summaryValue}>{analytics.itemsSaved}</Text>
            <Text style={styles.summaryLabel}>Items Tracked</Text>
          </Card>
        </View>

        {/* Weekly Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>📈 Weekly Waste Trend</Text>
          <LineChart
            data={{
              labels: analytics.weeklyData.map(d => d.day),
              datasets: [
                {
                  data: analytics.weeklyData.map(d => d.waste),
                  strokeWidth: 3,
                },
              ],
            }}
            width={SCREEN_WIDTH - Spacing.base * 4 - Spacing.xxl}
            height={200}
            chartConfig={{
              backgroundColor: Colors.card,
              backgroundGradientFrom: Colors.card,
              backgroundGradientTo: Colors.card,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
              labelColor: () => Colors.textSecondary,
              style: { borderRadius: BorderRadius.base },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: Colors.primary,
              },
              propsForBackgroundLines: {
                strokeDasharray: '4 4',
                stroke: Colors.grey200,
              },
            }}
            bezier
            style={styles.chart}
            yAxisSuffix=" kg"
          />
        </Card>

        {/* Category Breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🗂️ Category Breakdown</Text>
          {analytics.categoryBreakdown.map((cat, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
              <Text style={styles.categoryName}>{cat.category}</Text>
              <View style={styles.categoryBarBg}>
                <View
                  style={[
                    styles.categoryBarFill,
                    {
                      backgroundColor: cat.color,
                      width: `${
                        analytics.itemsSaved > 0
                          ? (cat.amount / analytics.itemsSaved) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{cat.amount}</Text>
            </View>
          ))}
        </Card>

        {/* Monthly Goal */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎯 Monthly Goal</Text>
          <Text style={styles.goalText}>
            Reduce {analytics.monthlyGoal} kg of food waste this month
          </Text>
          <ProgressBar
            progress={analytics.monthlyProgress / analytics.monthlyGoal}
            label={`${analytics.monthlyProgress.toFixed(1)} / ${analytics.monthlyGoal} kg`}
            height={14}
            style={styles.goalProgress}
          />
          {analytics.monthlyProgress >= analytics.monthlyGoal ? (
            <View style={styles.goalAchieved}>
              <MaterialCommunityIcons name="trophy" size={20} color="#F39C12" />
              <Text style={styles.goalAchievedText}>Goal Achieved! 🎉</Text>
            </View>
          ) : (
            <Text style={styles.goalRemaining}>
              {(analytics.monthlyGoal - analytics.monthlyProgress).toFixed(1)} kg remaining
            </Text>
          )}
        </Card>
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
    paddingBottom: Spacing.huge,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  summaryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  summaryValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  summaryLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  // Chart
  chartCard: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.base,
    marginLeft: -Spacing.sm,
  },
  // Category
  sectionCard: {
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  categoryName: {
    ...Typography.body,
    color: Colors.textPrimary,
    width: 60,
  },
  categoryBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.grey200,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: Spacing.sm,
  },
  categoryBarFill: {
    height: 8,
    borderRadius: 4,
  },
  categoryCount: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    width: 24,
    textAlign: 'right',
  },
  // Goal
  goalText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  goalProgress: {
    marginBottom: Spacing.md,
  },
  goalAchieved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#FEF5E7',
    borderRadius: BorderRadius.md,
  },
  goalAchievedText: {
    ...Typography.bodyBold,
    color: '#F39C12',
  },
  goalRemaining: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
