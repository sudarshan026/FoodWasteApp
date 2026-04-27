import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text.color as string}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              icon ? { marginLeft: Spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        button: {
          backgroundColor: Colors.primary,
        } as ViewStyle,
        text: {
          color: Colors.textOnPrimary,
        } as TextStyle,
      };
    case 'secondary':
      return {
        button: {
          backgroundColor: Colors.primaryLight,
        } as ViewStyle,
        text: {
          color: Colors.primaryDark,
        } as TextStyle,
      };
    case 'danger':
      return {
        button: {
          backgroundColor: Colors.danger,
        } as ViewStyle,
        text: {
          color: Colors.textOnPrimary,
        } as TextStyle,
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: Colors.primary,
        } as ViewStyle,
        text: {
          color: Colors.primary,
        } as TextStyle,
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
        } as ViewStyle,
        text: {
          color: Colors.primary,
        } as TextStyle,
      };
    default:
      return {
        button: {} as ViewStyle,
        text: {} as TextStyle,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.base,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...Typography.button,
  },
  disabled: {
    opacity: 0.5,
  },
});
