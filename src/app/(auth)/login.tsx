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
import { Mail, Lock, Gauge, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../stores/useThemeStore';

export default function LoginScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Theme Switcher */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[
                styles.themeBtn,
                { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
              ]}
              onPress={toggleTheme}
            >
              {isDark ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color={colors.primary} />}
            </TouchableOpacity>
          </View>

          {/* Logo & Hero */}
          <View style={styles.brandHero}>
            <View
              style={[
                styles.logoCircle,
                { backgroundColor: colors.primaryLight, borderColor: isDark ? '#263830' : '#D0E3DA' },
              ]}
            >
              <Gauge size={38} color={colors.primary} />
            </View>
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>DriverPulse</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
              Assistente financeiro e operacional com inteligência de custos para motoristas.
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
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <Button
              title="Entrar na Conta"
              variant="primary"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight size={18} color="#091A12" />}
              onPress={handleLogin}
              style={styles.loginBtn}
            />

            <Button
              title="Acessar Modo Demonstração (Sem Login)"
              variant="secondary"
              leftIcon={<Sparkles size={16} color={colors.warning} />}
              onPress={handleGuest}
              style={styles.guestBtn}
            />

            <View style={styles.registerPrompt}>
              <Text style={[styles.registerPromptText, { color: colors.textMuted }]}>
                Não possui conta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>Cadastre-se grátis</Text>
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
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 19,
  },
  form: {
    gap: 4,
  },
  loginBtn: {
    borderRadius: 20,
    marginTop: 8,
  },
  guestBtn: {
    borderRadius: 20,
    marginTop: 10,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerPromptText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
  },
});
