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
  Calendar,
} from 'lucide-react-native';
import { useShiftStore } from '../../stores/useShiftStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../stores/useThemeStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ActiveShiftCard } from '../../components/shift/ActiveShiftCard';
import { StartShiftModal } from '../../components/shift/StartShiftModal';
import { EndShiftModal } from '../../components/shift/EndShiftModal';
import { formatBRL, formatKm, formatDurationFromMinutes } from '../../utils/formatters';
import { calculateHoursWorked } from '../../utils/calculations';

export default function ShiftScreen() {
  const { colors } = useTheme();
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Gestão de Turno</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
                textStyle={{ color: colors.textMuted }}
              />
            </View>

            {/* Quick entries while in shift */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Lançar no Turno Ativo
              </Text>
            </View>

            <View style={styles.quickShortcutsGrid}>
              <TouchableOpacity
                style={[
                  styles.shortcutCard,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={() => router.push('/modals/add-income' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <PlusCircle size={20} color={colors.primary} />
                </View>
                <Text style={[styles.shortcutTitle, { color: colors.textPrimary }]}>+ Corrida</Text>
                <Text style={[styles.shortcutSub, { color: colors.textMuted }]}>
                  Uber / 99 / inDrive
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shortcutCard,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={() => router.push('/modals/add-expense' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.warningLight }]}>
                  <Fuel size={20} color={colors.warning} />
                </View>
                <Text style={[styles.shortcutTitle, { color: colors.textPrimary }]}>+ Despesa</Text>
                <Text style={[styles.shortcutSub, { color: colors.textMuted }]}>
                  Combustível / Refeição
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Card variant="elevated" style={styles.emptyShiftCard}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Gauge size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Pronto para começar a rodar?
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Registre o hodômetro de saída do seu veículo para calcularmos seus custos e lucros com precisão cirúrgica.
            </Text>
            <Button
              title="Iniciar Turno Agora"
              variant="primary"
              size="lg"
              leftIcon={<Play size={18} color="#091A12" fill="#091A12" />}
              onPress={() => setStartModalVisible(true)}
              style={styles.startBtn}
            />
          </Card>
        )}

        {/* History of Closed Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Turnos Anteriores
          </Text>
        </View>

        {pastShifts.length === 0 ? (
          <Card style={styles.noPastShiftsCard}>
            <Text style={[styles.noPastText, { color: colors.textMuted }]}>
              Nenhum histórico de turno registrado ainda.
            </Text>
          </Card>
        ) : (
          pastShifts.map((s) => {
            const kmDriven = s.end_km && s.start_km ? s.end_km - s.start_km : 0;
            const hours = calculateHoursWorked(s.start_time, s.end_time);

            return (
              <Card key={s.id} variant="elevated" style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDateRow}>
                    <Calendar size={14} color={colors.primary} />
                    <Text style={[styles.historyDate, { color: colors.textPrimary }]}>
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
                    <Trash2 size={13} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.historyMetricsRow}>
                  <View style={styles.historyMetricItem}>
                    <Gauge size={14} color={colors.info} />
                    <Text style={[styles.historyMetricLabel, { color: colors.textMuted }]}>
                      Distância:
                    </Text>
                    <Text style={[styles.historyMetricValue, { color: colors.textPrimary }]}>
                      {formatKm(kmDriven)}
                    </Text>
                  </View>

                  <View style={styles.historyMetricItem}>
                    <Clock size={14} color={colors.warning} />
                    <Text style={[styles.historyMetricLabel, { color: colors.textMuted }]}>
                      Duração:
                    </Text>
                    <Text style={[styles.historyMetricValue, { color: colors.textPrimary }]}>
                      {formatDurationFromMinutes(hours * 60)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.odometerSummary, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.odometerText, { color: colors.textMuted }]}>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  shiftActions: {
    gap: 8,
    marginBottom: 20,
  },
  mainActionBtn: {
    borderRadius: 18,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  quickShortcutsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shortcutCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  shortcutSub: {
    fontSize: 11,
  },
  emptyShiftCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  startBtn: {
    width: '100%',
    borderRadius: 18,
  },
  noPastShiftsCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noPastText: {
    fontSize: 13,
  },
  historyCard: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 20,
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
  },
  historyMetricValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  odometerSummary: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  odometerText: {
    fontSize: 11,
  },
});
