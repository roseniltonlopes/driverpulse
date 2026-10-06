import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Play, Square, Clock, Gauge, ArrowRight } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { Shift } from '../../types/database.types';
import { useTheme } from '../../stores/useThemeStore';
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
  const { colors, isDark } = useTheme();
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
      <Card style={styles.card}>
        <View style={styles.contentRow}>
          <View style={styles.left}>
            <View style={[styles.statusDotInactive, { backgroundColor: colors.textMuted }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.inactiveTitle, { color: colors.textPrimary }]}>
                Nenhum Turno Aberto
              </Text>
              <Text style={[styles.inactiveSubtitle, { color: colors.textMuted }]}>
                Inicie para rastrear km e ganhos em tempo real
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={onStartShiftPress}
            activeOpacity={0.85}
          >
            <Play size={14} color="#091A12" fill="#091A12" />
            <Text style={styles.startButtonText}>Iniciar</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/(tabs)/shift' as any)}
      >
        <View style={styles.activeHeader}>
          <View style={styles.activeBadgeRow}>
            <View style={[styles.statusDotActive, { backgroundColor: colors.primary }]} />
            <Text style={[styles.activeStatusText, { color: colors.primary }]}>
              TURNO EM ANDAMENTO
            </Text>
          </View>
          <ArrowRight size={16} color={colors.textSecondary} />
        </View>

        <View
          style={[
            styles.activeInfoRow,
            { backgroundColor: isDark ? colors.cardElevated : colors.card },
          ]}
        >
          <View style={styles.infoItem}>
            <Clock size={16} color={colors.warning} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tempo Rodando</Text>
              <Text style={[styles.timerValue, { color: colors.textPrimary }]}>
                {formatDurationFromSeconds(elapsedSeconds)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <View style={styles.infoItem}>
            <Gauge size={16} color={colors.info} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Hodômetro Inicial</Text>
              <Text style={[styles.kmValue, { color: colors.textPrimary }]}>
                {activeShift.start_km.toLocaleString('pt-BR')} km
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={[styles.endShiftButton, { backgroundColor: colors.danger }]}
            onPress={onEndShiftPress}
            activeOpacity={0.8}
          >
            <Square size={13} color="#FFFFFF" fill="#FFFFFF" />
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
    marginRight: 12,
  },
  statusDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  inactiveTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  inactiveSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 6,
  },
  startButtonText: {
    color: '#091A12',
    fontWeight: '800',
    fontSize: 13,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStatusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  activeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  kmValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: '80%',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  endShiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  endShiftButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
