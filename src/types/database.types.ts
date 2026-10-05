export type TransactionType = 'INCOME' | 'EXPENSE';

export type IncomeCategory = 'UBER' | '99' | 'INDRIVE' | 'PRIVATE';

export type ExpenseCategory = 'FUEL' | 'FOOD' | 'MAINTENANCE' | 'OTHER';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface Profile {
  id: string;
  name: string;
  daily_goal: number;
  vehicle_model: string | null;
  maintenance_cost_per_km: number;
  created_at: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  start_km: number;
  end_km: number | null;
  status: ShiftStatus;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  shift_id: string | null;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  odometer_km?: number | null;
  fuel_liters?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  totalGrossIncome: number;
  totalDirectExpenses: number;
  estimatedMaintenanceCost: number;
  netProfit: number;
  dailyGoalProgress: number; // 0 - 100+ %
  totalKmDriven: number;
  profitPerHour: number;
  profitPerKm: number;
  totalHoursWorked: number;
  fuelAutonomyKmPerLiter: number | null;
}

export interface IncomeBreakdown {
  uber: number;
  ninetyNine: number;
  inDrive: number;
  private: number;
}

export interface ExpenseBreakdown {
  fuel: number;
  food: number;
  maintenance: number;
  other: number;
}
