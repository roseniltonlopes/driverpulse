import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../stores/useThemeStore';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outline' | 'glow';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variant === 'elevated' ? colors.cardElevated : colors.card,
          borderColor: colors.cardBorder,
        },
        variant === 'elevated' && (isDark ? styles.elevatedDark : styles.elevatedLight),
        variant === 'glow' && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.35 : 0.15,
          shadowRadius: 12,
          elevation: 6,
        },
        variant === 'outline' && {
          backgroundColor: 'transparent',
          borderColor: colors.cardBorder,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  elevatedDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  elevatedLight: {
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
});
