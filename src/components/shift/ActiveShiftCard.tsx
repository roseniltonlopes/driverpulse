import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Gauge, DollarSign, Fuel, AlertCircle } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { Shift, DashboardMetrics } from '../../types/database.types';
import { COLORS } from '../../constants/theme';
import { formatBRL, formatDurationFromSeconds } from '../../utils/formatters';

interface ActiveShiftCardProps {
  activeShift: Shift;
  metrics: DashboardMetrics;
}

export const ActiveShiftCard: React.FC<ActiveShiftCardProps> = ({
  activeShift,
  metrics,
}) => {
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
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <View style={styles.pulseDot} />
          <Text style={styles.badgeText}>TURNO ATIVO</Text>
        </View>
        <Text style={styles.timerText}>{formatDurationFromSeconds(elapsedSeconds)}</Text>
      </View>

      <View style={styles.mainMetricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Faturamento</Text>
          <Text style={[styles.metricValue, { color: COLORS.primary }]}>
            {formatBRL(metrics.totalGrossIncome)}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Despesas Diretas</Text>
          <Text style={[styles.metricValue, { color: COLORS.danger }]}>
            {formatBRL(metrics.totalDirectExpenses)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailRow}>
          <Gauge size={16} color={COLORS.info} />
          <Text style={styles.detailLabel}>Hodômetro Inicial:</Text>
          <Text style={styles.detailValue}>
            {activeShift.start_km.toLocaleString('pt-BR')} km
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color={COLORS.warning} />
          <Text style={styles.detailLabel}>Início:</Text>
          <Text style={styles.detailValue}>
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
    backgroundColor: '#161B26',
    borderColor: COLORS.warning,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 20,
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
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },
  badgeText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  mainMetricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.cardElevated,
    padding: 12,
    borderRadius: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  detailsGrid: {
    backgroundColor: COLORS.cardElevated,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
