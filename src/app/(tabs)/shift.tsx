import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Play,
  Square,
  Clock,
  Gauge,
  PlusCircle,
  Fuel,
  Trash2,
  CheckCircle,
  Calendar,
} from 'lucide-react-native';
import { useShiftStore } from '../../stores/useShiftStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ActiveShiftCard } from '../../components/shift/ActiveShiftCard';
import { StartShiftModal } from '../../components/shift/StartShiftModal';
import { EndShiftModal } from '../../components/shift/EndShiftModal';
import { COLORS } from '../../constants/theme';
import { formatBRL, formatKm, formatDurationFromMinutes } from '../../utils/formatters';
import { calculateHoursWorked } from '../../utils/calculations';

export default function ShiftScreen() {
  const activeShift = useShiftStore(s => s.activeShift);
  const shifts = useShiftStore(s => s.shifts);
  const cancelActiveShift = useShiftStore(s => s.cancelActiveShift);
  const deleteShift = useShiftStore(s => s.deleteShift);
  const getMetricsForCurrentShift = useFinanceStore(s => s.getMetricsForCurrentShift);
  const profile = useAuthStore(s => s.profile);

  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);

  const currentMetrics = getMetricsForCurrentShift();
  const pastShifts = shifts.filter(s => s.status === 'CLOSED');

  const confirmCancelShift = () => {
    Alert.alert(
      'Cancelar Turno',
      'Tem certeza que deseja cancelar este turno? Os dados deste turno aberto serão descartados.',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, Cancelar', style: 'destructive', onPress: cancelActiveShift },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestão de Turno</Text>
          <Text style={styles.subtitle}>
            Acompanhe o tempo em rota, quilômetros e rendimentos em tempo real.
          </Text>
        </View>

        {activeShift ? (
          <View>
            <ActiveShiftCard activeShift={activeShift} metrics={currentMetrics} />

            <View style={styles.shiftActions}>
              <Button
                title="Encerrar Turno"
                variant="danger"
                leftIcon={<Square size={16} color="#FFFFFF" fill="#FFFFFF" />}
                onPress={() => setEndModalVisible(true)}
                style={styles.mainActionBtn}
              />

              <Button
                title="Cancelar Turno"
                variant="ghost"
                onPress={confirmCancelShift}
                textStyle={{ color: COLORS.textMuted }}
              />
            </View>

            {/* Quick entries while in shift */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lançar no Turno Ativo</Text>
            </View>

            <View style={styles.quickShortcutsGrid}>
              <TouchableOpacity
                style={styles.shortcutCard}
                onPress={() => router.push('/modals/add-income' as any)}
              >
                <PlusCircle size={22} color={COLORS.primary} />
                <Text style={styles.shortcutTitle}>+ Corrida</Text>
                <Text style={styles.shortcutSub}>Uber / 99 / inDrive</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutCard}
                onPress={() => router.push('/modals/add-expense' as any)}
              >
                <Fuel size={22} color={COLORS.warning} />
                <Text style={styles.shortcutTitle}>+ Despesa</Text>
                <Text style={styles.shortcutSub}>Combustível / Alimentação</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Card style={styles.emptyShiftCard}>
            <View style={styles.emptyIconCircle}>
              <Gauge size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Pronto para começar a rodar?</Text>
            <Text style={styles.emptyDesc}>
              Registre o hodômetro de saída do seu veículo para calcularmos seus custos e lucros com precisão cirúrgica.
            </Text>
            <Button
              title="Iniciar Turno Agora"
              variant="primary"
              size="lg"
              leftIcon={<Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
              onPress={() => setStartModalVisible(true)}
              style={styles.startBtn}
            />
          </Card>
        )}

        {/* History of Closed Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Turnos Anteriores</Text>
        </View>

        {pastShifts.length === 0 ? (
          <Card style={styles.noPastShiftsCard}>
            <Text style={styles.noPastText}>Nenhum histórico de turno registrado ainda.</Text>
          </Card>
        ) : (
          pastShifts.map((s) => {
            const kmDriven = s.end_km && s.start_km ? s.end_km - s.start_km : 0;
            const hours = calculateHoursWorked(s.start_time, s.end_time);

            return (
              <Card key={s.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDateRow}>
                    <Calendar size={14} color={COLORS.primary} />
                    <Text style={styles.historyDate}>
                      {new Date(s.start_time).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteShift(s.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.historyMetricsRow}>
                  <View style={styles.historyMetricItem}>
                    <Gauge size={14} color={COLORS.info} />
                    <Text style={styles.historyMetricLabel}>Distância:</Text>
                    <Text style={styles.historyMetricValue}>{formatKm(kmDriven)}</Text>
                  </View>

                  <View style={styles.historyMetricItem}>
                    <Clock size={14} color={COLORS.warning} />
                    <Text style={styles.historyMetricLabel}>Duração:</Text>
                    <Text style={styles.historyMetricValue}>{formatDurationFromMinutes(hours * 60)}</Text>
                  </View>
                </View>

                <View style={styles.odometerSummary}>
                  <Text style={styles.odometerText}>
                    {s.start_km.toLocaleString('pt-BR')} km → {s.end_km?.toLocaleString('pt-BR')} km
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Start Shift Modal */}
      <StartShiftModal
        visible={startModalVisible}
        onClose={() => setStartModalVisible(false)}
        lastOdometer={shifts[0]?.end_km || 45000}
      />

      {/* End Shift Modal */}
      {activeShift && (
        <EndShiftModal
          visible={endModalVisible}
          onClose={() => setEndModalVisible(false)}
          startKm={activeShift.start_km}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  shiftActions: {
    gap: 8,
    marginBottom: 20,
  },
  mainActionBtn: {
    borderRadius: 14,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  quickShortcutsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: COLORS.cardElevated,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    gap: 6,
  },
  shortcutTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  shortcutSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyShiftCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.cardElevated,
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  startBtn: {
    width: '100%',
    borderRadius: 14,
  },
  noPastShiftsCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noPastText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  historyCard: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: COLORS.cardElevated,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  historyMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyMetricLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  historyMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  odometerSummary: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 8,
    marginTop: 4,
  },
  odometerText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
