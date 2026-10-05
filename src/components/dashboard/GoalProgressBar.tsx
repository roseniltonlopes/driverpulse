import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, TrendingUp } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS } from '../../constants/theme';
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
  const remaining = Math.max(0, dailyGoal - grossIncome);
  const isGoalReached = grossIncome >= dailyGoal;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Target size={18} color={COLORS.primary} />
          <Text style={styles.title}>Meta Diária</Text>
        </View>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          color={isGoalReached ? COLORS.primary : COLORS.warning}
          height={10}
        />
      </View>

      <View style={styles.valuesRow}>
        <View>
          <Text style={styles.subText}>Faturado Hoje</Text>
          <Text style={styles.currentValue}>{formatBRL(grossIncome)}</Text>
        </View>

        <View style={styles.alignRight}>
          <Text style={styles.subText}>
            {isGoalReached ? 'Meta Conquistada! 🎉' : 'Faltam'}
          </Text>
          <Text style={[styles.goalValue, isGoalReached ? { color: COLORS.primary } : null]}>
            {isGoalReached ? formatBRL(dailyGoal) : formatBRL(remaining)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.cardElevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  percentageBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressContainer: {
    marginVertical: 4,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  subText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
});
