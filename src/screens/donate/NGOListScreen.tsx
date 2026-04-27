import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { DonationService } from '../../services/donationService';
import { NGO } from '../../models/types';
import { DonateStackParamList } from '../../navigation/DonateStack';

type Props = {
  navigation: NativeStackNavigationProp<DonateStackParamList, 'NGOList'>;
  route: RouteProp<DonateStackParamList, 'NGOList'>;
};

export const NGOListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedItems } = route.params;
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNGOs = async () => {
      try {
        const data = await DonationService.getNGOs();
        setNgos(data);
      } catch (error) {
        console.error('Error loading NGOs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadNGOs();
  }, []);

  const renderNGO = ({ item }: { item: NGO }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('DonationConfirm', { selectedItems, ngo: item })
      }
    >
      <Card style={styles.ngoCard}>
        <View style={styles.ngoHeader}>
          <View style={styles.ngoIconBg}>
            <MaterialCommunityIcons
              name="office-building"
              size={24}
              color={Colors.primary}
            />
          </View>
          <View style={styles.ngoInfo}>
            <Text style={styles.ngoName}>{item.name}</Text>
            <Text style={styles.ngoAddress}>{item.address}</Text>
          </View>
        </View>

        <View style={styles.ngoDetails}>
          <View style={styles.ngoDetail}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.ngoDetailText}>{item.distance} km away</Text>
          </View>
          <View style={styles.ngoDetail}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.ngoDetailText}>{item.operatingHours}</Text>
          </View>
          <View style={styles.ngoDetail}>
            <MaterialCommunityIcons
              name={item.pickupAvailable ? 'truck-check' : 'truck-remove'}
              size={16}
              color={item.pickupAvailable ? Colors.primary : Colors.textLight}
            />
            <Text
              style={[
                styles.ngoDetailText,
                { color: item.pickupAvailable ? Colors.primary : Colors.textLight },
              ]}
            >
              {item.pickupAvailable ? 'Pickup Available' : 'Drop-off Only'}
            </Text>
          </View>
        </View>

        <View style={styles.selectRow}>
          <Text style={styles.selectText}>Select →</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Loading nearby organizations..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <MaterialCommunityIcons name="map-marker" size={18} color={Colors.primary} />
        <Text style={styles.headerInfoText}>
          Showing {ngos.length} nearby organizations (sorted by distance)
        </Text>
      </View>

      <FlatList
        data={ngos}
        renderItem={renderNGO}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  },
  ngoCard: {
    marginBottom: Spacing.md,
  },
  ngoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ngoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  ngoInfo: {
    flex: 1,
  },
  ngoName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  ngoAddress: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ngoDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ngoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ngoDetailText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  selectRow: {
    alignItems: 'flex-end',
  },
  selectText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
});
