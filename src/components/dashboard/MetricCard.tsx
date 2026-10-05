import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card } from '../ui/Card';
import { COLORS } from '../../constants/theme';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'info' | 'default';
  style?: StyleProp<ViewStyle>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  style,
}) => {
  const getHighlightColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'danger':
        return COLORS.danger;
      case 'warning':
        return COLORS.warning;
      case 'info':
        return COLORS.info;
      default:
        return COLORS.textPrimary;
    }
  };

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconContainer}>{icon}</View>
      </View>
      <Text style={[styles.value, { color: getHighlightColor() }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.cardElevated,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
