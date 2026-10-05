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
  TrendingUp,
  TrendingDown,
  Gauge,
  Clock,
  Fuel,
  DollarSign,
  PieChart,
} from 'lucide-react-native';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { RecentTransactionsList } from '../../components/dashboard/RecentTransactionsList';
import { COLORS, PLATFORM_INFO, EXPENSE_INFO } from '../../constants/theme';
import { formatBRL, formatKm, formatKmPerLiter } from '../../utils/formatters';
import {
  calculateDashboardMetrics,
  calculateIncomeBreakdown,
  calculateExpenseBreakdown,
} from '../../utils/calculations';

type PeriodFilter = 'TODAY' | 'WEEK' | 'ALL';

export default function HistoryScreen() {
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

  // Filter items according to chosen period
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
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios e Histórico</Text>
          <Text style={styles.subtitle}>
            Visão detalhada do seu rendimento líquido e balanço operacional.
          </Text>
        </View>

        {/* Period Selector Filter */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodBtn, period === 'TODAY' && styles.periodBtnActive]}
            onPress={() => setPeriod('TODAY')}
          >
            <Text style={[styles.periodText, period === 'TODAY' && styles.periodTextActive]}>
              Hoje
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodBtn, period === 'WEEK' && styles.periodBtnActive]}
            onPress={() => setPeriod('WEEK')}
          >
            <Text style={[styles.periodText, period === 'WEEK' && styles.periodTextActive]}>
              Últimos 7 Dias
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodBtn, period === 'ALL' && styles.periodBtnActive]}
            onPress={() => setPeriod('ALL')}
          >
            <Text style={[styles.periodText, period === 'ALL' && styles.periodTextActive]}>
              Todo o Período
            </Text>
          </TouchableOpacity>
        </View>

        {/* Consolidated Net Profit Hero */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            {period === 'TODAY'
              ? 'LUCRO LÍQUIDO CONSOLIDADO (HOJE)'
              : period === 'WEEK'
              ? 'LUCRO LÍQUIDO CONSOLIDADO (7 DIAS)'
              : 'LUCRO LÍQUIDO TOTAL ACUMULADO'}
          </Text>
          <Text
            style={[
              styles.heroValue,
              metrics.netProfit < 0 ? { color: COLORS.danger } : { color: COLORS.primary },
            ]}
          >
            {formatBRL(metrics.netProfit)}
          </Text>

          <View style={styles.heroRow}>
            <View style={styles.heroCol}>
              <Text style={styles.heroColLabel}>Faturamento</Text>
              <Text style={styles.heroIncome}>{formatBRL(metrics.totalGrossIncome)}</Text>
            </View>

            <View style={styles.heroCol}>
              <Text style={styles.heroColLabel}>Despesas Diretas</Text>
              <Text style={styles.heroExpense}>-{formatBRL(metrics.totalDirectExpenses)}</Text>
            </View>

            <View style={styles.heroCol}>
              <Text style={styles.heroColLabel}>Desgaste Est.</Text>
              <Text style={styles.heroWarning}>-{formatBRL(metrics.estimatedMaintenanceCost)}</Text>
            </View>
          </View>
        </Card>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Quilômetros"
            value={formatKm(metrics.totalKmDriven)}
            subtitle="Distância total"
            icon={<Gauge size={16} color={COLORS.info} />}
            variant="info"
          />

          <MetricCard
            title="Tempo Rodado"
            value={`${metrics.totalHoursWorked}h`}
            subtitle="Horas em turno"
            icon={<Clock size={16} color={COLORS.warning} />}
            variant="warning"
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Rendimento / km"
            value={metrics.totalKmDriven > 0 ? `${formatBRL(metrics.profitPerKm)}/km` : '--'}
            subtitle="Eficiência por km"
            icon={<DollarSign size={16} color={COLORS.primary} />}
            variant="primary"
          />

          <MetricCard
            title="Autonomia Estimada"
            value={formatKmPerLiter(metrics.fuelAutonomyKmPerLiter)}
            subtitle="Média de consumo"
            icon={<Fuel size={16} color={COLORS.categoryFuel} />}
            variant="default"
          />
        </View>

        {/* Platform Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Receitas por Plataforma</Text>
        </View>

        <Card style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO.UBER.color }]} />
              <Text style={styles.platformName}>Uber</Text>
            </View>
            <Text style={styles.platformValue}>{formatBRL(incomeBreakdown.uber)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO['99'].color }]} />
              <Text style={styles.platformName}>99 App</Text>
            </View>
            <Text style={styles.platformValue}>{formatBRL(incomeBreakdown.ninetyNine)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO.INDRIVE.color }]} />
              <Text style={styles.platformName}>inDrive</Text>
            </View>
            <Text style={styles.platformValue}>{formatBRL(incomeBreakdown.inDrive)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: PLATFORM_INFO.PRIVATE.color }]} />
              <Text style={styles.platformName}>Particular / Outros</Text>
            </View>
            <Text style={styles.platformValue}>{formatBRL(incomeBreakdown.private)}</Text>
          </View>
        </Card>

        {/* Category Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
        </View>

        <Card style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.FUEL.color }]} />
              <Text style={styles.platformName}>Combustível</Text>
            </View>
            <Text style={[styles.platformValue, { color: COLORS.danger }]}>
              {formatBRL(expenseBreakdown.fuel)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.FOOD.color }]} />
              <Text style={styles.platformName}>Alimentação</Text>
            </View>
            <Text style={[styles.platformValue, { color: COLORS.danger }]}>
              {formatBRL(expenseBreakdown.food)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.MAINTENANCE.color }]} />
              <Text style={styles.platformName}>Manutenção / Óleo</Text>
            </View>
            <Text style={[styles.platformValue, { color: COLORS.danger }]}>
              {formatBRL(expenseBreakdown.maintenance)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.platformIndicator}>
              <View style={[styles.platformDot, { backgroundColor: EXPENSE_INFO.OTHER.color }]} />
              <Text style={styles.platformName}>Outros</Text>
            </View>
            <Text style={[styles.platformValue, { color: COLORS.danger }]}>
              {formatBRL(expenseBreakdown.other)}
            </Text>
          </View>
        </Card>

        {/* Transaction History List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todas as Movimentações ({filteredTxs.length})</Text>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodBtnActive: {
    backgroundColor: COLORS.cardElevated,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  periodTextActive: {
    color: COLORS.primary,
  },
  heroCard: {
    backgroundColor: COLORS.cardElevated,
    padding: 18,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 12,
  },
  heroCol: {
    alignItems: 'center',
  },
  heroColLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
    fontWeight: '600',
  },
  heroIncome: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  heroExpense: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.danger,
  },
  heroWarning: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.warning,
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
    color: COLORS.textPrimary,
  },
  breakdownCard: {
    padding: 14,
    backgroundColor: COLORS.cardElevated,
    gap: 10,
    marginBottom: 16,
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  platformName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  platformValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
