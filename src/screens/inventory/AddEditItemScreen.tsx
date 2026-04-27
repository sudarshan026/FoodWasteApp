import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useInventory } from '../../context/InventoryContext';
import { FoodCategory } from '../../models/types';
import { InventoryStackParamList } from '../../navigation/InventoryStack';
import { format, addDays } from 'date-fns';

type Props = {
  navigation: NativeStackNavigationProp<InventoryStackParamList, 'AddEditItem'>;
  route: RouteProp<InventoryStackParamList, 'AddEditItem'>;
};

const CATEGORIES: FoodCategory[] = ['Fridge', 'Pantry', 'Freezer'];
const UNITS = ['pcs', 'g', 'kg', 'L', 'ml', 'loaf', 'pack', 'bulb', 'bunch'];

const CATEGORY_ICONS: Record<string, string> = {
  Fridge: 'fridge-outline',
  Pantry: 'cupboard-outline',
  Freezer: 'snowflake',
};

export const AddEditItemScreen: React.FC<Props> = ({ navigation, route }) => {
  const existingItem = route.params?.item;
  const isEditing = !!existingItem;
  const { addItem, updateItem } = useInventory();

  const [name, setName] = useState(existingItem?.name || '');
  const [quantity, setQuantity] = useState(existingItem?.quantity?.toString() || '');
  const [unit, setUnit] = useState(existingItem?.unit || 'pcs');
  const [category, setCategory] = useState<FoodCategory>(existingItem?.category || 'Fridge');
  const [expiryDays, setExpiryDays] = useState('7');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expiryDate = existingItem
    ? format(new Date(existingItem.expiryDate), 'MMM dd, yyyy')
    : format(addDays(new Date(), parseInt(expiryDays) || 7), 'MMM dd, yyyy');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Item name is required';
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0)
      newErrors.quantity = 'Enter a valid quantity';
    if (!isEditing && (!expiryDays.trim() || isNaN(Number(expiryDays)) || Number(expiryDays) < 0))
      newErrors.expiryDays = 'Enter valid days until expiry';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing) {
        await updateItem(existingItem!.id, {
          name: name.trim(),
          quantity: Number(quantity),
          unit,
          category,
        });
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        const expiry = addDays(new Date(), parseInt(expiryDays) || 7).toISOString();
        await addItem(name.trim(), Number(quantity), unit, expiry, category);
        Alert.alert('Success', 'Item added to inventory!');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Input
        label="Item Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g., Tomatoes"
        error={errors.name}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <Input
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g., 4"
            keyboardType="numeric"
            error={errors.quantity}
          />
        </View>
        <View style={styles.flex}>
          <Text style={styles.label}>UNIT</Text>
          <View style={styles.unitGrid}>
            {UNITS.slice(0, 6).map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
                onPress={() => setUnit(u)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    unit === u && styles.unitChipTextActive,
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Category Selector */}
      <Text style={styles.label}>CATEGORY</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryCard,
              category === cat && styles.categoryCardActive,
            ]}
            onPress={() => setCategory(cat)}
          >
            <MaterialCommunityIcons
              name={CATEGORY_ICONS[cat] as any}
              size={28}
              color={category === cat ? Colors.white : Colors.textSecondary}
            />
            <Text
              style={[
                styles.categoryText,
                category === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Expiry Date */}
      {!isEditing ? (
        <View>
          <Input
            label="Days Until Expiry"
            value={expiryDays}
            onChangeText={setExpiryDays}
            placeholder="e.g., 7"
            keyboardType="numeric"
            error={errors.expiryDays}
          />
          <Text style={styles.expiryPreview}>
            📅 Expiry: {expiryDate}
          </Text>
        </View>
      ) : (
        <View style={styles.expiryInfo}>
          <MaterialCommunityIcons name="calendar" size={18} color={Colors.textSecondary} />
          <Text style={styles.expiryInfoText}>
            Expiry: {expiryDate}
          </Text>
        </View>
      )}

      <Button
        title={isEditing ? 'Update Item' : 'Add to Inventory'}
        onPress={handleSave}
        loading={loading}
        fullWidth
        style={styles.saveButton}
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
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  unitChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.grey200,
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
  },
  unitChipText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  unitChipTextActive: {
    color: Colors.white,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.grey100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  categoryText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  expiryPreview: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.base,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.grey100,
    borderRadius: BorderRadius.base,
    marginBottom: Spacing.lg,
  },
  expiryInfoText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
