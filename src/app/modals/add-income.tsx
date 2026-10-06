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
import { TrendingUp, X, DollarSign, FileText, Check } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useTheme } from '../../stores/useThemeStore';
import { IncomeCategory } from '../../types/database.types';
import { PLATFORM_INFO } from '../../constants/theme';

export default function AddIncomeModal() {
  const { colors, isDark } = useTheme();
  const [platform, setPlatform] = useState<IncomeCategory>('UBER');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addTransaction = useFinanceStore(s => s.addTransaction);
  const activeShift = useShiftStore(s => s.activeShift);

  const handleSave = async () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Valor Inválido', 'Digite o valor recebido pela corrida ou período.');
      return;
    }

    setLoading(true);
    const result = await addTransaction({
      type: 'INCOME',
      category: platform,
      amount: numAmount,
      shift_id: activeShift?.id || null,
      notes: notes.trim() || `${PLATFORM_INFO[platform]?.label || platform} Viagem`,
    });
    setLoading(false);

    if (result.error) {
      Alert.alert('Erro', result.error);
    } else {
      router.back();
    }
  };

  const platforms: IncomeCategory[] = ['UBER', '99', 'INDRIVE', 'PRIVATE'];

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
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Lançar Receita</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Ganhos de viagens e corridas
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

          {/* Platform Selector Grid */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Selecione a Plataforma</Text>
          <View style={styles.platformGrid}>
            {platforms.map((p) => {
              const info = PLATFORM_INFO[p];
              const isSelected = platform === p;

              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.platformCard,
                    {
                      backgroundColor: isSelected ? info.badgeBg : colors.cardElevated,
                      borderColor: isSelected ? info.color : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setPlatform(p)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.platformIndicator, { backgroundColor: info.color }]} />
                  <Text
                    style={[
                      styles.platformLabel,
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
            label="Valor do Ganho (R$)"
            placeholder="0,00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            leftIcon={<DollarSign size={22} color={colors.primary} />}
            style={[styles.amountInput, { color: colors.primary }]}
            autoFocus
          />

          {/* Notes Input */}
          <Input
            label="Observação (Opcional)"
            placeholder="Ex: Corrida dinâmica centro / gorjeta"
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
                Esta receita será vinculada ao seu turno ativo atual.
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <Button
            title="Confirmar Receita"
            variant="primary"
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
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  platformCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  platformIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  platformLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '900',
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
