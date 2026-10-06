import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  TrendingDown,
  X,
  DollarSign,
  Fuel,
  Utensils,
  Wrench,
  MoreHorizontal,
  Gauge,
  FileText,
  Check,
} from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useTheme } from '../../stores/useThemeStore';
import { ExpenseCategory } from '../../types/database.types';
import { EXPENSE_INFO } from '../../constants/theme';

export default function AddExpenseModal() {
  const { colors, isDark } = useTheme();
  const [category, setCategory] = useState<ExpenseCategory>('FUEL');
  const [amount, setAmount] = useState('');
  const [odometer, setOdometer] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addTransaction = useFinanceStore(s => s.addTransaction);
  const activeShift = useShiftStore(s => s.activeShift);

  const handleSave = async () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Valor Inválido', 'Digite o valor da despesa realizada.');
      return;
    }

    const numOdometer = odometer ? parseFloat(odometer.replace(',', '.')) : null;
    const numLiters = fuelLiters ? parseFloat(fuelLiters.replace(',', '.')) : null;

    setLoading(true);
    const result = await addTransaction({
      type: 'EXPENSE',
      category,
      amount: numAmount,
      shift_id: activeShift?.id || null,
      odometer_km: numOdometer,
      fuel_liters: numLiters,
      notes: notes.trim() || `${EXPENSE_INFO[category]?.label || category}`,
    });
    setLoading(false);

    if (result.error) {
      Alert.alert('Erro', result.error);
    } else {
      router.back();
    }
  };

  const categories: { key: ExpenseCategory; icon: any }[] = [
    { key: 'FUEL', icon: Fuel },
    { key: 'FOOD', icon: Utensils },
    { key: 'MAINTENANCE', icon: Wrench },
    { key: 'OTHER', icon: MoreHorizontal },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.dangerLight }]}>
                <TrendingDown size={20} color={colors.danger} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Lançar Despesa</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Combustível, manutenção e custos diários
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Category Selector Grid */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Categoria da Despesa</Text>
          <View style={styles.categoryGrid}>
            {categories.map(({ key, icon: IconComponent }) => {
              const info = EXPENSE_INFO[key];
              const isSelected = category === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isSelected ? info.badgeBg : colors.cardElevated,
                      borderColor: isSelected ? info.color : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setCategory(key)}
                  activeOpacity={0.8}
                >
                  <IconComponent size={20} color={info.color} />
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: isSelected ? info.textColor : colors.textPrimary },
                      isSelected && { fontWeight: '800' },
                    ]}
                  >
                    {info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount Input */}
          <Input
            label="Valor da Despesa (R$)"
            placeholder="0,00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            leftIcon={<DollarSign size={22} color={colors.danger} />}
            style={[styles.amountInput, { color: colors.danger }]}
            autoFocus
          />

          {/* Fuel Specific Fields for Autonomy */}
          {category === 'FUEL' && (
            <Card variant="elevated" style={styles.fuelCard}>
              <View style={styles.fuelCardHeader}>
                <Fuel size={18} color={colors.warning} />
                <Text style={[styles.fuelCardTitle, { color: colors.warning }]}>
                  Dados de Abastecimento (Autonomia)
                </Text>
              </View>

              <View style={styles.fuelInputsRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Litros Abastecidos"
                    placeholder="Ex: 15.5"
                    keyboardType="numeric"
                    value={fuelLiters}
                    onChangeText={setFuelLiters}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Input
                    label="Hodômetro (km)"
                    placeholder="Ex: 48600"
                    keyboardType="numeric"
                    value={odometer}
                    onChangeText={setOdometer}
                    leftIcon={<Gauge size={16} color={colors.info} />}
                  />
                </View>
              </View>

              <Text style={[styles.fuelHint, { color: colors.textMuted }]}>
                💡 O registro do hodômetro e litros permite o cálculo automático da média de consumo do seu carro (km/l).
              </Text>
            </Card>
          )}

          {/* Notes Input */}
          <Input
            label="Observação (Opcional)"
            placeholder="Ex: Posto Ipiranga / Almoço PF"
            value={notes}
            onChangeText={setNotes}
            leftIcon={<FileText size={18} color={colors.textSecondary} />}
          />

          {activeShift && (
            <View
              style={[
                styles.shiftBadgeNotice,
                { backgroundColor: colors.tagBg, borderColor: colors.tagBorder },
              ]}
            >
              <Check size={14} color={colors.warning} />
              <Text style={[styles.shiftNoticeText, { color: colors.warning }]}>
                Esta despesa será vinculada ao seu turno ativo atual.
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <Button
            title="Confirmar Despesa"
            variant="danger"
            size="lg"
            loading={loading}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '900',
  },
  fuelCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
  },
  fuelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fuelCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  fuelInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fuelHint: {
    fontSize: 11,
    lineHeight: 16,
  },
  shiftBadgeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  shiftNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  saveBtn: {
    borderRadius: 20,
    marginTop: 8,
  },
});
