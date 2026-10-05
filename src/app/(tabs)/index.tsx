import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Car,
  Clock,
  Gauge,
  HelpCircle,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { GoalProgressBar } from '../../components/dashboard/GoalProgressBar';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { ShiftStatusBanner } from '../../components/dashboard/ShiftStatusBanner';
import { RecentTransactionsList } from '../../components/dashboard/RecentTransactionsList';
import { StartShiftModal } from '../../components/shift/StartShiftModal';
import { EndShiftModal } from '../../components/shift/EndShiftModal';
import { COLORS } from '../../constants/theme';
import { formatBRL, formatKm } from '../../utils/formatters';

export default function DashboardScreen() {
  const profile = useAuthStore(s => s.profile);
  const isGuest = useAuthStore(s => s.isGuest);
  const activeShift = useShiftStore(s => s.activeShift);
  const loadShifts = useShiftStore(s => s.loadShifts);
  const transactions = useFinanceStore(s => s.transactions);
  const loadTransactions = useFinanceStore(s => s.loadTransactions);
  const deleteTransaction = useFinanceStore(s => s.deleteTransaction);
  const getMetricsForToday = useFinanceStore(s => s.getMetricsForToday);
  const getMetricsForCurrentShift = useFinanceStore(s => s.getMetricsForCurrentShift);

  const [refreshing, setRefreshing] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // If there is an active shift, calculate current shift metrics; otherwise today's metrics
  const metrics = activeShift ? getMetricsForCurrentShift() : getMetricsForToday();
  const dailyGoal = profile?.daily_goal || 250.00;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadShifts(), loadTransactions()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Olá, {profile?.name || 'Motorista'}</Text>
            <View style={styles.vehicleBadge}>
              <Car size={14} color={COLORS.textSecondary} />
              <Text style={styles.vehicleText}>
                {profile?.vehicle_model || 'Veículo Padrão'}
              </Text>
            </View>
          </View>

          {isGuest && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Modo Offline / Demonstração</Text>
            </View>
          )}
        </View>

        {/* Shift Status Widget */}
        <ShiftStatusBanner
          activeShift={activeShift}
          onStartShiftPress={() => setStartModalVisible(true)}
          onEndShiftPress={() => setEndModalVisible(true)}
        />

        {/* Hero Card: Lucro Líquido Real */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>
                {activeShift ? 'LUCRO LÍQUIDO DO TURNO' : 'LUCRO LÍQUIDO DE HOJE'}
              </Text>
              <Text
                style={[
                  styles.heroValue,
                  metrics.netProfit < 0 ? { color: COLORS.danger } : { color: COLORS.primary },
                ]}
              >
                {formatBRL(metrics.netProfit)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.formulaToggle}
              onPress={() => setShowFormulaDetails(!showFormulaDetails)}
            >
              <HelpCircle size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Real Cost Deduction Breakdown */}
          {showFormulaDetails && (
            <View style={styles.formulaBox}>
              <Text style={styles.formulaTitle}>Cálculo do Lucro Real:</Text>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaItem}>Faturamento Bruto:</Text>
                <Text style={[styles.formulaNum, { color: COLORS.primary }]}>
                  +{formatBRL(metrics.totalGrossIncome)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaItem}>Despesas Diretas (Combustível/Alimentação):</Text>
                <Text style={[styles.formulaNum, { color: COLORS.danger }]}>
                  -{formatBRL(metrics.totalDirectExpenses)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaItem}>
                  Reserva Manutenção ({formatBRL(profile?.maintenance_cost_per_km || 0.20)}/km rodado):
                </Text>
                <Text style={[styles.formulaNum, { color: COLORS.warning }]}>
                  -{formatBRL(metrics.estimatedMaintenanceCost)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.heroBottomRow}>
            <View style={styles.heroMiniStat}>
              <Text style={styles.heroMiniLabel}>Faturamento</Text>
              <Text style={styles.heroMiniIncome}>{formatBRL(metrics.totalGrossIncome)}</Text>
            </View>

            <View style={styles.heroMiniDivider} />

            <View style={styles.heroMiniStat}>
              <Text style={styles.heroMiniLabel}>Despesas Diretas</Text>
              <Text style={styles.heroMiniExpense}>{formatBRL(metrics.totalDirectExpenses)}</Text>
            </View>

            <View style={styles.heroMiniDivider} />

            <View style={styles.heroMiniStat}>
              <Text style={styles.heroMiniLabel}>Manutenção Est.</Text>
              <Text style={styles.heroMiniWarning}>{formatBRL(metrics.estimatedMaintenanceCost)}</Text>
            </View>
          </View>
        </Card>

        {/* Daily Goal Bar */}
        <GoalProgressBar
          grossIncome={metrics.totalGrossIncome}
          dailyGoal={dailyGoal}
          progress={metrics.dailyGoalProgress}
        />

        {/* Operational Efficiency KPIs Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Indicadores Operacionais</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Rendimento / km"
            value={metrics.totalKmDriven > 0 ? `${formatBRL(metrics.profitPerKm)}/km` : '--'}
            subtitle={metrics.totalKmDriven > 0 ? `Rodados: ${formatKm(metrics.totalKmDriven)}` : 'Inicie o turno'}
            icon={<Gauge size={16} color={COLORS.primary} />}
            variant="primary"
          />

          <MetricCard
            title="Rendimento / hora"
            value={metrics.totalHoursWorked > 0 ? `${formatBRL(metrics.profitPerHour)}/h` : '--'}
            subtitle={metrics.totalHoursWorked > 0 ? `${metrics.totalHoursWorked}h trabalhadas` : 'Tempo rodado'}
            icon={<Clock size={16} color={COLORS.info} />}
            variant="info"
          />
        </View>

        {/* Quick Actions for transactions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Lançamento Rápido</Text>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.incomeActionButton]}
            activeOpacity={0.85}
            onPress={() => router.push('/modals/add-income' as any)}
          >
            <View style={styles.actionIconBoxIncome}>
              <TrendingUp size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.actionButtonTitle}>+ Receita</Text>
              <Text style={styles.actionButtonSubtitle}>Uber, 99, inDrive...</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.expenseActionButton]}
            activeOpacity={0.85}
            onPress={() => router.push('/modals/add-expense' as any)}
          >
            <View style={styles.actionIconBoxExpense}>
              <TrendingDown size={20} color={COLORS.danger} />
            </View>
            <View>
              <Text style={styles.actionButtonTitle}>+ Despesa</Text>
              <Text style={styles.actionButtonSubtitle}>Combustível, almoço...</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Movimentações Recentes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history' as any)}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <RecentTransactionsList
          transactions={transactions}
          onDeleteTransaction={deleteTransaction}
          limit={5}
        />
      </ScrollView>

      {/* Start Shift Modal */}
      <StartShiftModal
        visible={startModalVisible}
        onClose={() => setStartModalVisible(false)}
        lastOdometer={45000}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vehicleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  demoBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  demoBadgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: COLORS.cardElevated,
    padding: 18,
    marginBottom: 16,
    borderColor: COLORS.cardBorder,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 4,
  },
  formulaToggle: {
    padding: 6,
  },
  formulaBox: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  formulaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  formulaItem: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  formulaNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  heroMiniStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroMiniDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.cardBorder,
  },
  heroMiniLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
    fontWeight: '600',
  },
  heroMiniIncome: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  heroMiniExpense: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.danger,
  },
  heroMiniWarning: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.warning,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  incomeActionButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  expenseActionButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionIconBoxIncome: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBoxExpense: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  actionButtonSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
