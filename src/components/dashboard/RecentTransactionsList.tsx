import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Transaction } from '../../types/database.types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useTheme } from '../../stores/useThemeStore';
import { formatBRL, formatTimeOnly } from '../../utils/formatters';

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
  const { colors } = useTheme();
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
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
          Nenhuma movimentação recente
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Use os botões de ação rápida para registrar seus ganhos e despesas.
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
                    {
                      backgroundColor: isIncome ? colors.primaryLight : colors.dangerLight,
                    },
                  ]}
                >
                  {isIncome ? (
                    <TrendingUp size={16} color={colors.primary} />
                  ) : (
                    <TrendingDown size={16} color={colors.danger} />
                  )}
                </View>

                <View style={styles.detailsCol}>
                  <View style={styles.badgeRow}>
                    <Badge category={tx.category} type={tx.type} />
                    <Text style={[styles.timeText, { color: colors.textMuted }]}>
                      {formatTimeOnly(tx.created_at)}
                    </Text>
                  </View>
                  {tx.notes ? (
                    <Text
                      style={[styles.notesText, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {tx.notes}
                    </Text>
                  ) : null}
                  {tx.fuel_liters ? (
                    <Text style={[styles.fuelText, { color: colors.warning }]}>
                      {tx.fuel_liters}L • {tx.odometer_km} km
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.rightCol}>
                <Text
                  style={[
                    styles.amountText,
                    { color: isIncome ? colors.primary : colors.danger },
                  ]}
                >
                  {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                </Text>

                <TouchableOpacity
                  onPress={() => confirmDelete(tx)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.deleteButton}
                >
                  <Trash2 size={13} color={colors.textMuted} />
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
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  txCard: {
    padding: 12,
    borderRadius: 18,
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
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
  },
  notesText: {
    fontSize: 12,
    marginTop: 2,
  },
  fuelText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  deleteButton: {
    padding: 2,
  },
});
