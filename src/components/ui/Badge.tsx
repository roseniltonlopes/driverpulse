import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { PLATFORM_INFO, EXPENSE_INFO } from '../../constants/theme';
import { TransactionCategory } from '../../types/database.types';
import { useTheme } from '../../stores/useThemeStore';

interface BadgeProps {
  category: TransactionCategory | string;
  type?: 'INCOME' | 'EXPENSE';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  category,
  type,
  style,
  textStyle,
  showDot = true,
}) => {
  const { colors, isDark } = useTheme();

  const info = PLATFORM_INFO[category] || EXPENSE_INFO[category] || {
    label: category,
    color: colors.primary,
    badgeBg: colors.primaryLight,
    textColor: colors.primary,
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? colors.tagBg : colors.tagBg,
          borderColor: isDark ? colors.tagBorder : colors.cardBorder,
        },
        style,
      ]}
    >
      {showDot && (
        <View style={[styles.dot, { backgroundColor: info.color }]} />
      )}
      <Text
        style={[
          styles.text,
          { color: isDark ? colors.textPrimary : colors.textPrimary },
          textStyle,
        ]}
      >
        {info.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
