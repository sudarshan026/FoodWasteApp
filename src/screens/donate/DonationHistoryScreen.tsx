import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useDonation } from '../../context/DonationContext';
import { Donation } from '../../models/types';
import { format, parseISO } from 'date-fns';

export const DonationHistoryScreen: React.FC = () => {
  const { donations, loadDonations, isLoading } = useDonation();

  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [loadDonations])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.primary;
      case 'confirmed': return Colors.warning;
      default: return Colors.textLight;
    }
  };

  const renderDonation = ({ item }: { item: Donation }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.ngoRow}>
          <MaterialCommunityIcons name="heart" size={20} color={Colors.danger} />
          <Text style={styles.ngoName}>{item.ngoName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>
        {format(parseISO(item.date), 'MMM dd, yyyy • h:mm a')}
      </Text>

      <View style={styles.itemsList}>
        {item.items.map((donatedItem, index) => (
          <Text key={index} style={styles.itemText}>
            • {donatedItem.name} ({donatedItem.quantity} {donatedItem.unit})
          </Text>
        ))}
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading donation history..." />;
  }

  return (
    <View style={styles.container}>
      {donations.length > 0 && (
        <View style={styles.summary}>
          <MaterialCommunityIcons name="gift-outline" size={20} color={Colors.primary} />
          <Text style={styles.summaryText}>
            You've made {donations.length} donation{donations.length !== 1 ? 's' : ''}! 🎉
          </Text>
        </View>
      )}

      {donations.length === 0 ? (
        <EmptyState
          icon="gift-off-outline"
          title="No Donations Yet"
          message="Your donation history will appear here once you donate food items."
        />
      ) : (
        <FlatList
          data={donations}
          renderItem={renderDonation}
          keyExtractor={item => item.id}
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.base,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.base,
  },
  summaryText: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
  },
  listContent: {
    padding: Spacing.base,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ngoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  ngoName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  itemsList: {
    marginTop: Spacing.xs,
  },
  itemText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
});
