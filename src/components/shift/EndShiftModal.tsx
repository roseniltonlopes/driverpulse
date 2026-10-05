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
import { Square, Gauge, X, Award } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { COLORS } from '../../constants/theme';
import { useShiftStore } from '../../stores/useShiftStore';
import { formatKm } from '../../utils/formatters';

interface EndShiftModalProps {
  visible: boolean;
  onClose: () => void;
  startKm: number;
}

export const EndShiftModal: React.FC<EndShiftModalProps> = ({
  visible,
  onClose,
  startKm,
}) => {
  const [odometer, setOdometer] = useState(String(startKm + 50));
  const [loading, setLoading] = useState(false);
  const endShift = useShiftStore(s => s.endShift);

  const finalKmNum = parseFloat(odometer.replace(',', '.')) || 0;
  const deltaKm = Math.max(0, finalKmNum - startKm);

  const handleEnd = async () => {
    if (isNaN(finalKmNum) || finalKmNum < startKm) {
      Alert.alert(
        'Valor Inválido',
        `O hodômetro final deve ser maior ou igual a ${startKm} km.`
      );
      return;
    }

    setLoading(true);
    const result = await endShift(finalKmNum);
    setLoading(false);

    if (result.error) {
      Alert.alert('Atenção', result.error);
    } else {
      Alert.alert(
        'Turno Encerrado com Sucesso! 🏁',
        `Você percorreu um total de ${formatKm(deltaKm)} neste turno.`
      );
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
              <Square size={20} color={COLORS.danger} fill={COLORS.danger} />
              <Text style={styles.title}>Finalizar Turno</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Digite a quilometragem final para calcularmos a distância percorrida, custos de desgaste e seu lucro real por km.
          </Text>

          <Card style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Hodômetro Inicial:</Text>
              <Text style={styles.previewValue}>{startKm.toLocaleString('pt-BR')} km</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Distância Percorrida:</Text>
              <Text style={[styles.previewValue, { color: COLORS.primary }]}>
                {formatKm(deltaKm)}
              </Text>
            </View>
          </Card>

          <Input
            label="Hodômetro Final (km)"
            placeholder={`Ex: ${startKm + 120}`}
            keyboardType="numeric"
            value={odometer}
            onChangeText={setOdometer}
            leftIcon={<Gauge size={20} color={COLORS.danger} />}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Voltar"
              variant="secondary"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <Button
              title="Encerrar Turno"
              variant="danger"
              loading={loading}
              onPress={handleEnd}
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
    marginBottom: 16,
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: COLORS.cardElevated,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
