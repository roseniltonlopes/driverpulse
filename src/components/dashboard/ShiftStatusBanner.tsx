import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Play, Square, Clock, Gauge, ArrowRight } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { Shift } from '../../types/database.types';
import { COLORS } from '../../constants/theme';
import { formatDurationFromSeconds } from '../../utils/formatters';

interface ShiftStatusBannerProps {
  activeShift: Shift | null;
  onStartShiftPress: () => void;
  onEndShiftPress: () => void;
}

export const ShiftStatusBanner: React.FC<ShiftStatusBannerProps> = ({
  activeShift,
  onStartShiftPress,
  onEndShiftPress,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeShift) {
      setElapsedSeconds(0);
      return;
    }

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

  if (!activeShift) {
    return (
      <Card style={[styles.card, styles.inactiveCard]}>
        <View style={styles.contentRow}>
          <View style={styles.left}>
            <View style={styles.statusDotInactive} />
            <View>
              <Text style={styles.inactiveTitle}>Nenhum Turno Aberto</Text>
              <Text style={styles.inactiveSubtitle}>Inicie o turno para rastrear seus ganhos e km</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={onStartShiftPress}
            activeOpacity={0.8}
          >
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startButtonText}>Iniciar</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, styles.activeCard]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/(tabs)/shift' as any)}
      >
        <View style={styles.activeHeader}>
          <View style={styles.activeBadgeRow}>
            <View style={styles.statusDotActive} />
            <Text style={styles.activeStatusText}>TURNO EM ANDAMENTO</Text>
          </View>
          <ArrowRight size={16} color={COLORS.textSecondary} />
        </View>

        <View style={styles.activeInfoRow}>
          <View style={styles.infoItem}>
            <Clock size={16} color={COLORS.warning} />
            <View>
              <Text style={styles.infoLabel}>Tempo Rodando</Text>
              <Text style={styles.timerValue}>{formatDurationFromSeconds(elapsedSeconds)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Gauge size={16} color={COLORS.info} />
            <View>
              <Text style={styles.infoLabel}>Hodômetro Inicial</Text>
              <Text style={styles.kmValue}>{activeShift.start_km.toLocaleString('pt-BR')} km</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.endShiftButton}
            onPress={onEndShiftPress}
            activeOpacity={0.8}
          >
            <Square size={14} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.endShiftButtonText}>Encerrar Turno</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  inactiveCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.cardBorder,
  },
  activeCard: {
    backgroundColor: '#1E1E2E',
    borderColor: COLORS.warning,
    borderWidth: 1.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  statusDotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textMuted,
    marginRight: 12,
  },
  statusDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.warning,
    marginRight: 8,
  },
  inactiveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inactiveSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  activeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.warning,
    letterSpacing: 0.5,
  },
  activeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.cardElevated,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  timerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  kmValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.cardBorder,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  endShiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  endShiftButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
