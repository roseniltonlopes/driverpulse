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
import { router, Link } from 'expo-router';
import { Mail, Lock, Gauge, ArrowRight, Sparkles } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLORS } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = useAuthStore(s => s.signIn);
  const continueAsGuest = useAuthStore(s => s.continueAsGuest);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha seu e-mail e senha.');
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      Alert.alert('Falha no Login', result.error);
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo & Hero */}
          <View style={styles.brandHero}>
            <View style={styles.logoCircle}>
              <Gauge size={38} color={COLORS.primary} />
            </View>
            <Text style={styles.brandTitle}>DriverPulse</Text>
            <Text style={styles.brandSubtitle}>
              Assistente financeiro e operacional para motoristas profissionais.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color={COLORS.textSecondary} />}
            />

            <Button
              title="Entrar na Conta"
              variant="primary"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
              onPress={handleLogin}
              style={styles.loginBtn}
            />

            <Button
              title="Acessar Modo Demonstração (Sem Login)"
              variant="secondary"
              leftIcon={<Sparkles size={16} color={COLORS.warning} />}
              onPress={handleGuest}
              style={styles.guestBtn}
            />

            <View style={styles.registerPrompt}>
              <Text style={styles.registerPromptText}>Não possui conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                <Text style={styles.registerLink}>Cadastre-se grátis</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  form: {
    gap: 4,
  },
  loginBtn: {
    borderRadius: 14,
    marginTop: 8,
  },
  guestBtn: {
    borderRadius: 14,
    marginTop: 10,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerPromptText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
