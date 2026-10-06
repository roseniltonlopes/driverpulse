import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Gauge, DollarSign, Fuel, AlertCircle } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { Shift, DashboardMetrics } from '../../types/database.types';
import { useTheme } from '../../stores/useThemeStore';
import { formatBRL, formatDurationFromSeconds } from '../../utils/formatters';

interface ActiveShiftCardProps {
  activeShift: Shift;
  metrics: DashboardMetrics;
}

export const ActiveShiftCard: React.FC<ActiveShiftCardProps> = ({
  activeShift,
  metrics,
}) => {
  const { colors, isDark } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startTs = new Date(activeShift.start_time).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startTs) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#14221B' : '#E8F5EE',
          borderColor: colors.primary,
          borderWidth: 1.5,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.tagBg, borderColor: colors.primary }]}>
          <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>TURNO ATIVO</Text>
        </View>
        <Text style={[styles.timerText, { color: colors.textPrimary }]}>
          {formatDurationFromSeconds(elapsedSeconds)}
        </Text>
      </View>

      <View style={styles.mainMetricsGrid}>
        <View style={[styles.metricBox, { backgroundColor: isDark ? colors.cardElevated : colors.card }]}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Faturamento</Text>
          <Text style={[styles.metricValue, { color: colors.primary }]}>
            {formatBRL(metrics.totalGrossIncome)}
          </Text>
        </View>

        <View style={[styles.metricBox, { backgroundColor: isDark ? colors.cardElevated : colors.card }]}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Despesas</Text>
          <Text style={[styles.metricValue, { color: colors.danger }]}>
            {formatBRL(metrics.totalDirectExpenses)}
          </Text>
        </View>
      </View>

      <View style={[styles.detailsGrid, { backgroundColor: isDark ? colors.cardElevated : colors.card }]}>
        <View style={styles.detailRow}>
          <Gauge size={16} color={colors.info} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Hodômetro Inicial:</Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {activeShift.start_km.toLocaleString('pt-BR')} km
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color={colors.warning} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Início:</Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {new Date(activeShift.start_time).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 20,
    borderRadius: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '800',
  },
  mainMetricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  detailsGrid: {
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
