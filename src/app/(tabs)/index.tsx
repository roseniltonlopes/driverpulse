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
  Car,
  Clock,
  Gauge,
  HelpCircle,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useTheme } from '../../stores/useThemeStore';
import { Card } from '../../components/ui/Card';
import { GoalProgressBar } from '../../components/dashboard/GoalProgressBar';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { ShiftStatusBanner } from '../../components/dashboard/ShiftStatusBanner';
import { QuickActionsGrid } from '../../components/dashboard/QuickActionsGrid';
import { RecentTransactionsList } from '../../components/dashboard/RecentTransactionsList';
import { StartShiftModal } from '../../components/shift/StartShiftModal';
import { EndShiftModal } from '../../components/shift/EndShiftModal';
import { formatBRL, formatKm } from '../../utils/formatters';

export default function DashboardScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
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

  const metrics = activeShift ? getMetricsForCurrentShift() : getMetricsForToday();
  const dailyGoal = profile?.daily_goal || 250.00;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadShifts(), loadTransactions()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header with Greeting and Theme Toggle Switch */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greetingLabel, { color: colors.textMuted }]}>
              Bom dia!
            </Text>
            <Text style={[styles.greetingText, { color: colors.textPrimary }]}>
              {profile?.name || 'Motorista'}
            </Text>
            <View style={styles.vehicleBadge}>
              <Car size={13} color={colors.textSecondary} />
              <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                {profile?.vehicle_model || 'Veículo Padrão'}
              </Text>
            </View>
          </View>

          {/* Quick Theme Switcher Button */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            {isDark ? (
              <Sun size={18} color="#FBBF24" />
            ) : (
              <Moon size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Shift Status Widget */}
        <ShiftStatusBanner
          activeShift={activeShift}
          onStartShiftPress={() => setStartModalVisible(true)}
          onEndShiftPress={() => setEndModalVisible(true)}
        />

        {/* Hero Card: Lucro Líquido Real (Inspired by Daily Reflection card) */}
        <Card variant="elevated" style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.heroLabel, { color: colors.textMuted }]}>
                {activeShift ? 'LUCRO LÍQUIDO DO TURNO' : 'LUCRO LÍQUIDO DE HOJE'}
              </Text>
              <Text
                style={[
                  styles.heroValue,
                  { color: metrics.netProfit < 0 ? colors.danger : colors.primary },
                ]}
              >
                {formatBRL(metrics.netProfit)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.formulaToggle, { backgroundColor: colors.tagBg }]}
              onPress={() => setShowFormulaDetails(!showFormulaDetails)}
            >
              <HelpCircle size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Real Cost Deduction Breakdown */}
          {showFormulaDetails && (
            <View style={[styles.formulaBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.formulaTitle, { color: colors.textSecondary }]}>
                Cálculo do Lucro Real:
              </Text>
              <View style={styles.formulaRow}>
                <Text style={[styles.formulaItem, { color: colors.textMuted }]}>
                  Faturamento Bruto:
                </Text>
                <Text style={[styles.formulaNum, { color: colors.primary }]}>
                  +{formatBRL(metrics.totalGrossIncome)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={[styles.formulaItem, { color: colors.textMuted }]}>
                  Despesas Diretas (Combustível/Refeição):
                </Text>
                <Text style={[styles.formulaNum, { color: colors.danger }]}>
                  -{formatBRL(metrics.totalDirectExpenses)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={[styles.formulaItem, { color: colors.textMuted }]}>
                  Reserva Desgaste ({formatBRL(profile?.maintenance_cost_per_km || 0.20)}/km rodado):
                </Text>
                <Text style={[styles.formulaNum, { color: colors.warning }]}>
                  -{formatBRL(metrics.estimatedMaintenanceCost)}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.heroBottomRow, { backgroundColor: colors.card }]}>
            <View style={styles.heroMiniStat}>
              <Text style={[styles.heroMiniLabel, { color: colors.textMuted }]}>Faturamento</Text>
              <Text style={[styles.heroMiniIncome, { color: colors.primary }]}>
                {formatBRL(metrics.totalGrossIncome)}
              </Text>
            </View>

            <View style={[styles.heroMiniDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.heroMiniStat}>
              <Text style={[styles.heroMiniLabel, { color: colors.textMuted }]}>Despesas</Text>
              <Text style={[styles.heroMiniExpense, { color: colors.danger }]}>
                {formatBRL(metrics.totalDirectExpenses)}
              </Text>
            </View>

            <View style={[styles.heroMiniDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.heroMiniStat}>
              <Text style={[styles.heroMiniLabel, { color: colors.textMuted }]}>Desgaste Est.</Text>
              <Text style={[styles.heroMiniWarning, { color: colors.warning }]}>
                {formatBRL(metrics.estimatedMaintenanceCost)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Daily Goal Bar */}
        <GoalProgressBar
          grossIncome={metrics.totalGrossIncome}
          dailyGoal={dailyGoal}
          progress={metrics.dailyGoalProgress}
        />

        {/* Quick Actions (4-item grid inspired by Serenity screenshot) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ações Rápidas</Text>
        </View>

        <QuickActionsGrid />

        {/* Operational Efficiency KPIs Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Indicadores Operacionais
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Rendimento / km"
            value={metrics.totalKmDriven > 0 ? `${formatBRL(metrics.profitPerKm)}/km` : '--'}
            subtitle={metrics.totalKmDriven > 0 ? `Rodados: ${formatKm(metrics.totalKmDriven)}` : 'Km rodados'}
            icon={<Gauge size={16} color={colors.primary} />}
            variant="primary"
            showBars={true}
          />

          <MetricCard
            title="Rendimento / hora"
            value={metrics.totalHoursWorked > 0 ? `${formatBRL(metrics.profitPerHour)}/h` : '--'}
            subtitle={metrics.totalHoursWorked > 0 ? `${metrics.totalHoursWorked}h em rota` : 'Tempo rodado'}
            icon={<Clock size={16} color={colors.info} />}
            variant="info"
          />
        </View>

        {/* Recent Transactions List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Movimentações Recentes
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history' as any)}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todas</Text>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 4,
  },
  formulaToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formulaBox: {
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  formulaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  formulaItem: {
    fontSize: 12,
    flex: 1,
  },
  formulaNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  heroMiniStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroMiniDivider: {
    width: 1,
    height: '70%',
  },
  heroMiniLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  heroMiniIncome: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroMiniExpense: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroMiniWarning: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
});
