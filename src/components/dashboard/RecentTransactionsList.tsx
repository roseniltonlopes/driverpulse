import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Transaction } from '../../types/database.types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { COLORS } from '../../constants/theme';
import { formatBRL, formatTimeOnly, formatDateOnly } from '../../utils/formatters';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  limit?: number;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions,
  onDeleteTransaction,
  limit = 5,
}) => {
  const displayed = transactions.slice(0, limit);

  const confirmDelete = (tx: Transaction) => {
    Alert.alert(
      'Excluir Movimentação',
      `Deseja realmente apagar o lançamento de ${formatBRL(tx.amount)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDeleteTransaction(tx.id),
        },
      ]
    );
  };

  if (displayed.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Nenhuma movimentação recente</Text>
        <Text style={styles.emptySubtitle}>
          Use os botões acima para registrar seus ganhos e despesas rapidamente.
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {displayed.map((tx) => {
        const isIncome = tx.type === 'INCOME';

        return (
          <Card key={tx.id} style={styles.txCard}>
            <View style={styles.txRow}>
              <View style={styles.leftCol}>
                <View
                  style={[
                    styles.iconBox,
                    isIncome ? styles.incomeIconBox : styles.expenseIconBox,
                  ]}
                >
                  {isIncome ? (
                    <TrendingUp size={16} color={COLORS.primary} />
                  ) : (
                    <TrendingDown size={16} color={COLORS.danger} />
                  )}
                </View>

                <View style={styles.detailsCol}>
                  <View style={styles.badgeRow}>
                    <Badge category={tx.category} type={tx.type} />
                    <Text style={styles.timeText}>
                      {formatTimeOnly(tx.created_at)}
                    </Text>
                  </View>
                  {tx.notes ? (
                    <Text style={styles.notesText} numberOfLines={1}>
                      {tx.notes}
                    </Text>
                  ) : null}
                  {tx.fuel_liters ? (
                    <Text style={styles.fuelText}>
                      {tx.fuel_liters}L • Hodômetro: {tx.odometer_km} km
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.rightCol}>
                <Text
                  style={[
                    styles.amountText,
                    isIncome ? styles.incomeAmount : styles.expenseAmount,
                  ]}
                >
                  {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                </Text>

                <TouchableOpacity
                  onPress={() => confirmDelete(tx)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.deleteButton}
                >
                  <Trash2 size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  txCard: {
    padding: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  incomeIconBox: {
    backgroundColor: COLORS.primaryLight,
  },
  expenseIconBox: {
    backgroundColor: COLORS.dangerLight,
  },
  detailsCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  fuelText: {
    fontSize: 11,
    color: COLORS.warning,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  incomeAmount: {
    color: COLORS.primary,
  },
  expenseAmount: {
    color: COLORS.danger,
  },
  deleteButton: {
    padding: 2,
  },
});
