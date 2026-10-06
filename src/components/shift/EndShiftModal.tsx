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
import { Square, Gauge, X } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useTheme } from '../../stores/useThemeStore';
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
  const { colors } = useTheme();
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
              <View style={[styles.iconCircle, { backgroundColor: colors.dangerLight }]}>
                <Square size={16} color={colors.danger} fill={colors.danger} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Finalizar Turno</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Digite a quilometragem final para calcularmos a distância percorrida e seu lucro real por km.
          </Text>

          <Card style={[styles.previewCard, { backgroundColor: colors.cardElevated }]}>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Hodômetro Inicial:</Text>
              <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                {startKm.toLocaleString('pt-BR')} km
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Distância Percorrida:</Text>
              <Text style={[styles.previewValue, { color: colors.primary }]}>
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
            leftIcon={<Gauge size={20} color={colors.danger} />}
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
    marginBottom: 16,
    lineHeight: 18,
  },
  previewCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: 13,
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '800',
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
