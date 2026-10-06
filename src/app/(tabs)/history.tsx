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
import {
  CalendarDays,
  Gauge,
  Clock,
  Fuel,
  DollarSign,
} from 'lucide-react-native';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../stores/useThemeStore';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { RecentTransactionsList } from '../../components/dashboard/RecentTransactionsList';
import { PLATFORM_INFO, EXPENSE_INFO } from '../../constants/theme';
import { formatBRL, formatKm, formatKmPerLiter } from '../../utils/formatters';
import {
  calculateDashboardMetrics,
  calculateIncomeBreakdown,
  calculateExpenseBreakdown,
} from '../../utils/calculations';

type PeriodFilter = 'TODAY' | 'WEEK' | 'ALL';

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const [period, setPeriod] = useState<PeriodFilter>('WEEK');
  const [refreshing, setRefreshing] = useState(false);

  const transactions = useFinanceStore(s => s.transactions);
  const loadTransactions = useFinanceStore(s => s.loadTransactions);
  const deleteTransaction = useFinanceStore(s => s.deleteTransaction);
  const shifts = useShiftStore(s => s.shifts);
  const loadShifts = useShiftStore(s => s.loadShifts);
  const profile = useAuthStore(s => s.profile);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTransactions(), loadShifts()]);
    setRefreshing(false);
  };

  const filterData = () => {
    const now = new Date();
    const costPerKm = profile?.maintenance_cost_per_km || 0.20;

    let filteredTxs = transactions;
    let filteredShifts = shifts;

    if (period === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      filteredTxs = transactions.filter(t => t.created_at.startsWith(todayStr));
      filteredShifts = shifts.filter(s => s.start_time.startsWith(todayStr));
    } else if (period === 'WEEK') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isoThreshold = sevenDaysAgo.toISOString();
      filteredTxs = transactions.filter(t => t.created_at >= isoThreshold);
      filteredShifts = shifts.filter(s => s.start_time >= isoThreshold);
    }

    const metrics = calculateDashboardMetrics(
      filteredTxs,
      filteredShifts,
      costPerKm,
      (profile?.daily_goal || 250) * (period === 'WEEK' ? 7 : 1)
    );

    const incomeBreakdown = calculateIncomeBreakdown(filteredTxs);
    const expenseBreakdown = calculateExpenseBreakdown(filteredTxs);

    return { filteredTxs, metrics, incomeBreakdown, expenseBreakdown };
  };

  const { filteredTxs, metrics, incomeBreakdown, expenseBreakdown } = filterData();

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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Relatórios e Histórico</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Visão detalhada do seu rendimento líquido e balanço operacional.
          </Text>
        </View>

        {/* Period Selector Filter */}
        <View
          style={[
            styles.periodSelector,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.periodBtn,
              period === 'TODAY' && { backgroundColor: colors.cardElevated },
            ]}
            onPress={() => setPeriod('TODAY')}
          >
            <Text
              style={[
                styles.periodText,
                { color: period === 'TODAY' ? colors.primary : colors.textMuted },
              ]}
            >
              Hoje
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodBtn,
              period === 'WEEK' && { backgroundColor: colors.cardElevated },
            ]}
            onPress={() => setPeriod('WEEK')}
          >
            <Text
              style={[
                styles.periodText,
                { color: period === 'WEEK' ? colors.primary : colors.textMuted },
              ]}
            >
              Últimos 7 Dias
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodBtn,
              period === 'ALL' && { backgroundColor: colors.cardElevated },
            ]}
            onPress={() => setPeriod('ALL')}
          >
            <Text
              style={[
                styles.periodText,
                { color: period === 'ALL' ? colors.primary : colors.textMuted },
              ]}
            >
              Todo o Período
            </Text>
          </TouchableOpacity>
        </View>

        {/* Consolidated Net Profit Hero */}
        <Card variant="elevated" style={styles.heroCard}>
          <Text style={[styles.heroLabel, { color: colors.textMuted }]}>
            {period === 'TODAY'
              ? 'LUCRO LÍQUIDO CONSOLIDADO (HOJE)'
              : period === 'WEEK'
              ? 'LUCRO LÍQUIDO CONSOLIDADO (7 DIAS)'
              : 'LUCRO LÍQUIDO TOTAL ACUMULADO'}
          </Text>
          <Text
            style={[
              styles.heroValue,
              { color: metrics.netProfit < 0 ? colors.danger : colors.primary },
            ]}
          >
            {formatBRL(metrics.netProfit)}
          </Text>

          <View style={[styles.heroRow, { borderTopColor: colors.cardBorder }]}>
            <View style={styles.heroCol}>
              <Text style={[styles.heroColLabel, { color: colors.textMuted }]}>Faturamento</Text>
              <Text style={[styles.heroIncome, { color: colors.primary }]}>
                {formatBRL(metrics.totalGrossIncome)}
              </Text>
            </View>

            <View style={styles.heroCol}>
              <Text style={[styles.heroColLabel, { color: colors.textMuted }]}>Despesas</Text>
              <Text style={[styles.heroExpense, { color: colors.danger }]}>
                -{formatBRL(metrics.totalDirectExpenses)}
              </Text>
            </View>

            <View style={styles.heroCol}>
              <Text style={[styles.heroColLabel, { color: colors.textMuted }]}>Desgaste Est.</Text>
              <Text style={[styles.heroWarning, { color: colors.warning }]}>
                -{formatBRL(metrics.estimatedMaintenanceCost)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Quilômetros"
            value={formatKm(metrics.totalKmDriven)}
            subtitle="Distância total"
            icon={<Gauge size={16} color={colors.info} />}
            variant="info"
          />

          <MetricCard
            title="Tempo Rodado"
            value={`${metrics.totalHoursWorked}h`}
            subtitle="Horas em turno"
            icon={<Clock size={16} color={colors.warning} />}
            variant="warning"
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Rendimento / km"
            value={metrics.totalKmDriven > 0 ? `${formatBRL(metrics.profitPerKm)}/km` : '--'}
            subtitle="Eficiência por km"
            icon={<DollarSign size={16} color={colors.primary} />}
            variant="primary"
            showBars={true}
          />

          <MetricCard
            title="Autonomia Estimada"
            value={formatKmPerLiter(metrics.fuelAutonomyKmPerLiter)}
            subtitle="Média de consumo"
            icon={<Fuel size={16} color={colors.warning} />}
            variant="default"
          />
        </View>

        {/* Platform Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Receitas por Plataforma
          </Text>
        </View>

        <Card variant="elevated" style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO.UBER.color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>Uber</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.textPrimary }]}>
              {formatBRL(incomeBreakdown.uber)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO['99'].color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>99 App</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.textPrimary }]}>
              {formatBRL(incomeBreakdown.ninetyNine)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO.INDRIVE.color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>inDrive</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.textPrimary }]}>
              {formatBRL(incomeBreakdown.inDrive)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO.PRIVATE.color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>Particular / Outros</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.textPrimary }]}>
              {formatBRL(incomeBreakdown.private)}
            </Text>
          </View>
        </Card>

        {/* Category Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Despesas por Categoria
          </Text>
        </View>

        <Card variant="elevated" style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.FUEL.color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>Combustível</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.danger }]}>
              {formatBRL(expenseBreakdown.fuel)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.FOOD.color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>Alimentação</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.danger }]}>
              {formatBRL(expenseBreakdown.food)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.MAINTENANCE.color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>Manutenção / Óleo</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.danger }]}>
              {formatBRL(expenseBreakdown.maintenance)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.OTHER.color }]} />
              <Text style={[styles.platformName, { color: colors.textPrimary }]}>Outros</Text>
            </View>
            <Text style={[styles.platformValue, { color: colors.danger }]}>
              {formatBRL(expenseBreakdown.other)}
            </Text>
          </View>
        </Card>

        {/* Transaction History List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Todas as Movimentações ({filteredTxs.length})
          </Text>
        </View>

        <RecentTransactionsList
          transactions={filteredTxs}
          onDeleteTransaction={deleteTransaction}
          limit={50}
        />
      </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 22,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  heroCol: {
    alignItems: 'center',
  },
  heroColLabel: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: '700',
  },
  heroIncome: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroExpense: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroWarning: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  breakdownCard: {
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderRadius: 22,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  platformName: {
    fontSize: 13,
    fontWeight: '700',
  },
  platformValue: {
    fontSize: 14,
    fontWeight: '800',
  },
});
