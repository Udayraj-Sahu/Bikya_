import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import React from 'react';
import Colors from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const getButtonStyle = () => {
    if (disabled) return styles.buttonDisabled;

    switch (type) {
      case 'primary':
        return styles.buttonPrimary;
      case 'secondary':
        return styles.buttonSecondary;
      case 'tertiary':
        return styles.buttonTertiary;
      case 'danger':
        return styles.buttonDanger;
      case 'outline':
        return styles.buttonOutline;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;

    switch (type) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.text;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.light.secondary,
  },
  buttonTertiary: {
    backgroundColor: Colors.light.tertiary,
  },
  buttonDanger: {
    backgroundColor: Colors.light.danger,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.disabled,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  textOutline: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  textDisabled: {
    color: Colors.light.grey3,
    fontWeight: '600',
    fontSize: 16,
  },
  fullWidth: {
    width: '100%',
  },
});