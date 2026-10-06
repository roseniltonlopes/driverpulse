import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Car, Zap, DollarSign, Fuel } from 'lucide-react-native';
import { useTheme } from '../../stores/useThemeStore';
import { PLATFORM_INFO, EXPENSE_INFO } from '../../constants/theme';

export const QuickActionsGrid: React.FC = () => {
  const { colors, isDark } = useTheme();

  const actions = [
    {
      id: 'uber',
      label: 'Uber',
      sublabel: 'Lançar corrida',
      icon: Car,
      iconColor: '#38BDF8',
      bg: 'rgba(2, 132, 199, 0.14)',
      onPress: () => router.push('/modals/add-income' as any),
    },
    {
      id: '99',
      label: '99 App',
      sublabel: 'Lançar corrida',
      icon: Zap,
      iconColor: '#FB923C',
      bg: 'rgba(249, 115, 22, 0.14)',
      onPress: () => router.push('/modals/add-income' as any),
    },
    {
      id: 'indrive',
      label: 'inDrive / Part.',
      sublabel: 'Outras receitas',
      icon: DollarSign,
      iconColor: colors.primary,
      bg: colors.primaryLight,
      onPress: () => router.push('/modals/add-income' as any),
    },
    {
      id: 'expense',
      label: 'Despesa',
      sublabel: 'Combustível / Ref.',
      icon: Fuel,
      iconColor: colors.warning,
      bg: colors.warningLight,
      onPress: () => router.push('/modals/add-expense' as any),
    },
  ];

  return (
    <View style={styles.grid}>
      {actions.map((item) => {
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.actionTile,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={item.onPress}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
              <IconComponent size={20} color={item.iconColor} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {item.sublabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionTile: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});
