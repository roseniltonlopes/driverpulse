import { Shift, Transaction, DashboardMetrics, IncomeBreakdown, ExpenseBreakdown } from '../types/database.types';

/**
 * Calculates driven kilometers for a shift
 */
export const calculateShiftDistance = (startKm: number, endKm: number | null): number => {
  if (endKm === null || endKm === undefined || endKm < startKm) {
    return 0;
  }
  return endKm - startKm;
};

/**
 * Calculates maintenance and depreciation estimated cost: Delta KM * maintenance_cost_per_km
 */
export const calculateMaintenanceCost = (kmDriven: number, costPerKm: number): number => {
  const km = Math.max(0, kmDriven);
  const cost = Math.max(0, costPerKm);
  return Number((km * cost).toFixed(2));
};

/**
 * Calculates hours worked between start time and end time (or now if still open)
 */
export const calculateHoursWorked = (startTime: string, endTime?: string | null): number => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
};

/**
 * Calculates full dashboard metrics from a set of transactions, shifts, and profile configuration
 */
export const calculateDashboardMetrics = (
  transactions: Transaction[],
  shifts: Shift[],
  maintenanceCostPerKm: number = 0.20,
  dailyGoal: number = 250.00
): DashboardMetrics => {
  let totalGrossIncome = 0;
  let totalDirectExpenses = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'INCOME') {
      totalGrossIncome += amount;
    } else if (tx.type === 'EXPENSE') {
      totalDirectExpenses += amount;
    }
  }

  // Calculate total KM driven across relevant shifts
  let totalKmDriven = 0;
  let totalHoursWorked = 0;

  for (const shift of shifts) {
    if (shift.end_km !== null && shift.end_km >= shift.start_km) {
      totalKmDriven += shift.end_km - shift.start_km;
    }
    totalHoursWorked += calculateHoursWorked(shift.start_time, shift.end_time);
  }

  const estimatedMaintenanceCost = calculateMaintenanceCost(totalKmDriven, maintenanceCostPerKm);
  const netProfit = Number((totalGrossIncome - (totalDirectExpenses + estimatedMaintenanceCost)).toFixed(2));

  // Profit per KM
  const profitPerKm = totalKmDriven > 0
    ? Number((netProfit / totalKmDriven).toFixed(2))
    : 0;

  // Profit per Hour
  const profitPerHour = totalHoursWorked > 0
    ? Number((netProfit / totalHoursWorked).toFixed(2))
    : 0;

  // Daily goal progress based on Gross Income (or Net Profit)
  const dailyGoalProgress = dailyGoal > 0
    ? Math.min(100, Math.max(0, Number(((totalGrossIncome / dailyGoal) * 100).toFixed(1))))
    : 0;

  // Fuel autonomy calculation from Fuel expenses with odometer & liters
  const fuelTransactions = transactions
    .filter(tx => tx.category === 'FUEL' && tx.odometer_km && tx.fuel_liters && tx.fuel_liters > 0)
    .sort((a, b) => (a.odometer_km || 0) - (b.odometer_km || 0));

  let fuelAutonomyKmPerLiter: number | null = null;
  if (fuelTransactions.length >= 2) {
    const latest = fuelTransactions[fuelTransactions.length - 1];
    const previous = fuelTransactions[fuelTransactions.length - 2];
    const kmDiff = (latest.odometer_km || 0) - (previous.odometer_km || 0);
    const liters = latest.fuel_liters || 1;
    if (kmDiff > 0 && liters > 0) {
      fuelAutonomyKmPerLiter = Number((kmDiff / liters).toFixed(1));
    }
  }

  return {
    totalGrossIncome: Number(totalGrossIncome.toFixed(2)),
    totalDirectExpenses: Number(totalDirectExpenses.toFixed(2)),
    estimatedMaintenanceCost,
    netProfit,
    dailyGoalProgress,
    totalKmDriven,
    profitPerHour,
    profitPerKm,
    totalHoursWorked: Number(totalHoursWorked.toFixed(1)),
    fuelAutonomyKmPerLiter,
  };
};

/**
 * Breakdown of income per platform
 */
export const calculateIncomeBreakdown = (transactions: Transaction[]): IncomeBreakdown => {
  const breakdown: IncomeBreakdown = {
    uber: 0,
    ninetyNine: 0,
    inDrive: 0,
    private: 0,
  };

  for (const tx of transactions) {
    if (tx.type === 'INCOME') {
      const amount = Number(tx.amount) || 0;
      if (tx.category === 'UBER') breakdown.uber += amount;
      else if (tx.category === '99') breakdown.ninetyNine += amount;
      else if (tx.category === 'INDRIVE') breakdown.inDrive += amount;
      else if (tx.category === 'PRIVATE') breakdown.private += amount;
    }
  }

  return breakdown;
};

/**
 * Breakdown of expenses per category
 */
export const calculateExpenseBreakdown = (transactions: Transaction[]): ExpenseBreakdown => {
  const breakdown: ExpenseBreakdown = {
    fuel: 0,
    food: 0,
    maintenance: 0,
    other: 0,
  };

  for (const tx of transactions) {
    if (tx.type === 'EXPENSE') {
      const amount = Number(tx.amount) || 0;
      if (tx.category === 'FUEL') breakdown.fuel += amount;
      else if (tx.category === 'FOOD') breakdown.food += amount;
      else if (tx.category === 'MAINTENANCE') breakdown.maintenance += amount;
      else if (tx.category === 'OTHER') breakdown.other += amount;
    }
  }

  return breakdown;
};
