import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Play, Gauge, X } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTheme } from '../../stores/useThemeStore';
import { useShiftStore } from '../../stores/useShiftStore';

interface StartShiftModalProps {
  visible: boolean;
  onClose: () => void;
  lastOdometer?: number;
}

export const StartShiftModal: React.FC<StartShiftModalProps> = ({
  visible,
  onClose,
  lastOdometer = 45000,
}) => {
  const { colors } = useTheme();
  const [odometer, setOdometer] = useState(lastOdometer ? String(lastOdometer) : '');
  const [loading, setLoading] = useState(false);
  const startShift = useShiftStore(s => s.startShift);

  const handleStart = async () => {
    const km = parseFloat(odometer.replace(',', '.'));
    if (isNaN(km) || km <= 0) {
      Alert.alert('Valor Inválido', 'Por favor, digite o hodômetro atual do veículo.');
      return;
    }

    setLoading(true);
    const result = await startShift(km);
    setLoading(false);

    if (result.error) {
      Alert.alert('Atenção', result.error);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <Play size={16} color={colors.primary} fill={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Iniciar Turno</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Informe a quilometragem atual do painel para registrar o início da jornada.
          </Text>

          <Input
            label="Hodômetro Inicial (km)"
            placeholder="Ex: 48520"
            keyboardType="numeric"
            value={odometer}
            onChangeText={setOdometer}
            leftIcon={<Gauge size={20} color={colors.primary} />}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <Button
              title="Iniciar Turno"
              variant="primary"
              loading={loading}
              onPress={handleStart}
              style={styles.confirmBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1.5,
  },
});
