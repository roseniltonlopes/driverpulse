import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card } from '../ui/Card';
import { useTheme } from '../../stores/useThemeStore';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'info' | 'default';
  showBars?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  showBars = false,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getHighlightColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.textPrimary;
    }
  };

  return (
    <Card variant="elevated" style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: colors.tagBg }]}>
          {icon}
        </View>
      </View>

      <View style={styles.middleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.value, { color: getHighlightColor() }]}>{value}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Mini Audio/Activity Bars Visualizer from the inspiration screenshot */}
        {showBars && (
          <View style={styles.barsContainer}>
            <View style={[styles.bar, { height: 10, backgroundColor: isDark ? '#263830' : '#D0E3DA' }]} />
            <View style={[styles.bar, { height: 16, backgroundColor: isDark ? '#263830' : '#D0E3DA' }]} />
            <View style={[styles.bar, { height: 22, backgroundColor: isDark ? '#263830' : '#D0E3DA' }]} />
            <View style={[styles.bar, { height: 14, backgroundColor: isDark ? '#263830' : '#D0E3DA' }]} />
            <View style={[styles.bar, { height: 28, backgroundColor: colors.primary }]} />
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    borderRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
    paddingBottom: 2,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});
