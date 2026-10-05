import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, PLATFORM_INFO, EXPENSE_INFO } from '../../constants/theme';
import { TransactionCategory } from '../../types/database.types';

interface BadgeProps {
  category: TransactionCategory | string;
  type?: 'INCOME' | 'EXPENSE';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ category, type, style, textStyle }) => {
  const info = PLATFORM_INFO[category] || EXPENSE_INFO[category] || {
    label: category,
    color: COLORS.primary,
    badgeBg: COLORS.primaryLight,
    textColor: COLORS.primary,
  };

  return (
    <View style={[styles.badge, { backgroundColor: info.badgeBg, borderColor: info.color }, style]}>
      <Text style={[styles.text, { color: info.textColor }, textStyle]}>
        {info.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
