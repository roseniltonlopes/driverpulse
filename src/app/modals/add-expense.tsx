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
import { TrendingDown, X, DollarSign, Fuel, Utensils, Wrench, MoreHorizontal, Gauge, FileText, Check } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { ExpenseCategory } from '../../types/database.types';
import { COLORS, EXPENSE_INFO } from '../../constants/theme';

export default function AddExpenseModal() {
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <TrendingDown size={20} color={COLORS.danger} />
              </View>
              <View>
                <Text style={styles.title}>Lançar Despesa</Text>
                <Text style={styles.subtitle}>Combustível, manutenção e custos diários</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Category Selector Grid */}
          <Text style={styles.label}>Categoria da Despesa</Text>
          <View style={styles.categoryGrid}>
            {categories.map(({ key, icon: IconComponent }) => {
              const info = EXPENSE_INFO[key];
              const isSelected = category === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryCard,
                    isSelected && {
                      borderColor: info.color,
                      backgroundColor: info.badgeBg,
                    },
                  ]}
                  onPress={() => setCategory(key)}
                  activeOpacity={0.8}
                >
                  <IconComponent size={20} color={info.color} />
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && { color: info.textColor, fontWeight: '800' },
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
            leftIcon={<DollarSign size={22} color={COLORS.danger} />}
            style={styles.amountInput}
            autoFocus
          />

          {/* Fuel Specific Fields for Autonomy */}
          {category === 'FUEL' && (
            <Card style={styles.fuelCard}>
              <View style={styles.fuelCardHeader}>
                <Fuel size={18} color={COLORS.warning} />
                <Text style={styles.fuelCardTitle}>Dados de Abastecimento (Autonomia)</Text>
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
                    label="Hodômetro Atual (km)"
                    placeholder="Ex: 48600"
                    keyboardType="numeric"
                    value={odometer}
                    onChangeText={setOdometer}
                    leftIcon={<Gauge size={16} color={COLORS.info} />}
                  />
                </View>
              </View>

              <Text style={styles.fuelHint}>
                💡 O registro do hodômetro e litros permite o cálculo automático da média de consumo do seu carro (km/l).
              </Text>
            </Card>
          )}

          {/* Notes Input */}
          <Input
            label="Observação (Opcional)"
            placeholder="Ex: Posto Ipiranga / Troca de pastilha"
            value={notes}
            onChangeText={setNotes}
            leftIcon={<FileText size={18} color={COLORS.textSecondary} />}
          />

          {activeShift && (
            <View style={styles.shiftBadgeNotice}>
              <Check size={14} color={COLORS.warning} />
              <Text style={styles.shiftNoticeText}>
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
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
    backgroundColor: COLORS.cardElevated,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    gap: 8,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.danger,
  },
  fuelCard: {
    backgroundColor: COLORS.cardElevated,
    padding: 14,
    marginBottom: 16,
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
    color: COLORS.warning,
  },
  fuelInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fuelHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  shiftBadgeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  shiftNoticeText: {
    fontSize: 12,
    color: COLORS.warning,
    flex: 1,
  },
  saveBtn: {
    borderRadius: 14,
    marginTop: 8,
  },
});
