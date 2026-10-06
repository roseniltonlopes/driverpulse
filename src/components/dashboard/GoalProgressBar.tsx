import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, TrendingUp, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../ui/Card';
import { useTheme } from '../../stores/useThemeStore';
import { formatBRL } from '../../utils/formatters';

interface GoalProgressBarProps {
  grossIncome: number;
  dailyGoal: number;
  progress: number;
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  grossIncome,
  dailyGoal,
  progress,
}) => {
  const { colors, isDark } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const remaining = Math.max(0, dailyGoal - grossIncome);
  const isGoalReached = grossIncome >= dailyGoal;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Target size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Meta Diária</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {isGoalReached ? '🎉 Meta batida hoje!' : `Faltam ${formatBRL(remaining)}`}
            </Text>
          </View>
        </View>

        {/* Circular / Pill Percentage Gauge */}
        <View style={[styles.percentageCircle, { borderColor: colors.primary, backgroundColor: colors.tagBg }]}>
          <Text style={[styles.percentageText, { color: colors.primary }]}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      </View>

      {/* Modern Gradient Track */}
      <View style={[styles.track, { backgroundColor: isDark ? '#141E19' : '#E2EDE7' }]}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${clampedProgress}%` }]}
        />
      </View>

      <View style={styles.valuesRow}>
        <View>
          <Text style={[styles.subText, { color: colors.textMuted }]}>Faturado</Text>
          <Text style={[styles.currentValue, { color: colors.textPrimary }]}>
            {formatBRL(grossIncome)}
          </Text>
        </View>

        <View style={styles.alignRight}>
          <Text style={[styles.subText, { color: colors.textMuted }]}>Objetivo</Text>
          <Text style={[styles.goalValue, { color: colors.primary }]}>
            {formatBRL(dailyGoal)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  percentageCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '900',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  subText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
});
