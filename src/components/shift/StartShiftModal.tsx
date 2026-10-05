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
import { COLORS } from '../../constants/theme';
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
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Play size={20} color={COLORS.primary} fill={COLORS.primary} />
              <Text style={styles.title}>Iniciar Novo Turno</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Informe a quilometragem atual marcada no painel do seu carro para registrar o início da jornada.
          </Text>

          <Input
            label="Hodômetro Inicial (km)"
            placeholder="Ex: 48520"
            keyboardType="numeric"
            value={odometer}
            onChangeText={setOdometer}
            leftIcon={<Gauge size={20} color={COLORS.primary} />}
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
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
