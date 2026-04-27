import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useDonation } from '../../context/DonationContext';
import { DonateStackParamList } from '../../navigation/DonateStack';

type Props = {
  navigation: NativeStackNavigationProp<DonateStackParamList, 'DonationConfirm'>;
  route: RouteProp<DonateStackParamList, 'DonationConfirm'>;
};

export const DonationConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedItems, ngo } = route.params;
  const { createDonation } = useDonation();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await createDonation(selectedItems, ngo.id, ngo.name);
      Alert.alert(
        '🎉 Donation Confirmed!',
        `Thank you for donating ${selectedItems.length} item(s) to ${ngo.name}. Together, we're reducing food waste!`,
        [
          {
            text: 'Great!',
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'SelectItems' }],
                })
              );
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to confirm donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Success banner */}
      <View style={styles.banner}>
        <MaterialCommunityIcons name="heart" size={40} color={Colors.white} />
        <Text style={styles.bannerTitle}>Review Your Donation</Text>
        <Text style={styles.bannerSubtitle}>Every item donated makes a difference!</Text>
      </View>

      {/* NGO Info */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Donating To</Text>
        <View style={styles.ngoRow}>
          <View style={styles.ngoIconBg}>
            <MaterialCommunityIcons name="office-building" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.ngoName}>{ngo.name}</Text>
            <Text style={styles.ngoAddress}>{ngo.address}</Text>
            <Text style={styles.ngoDistance}>{ngo.distance} km away</Text>
          </View>
        </View>
        {ngo.pickupAvailable && (
          <View style={styles.pickupBadge}>
            <MaterialCommunityIcons name="truck-check" size={16} color={Colors.primary} />
            <Text style={styles.pickupText}>Pickup will be arranged</Text>
          </View>
        )}
      </Card>

      {/* Items */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Items ({selectedItems.length})</Text>
        {selectedItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemDot} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>
              {item.quantity} {item.unit}
            </Text>
          </View>
        ))}
      </Card>

      {/* Confirm */}
      <Button
        title="✅ Confirm Donation"
        onPress={handleConfirm}
        loading={loading}
        fullWidth
        style={styles.confirmButton}
      />

      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        variant="ghost"
        fullWidth
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
  banner: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.base,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  bannerTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  bannerSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  section: {
    margin: Spacing.base,
    marginBottom: 0,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  ngoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ngoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ngoName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  ngoAddress: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  ngoDistance: {
    ...Typography.small,
    color: Colors.primary,
    marginTop: 2,
  },
  pickupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  pickupText: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
  },
  itemName: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemQty: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  confirmButton: {
    margin: Spacing.base,
    marginBottom: Spacing.sm,
  },
});
