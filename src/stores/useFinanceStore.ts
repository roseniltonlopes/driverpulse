import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionType, TransactionCategory, DashboardMetrics } from '../types/database.types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './useAuthStore';
import { useShiftStore } from './useShiftStore';
import { calculateDashboardMetrics } from '../utils/calculations';

interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  loadTransactions: () => Promise<void>;
  addTransaction: (params: {
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    shift_id?: string | null;
    odometer_km?: number | null;
    fuel_liters?: number | null;
    notes?: string | null;
    created_at?: string;
  }) => Promise<{ transaction: Transaction | null; error: string | null }>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  getMetricsForCurrentShift: () => DashboardMetrics;
  getMetricsForToday: () => DashboardMetrics;
  getMetricsForLast7Days: () => DashboardMetrics;
  seedDemoTransactions: () => Promise<void>;
}

const STORAGE_KEYS = {
  TRANSACTIONS: '@driverpulse_transactions',
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadTransactions: async () => {
    try {
      set({ isLoading: true });
      const user = useAuthStore.getState().user;
      const isGuest = useAuthStore.getState().isGuest;

      // Load local transactions first
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const localTxs: Transaction[] = stored ? JSON.parse(stored) : [];
      set({ transactions: localTxs });

      // If Supabase is connected and not guest, fetch from cloud
      if (isSupabaseConfigured() && !isGuest && user) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const fetched = data as Transaction[];
          set({ transactions: fetched });
          await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(fetched));
        }
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async ({
    type,
    category,
    amount,
    shift_id,
    odometer_km,
    fuel_liters,
    notes,
    created_at,
  }) => {
    try {
      if (amount <= 0 || isNaN(amount)) {
        return { transaction: null, error: 'O valor deve ser maior que zero.' };
      }

      const user = useAuthStore.getState().user;
      const userId = user?.id || 'guest-user-123';
      const isGuest = useAuthStore.getState().isGuest;
      const activeShift = useShiftStore.getState().activeShift;

      // Auto-assign active shift if none specified and an open shift exists
      const targetShiftId = shift_id !== undefined ? shift_id : (activeShift?.id || null);

      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        shift_id: targetShiftId,
        type,
        category,
        amount: Number(amount.toFixed(2)),
        odometer_km: odometer_km ? Math.round(odometer_km) : null,
        fuel_liters: fuel_liters ? Number(fuel_liters.toFixed(2)) : null,
        notes: notes ? notes.trim() : null,
        created_at: created_at || new Date().toISOString(),
      };

      if (isSupabaseConfigured() && !isGuest) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            shift_id: newTx.shift_id,
            type: newTx.type,
            category: newTx.category,
            amount: newTx.amount,
            odometer_km: newTx.odometer_km,
            fuel_liters: newTx.fuel_liters,
            notes: newTx.notes,
            created_at: newTx.created_at,
          })
          .select()
          .single();

        if (!error && data) {
          newTx.id = data.id;
        }
      }

      const updated = [newTx, ...get().transactions];
      set({ transactions: updated });
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));

      return { transaction: newTx, error: null };
    } catch (e: any) {
      return { transaction: null, error: e.message || 'Erro ao registrar movimentação' };
    }
  },

  deleteTransaction: async (transactionId: string) => {
    const isGuest = useAuthStore.getState().isGuest;
    if (isSupabaseConfigured() && !isGuest) {
      await supabase.from('transactions').delete().eq('id', transactionId);
    }

    const updated = get().transactions.filter(t => t.id !== transactionId);
    set({ transactions: updated });
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  },

  getMetricsForCurrentShift: () => {
    const activeShift = useShiftStore.getState().activeShift;
    const profile = useAuthStore.getState().profile;
    const costPerKm = profile?.maintenance_cost_per_km ?? 0.20;
    const dailyGoal = profile?.daily_goal ?? 250.00;

    if (!activeShift) {
      return calculateDashboardMetrics([], [], costPerKm, dailyGoal);
    }

    const shiftTxs = get().transactions.filter(t => t.shift_id === activeShift.id);
    return calculateDashboardMetrics(shiftTxs, [activeShift], costPerKm, dailyGoal);
  },

  getMetricsForToday: () => {
    const profile = useAuthStore.getState().profile;
    const shifts = useShiftStore.getState().shifts;
    const costPerKm = profile?.maintenance_cost_per_km ?? 0.20;
    const dailyGoal = profile?.daily_goal ?? 250.00;

    const todayStr = new Date().toISOString().split('T')[0];

    const todayTxs = get().transactions.filter(t => t.created_at.startsWith(todayStr));
    const todayShifts = shifts.filter(s => s.start_time.startsWith(todayStr));

    return calculateDashboardMetrics(todayTxs, todayShifts, costPerKm, dailyGoal);
  },

  getMetricsForLast7Days: () => {
    const profile = useAuthStore.getState().profile;
    const shifts = useShiftStore.getState().shifts;
    const costPerKm = profile?.maintenance_cost_per_km ?? 0.20;
    const dailyGoal = (profile?.daily_goal ?? 250.00) * 7;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoThreshold = sevenDaysAgo.toISOString();

    const recentTxs = get().transactions.filter(t => t.created_at >= isoThreshold);
    const recentShifts = shifts.filter(s => s.start_time >= isoThreshold);

    return calculateDashboardMetrics(recentTxs, recentShifts, costPerKm, dailyGoal);
  },

  seedDemoTransactions: async () => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || 'guest-user-123';
    const now = new Date();

    const sampleTxs: Transaction[] = [
      {
        id: 'demo-tx-1',
        user_id: userId,
        shift_id: 'shift-demo-1',
        type: 'INCOME',
        category: 'UBER',
        amount: 145.80,
        notes: 'Corridas da manhã na Uber',
        created_at: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-tx-2',
        user_id: userId,
        shift_id: 'shift-demo-1',
        type: 'INCOME',
        category: '99',
        amount: 88.50,
        notes: 'Dinâmico 99 Pop',
        created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-tx-3',
        user_id: userId,
        shift_id: 'shift-demo-1',
        type: 'INCOME',
        category: 'INDRIVE',
        amount: 65.00,
        notes: 'Viagens inDrive',
        created_at: new Date(now.getTime() - 22 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-tx-4',
        user_id: userId,
        shift_id: 'shift-demo-1',
        type: 'EXPENSE',
        category: 'FUEL',
        amount: 95.00,
        odometer_km: 45380,
        fuel_liters: 16.5,
        notes: 'Abastecimento Posto Shell (Gasolina Comum)',
        created_at: new Date(now.getTime() - 21 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-tx-5',
        user_id: userId,
        shift_id: 'shift-demo-1',
        type: 'EXPENSE',
        category: 'FOOD',
        amount: 22.90,
        notes: 'Almoço Prato Feito',
        created_at: new Date(now.getTime() - 23 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-tx-6',
        user_id: userId,
        shift_id: 'shift-demo-2',
        type: 'INCOME',
        category: 'UBER',
        amount: 180.00,
        notes: 'Turno noturno Uber',
        created_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-tx-7',
        user_id: userId,
        shift_id: 'shift-demo-2',
        type: 'INCOME',
        category: 'PRIVATE',
        amount: 90.00,
        notes: 'Corrida particular Aeroporto',
        created_at: new Date(now.getTime() - 46 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-tx-8',
        user_id: userId,
        shift_id: 'shift-demo-2',
        type: 'EXPENSE',
        category: 'FUEL',
        amount: 80.00,
        odometer_km: 45195,
        fuel_liters: 14.0,
        notes: 'Abastecimento Ipiranga',
        created_at: new Date(now.getTime() - 45 * 3600 * 1000).toISOString(),
      },
    ];

    set({ transactions: sampleTxs });
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sampleTxs));
  },
}));
