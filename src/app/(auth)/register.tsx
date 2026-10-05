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
import { User, Mail, Lock, Car, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLORS } from '../../constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = useAuthStore(s => s.signUp);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha nome, e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha Curta', 'A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), password, name.trim());
    setLoading(false);

    if (result.error) {
      Alert.alert('Falha no Cadastro', result.error);
    } else {
      Alert.alert('Conta Criada com Sucesso!', 'Bem-vindo ao DriverPulse.');
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={COLORS.textSecondary} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Criar Nova Conta</Text>
            <Text style={styles.subtitle}>
              Comece a controlar o lucro real do seu dia a dia ao volante.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome Completo"
              placeholder="Ex: Carlos Silva"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="Modelo do Veículo"
              placeholder="Ex: Fiat Cronos 1.3"
              value={vehicleModel}
              onChangeText={setVehicleModel}
              leftIcon={<Car size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="Senha de Acesso"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color={COLORS.textSecondary} />}
            />

            <Button
              title="Finalizar Cadastro"
              variant="primary"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
              onPress={handleRegister}
              style={styles.registerBtn}
            />
          </View>
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
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  form: {
    gap: 4,
  },
  registerBtn: {
    borderRadius: 14,
    marginTop: 12,
  },
});
