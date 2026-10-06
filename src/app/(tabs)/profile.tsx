import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Car,
  Target,
  Wrench,
  Database,
  Sparkles,
  LogOut,
  Save,
  Check,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useTheme, ThemeMode } from '../../stores/useThemeStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { isSupabaseConfigured } from '../../services/supabase';

export default function ProfileScreen() {
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const profile = useAuthStore(s => s.profile);
  const user = useAuthStore(s => s.user);
  const isGuest = useAuthStore(s => s.isGuest);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const signOut = useAuthStore(s => s.signOut);
  const seedDemoShifts = useShiftStore(s => s.seedDemoShifts);
  const seedDemoTransactions = useFinanceStore(s => s.seedDemoTransactions);

  const [name, setName] = useState(profile?.name || '');
  const [vehicleModel, setVehicleModel] = useState(profile?.vehicle_model || '');
  const [dailyGoal, setDailyGoal] = useState(profile?.daily_goal ? String(profile.daily_goal) : '250');
  const [maintenanceCost, setMaintenanceCost] = useState(
    profile?.maintenance_cost_per_km ? String(profile.maintenance_cost_per_km) : '0.20'
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    const goalNum = parseFloat(dailyGoal.replace(',', '.'));
    const costNum = parseFloat(maintenanceCost.replace(',', '.'));

    if (isNaN(goalNum) || goalNum <= 0) {
      Alert.alert('Atenção', 'Informe uma meta diária válida maior que zero.');
      return;
    }

    if (isNaN(costNum) || costNum < 0) {
      Alert.alert('Atenção', 'Informe um custo de manutenção por km válido.');
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      name: name.trim() || 'Motorista',
      vehicle_model: vehicleModel.trim() || 'Carro Padrão',
      daily_goal: goalNum,
      maintenance_cost_per_km: costNum,
    });
    setSaving(false);

    if (result.error) {
      Alert.alert('Erro ao Salvar', result.error);
    } else {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleSeedDemo = async () => {
    Alert.alert(
      'Carregar Dados de Exemplo',
      'Deseja carregar turnos, corridas e abastecimentos simulados para testar relatórios e métricas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Carregar Dados',
          onPress: async () => {
            await seedDemoShifts();
            await seedDemoTransactions();
            Alert.alert('Sucesso! 🎉', 'Dados de exemplo carregados no seu app.');
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Sair da Conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: any }[] = [
    { mode: 'dark', label: 'Escuro', icon: Moon },
    { mode: 'light', label: 'Claro', icon: Sun },
    { mode: 'system', label: 'Sistema', icon: Smartphone },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Perfil e Parâmetros</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Configure suas metas, veículo e custos estimados de rodagem.
          </Text>
        </View>

        {/* User Card */}
        <Card variant="elevated" style={styles.userCard}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primaryLight }]}>
            <User size={28} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {profile?.name || 'Motorista'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>
              {user?.email || 'Modo Local / Demo'}
            </Text>
          </View>
        </Card>

        {/* Theme Preference Selector */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Aparência do Aplicativo</Text>
        </View>

        <Card variant="elevated" style={styles.themeCard}>
          <View style={styles.themeGrid}>
            {themeOptions.map(({ mode, label, icon: IconComponent }) => {
              const isSelected = themeMode === mode;

              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOptionBtn,
                    {
                      backgroundColor: isSelected ? colors.tagBg : colors.card,
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setThemeMode(mode)}
                  activeOpacity={0.8}
                >
                  <IconComponent
                    size={18}
                    color={isSelected ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      { color: isSelected ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Form Settings */}
        <Card variant="elevated" style={styles.formCard}>
          <Text style={[styles.formSectionTitle, { color: colors.textPrimary }]}>
            Configurações Operacionais
          </Text>

          <Input
            label="Seu Nome / Apelido"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Carlos Silva"
            leftIcon={<User size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Modelo do Veículo"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            placeholder="Ex: Chevrolet Onix Plus 1.0"
            leftIcon={<Car size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Meta Diária de Faturamento (R$)"
            value={dailyGoal}
            onChangeText={setDailyGoal}
            keyboardType="numeric"
            placeholder="250.00"
            leftIcon={<Target size={18} color={colors.primary} />}
          />

          <Input
            label="Custo Est. Manutenção / Depreciação (R$/km)"
            value={maintenanceCost}
            onChangeText={setMaintenanceCost}
            keyboardType="numeric"
            placeholder="0.20"
            leftIcon={<Wrench size={18} color={colors.warning} />}
          />

          <Text style={[styles.costExplanation, { color: colors.textMuted }]}>
            💡 O custo por km (padrão sugerido: R$ 0,20/km) desconta automaticamente óleo, pneus, freios e depreciação veicular do seu faturamento bruto.
          </Text>

          <Button
            title={savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
            variant={savedSuccess ? 'outline' : 'primary'}
            leftIcon={
              savedSuccess ? (
                <Check size={18} color={colors.primary} />
              ) : (
                <Save size={18} color="#091A12" />
              )
            }
            loading={saving}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </Card>

        {/* Database & Demo Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ambiente e Demonstração</Text>
        </View>

        <Card variant="elevated" style={styles.envCard}>
          <View style={styles.envRow}>
            <View style={[styles.envIconBox, { backgroundColor: colors.tagBg }]}>
              <Database size={20} color={isSupabaseConfigured() ? colors.primary : colors.info} />
            </View>
            <View style={styles.envDetails}>
              <Text style={[styles.envTitle, { color: colors.textPrimary }]}>
                {isSupabaseConfigured() ? 'Supabase Conectado' : 'Modo Local (AsyncStorage)'}
              </Text>
              <Text style={[styles.envSubtitle, { color: colors.textMuted }]}>
                {isSupabaseConfigured()
                  ? 'Sincronização em nuvem com PostgreSQL e RLS ativa.'
                  : 'Seus dados estão salvos com segurança no armazenamento local do dispositivo.'}
              </Text>
            </View>
          </View>

          <Button
            title="Carregar Massa de Testes (Demo)"
            variant="secondary"
            leftIcon={<Sparkles size={16} color={colors.warning} />}
            onPress={handleSeedDemo}
            style={styles.seedBtn}
          />
        </Card>

        {/* Logout */}
        <Button
          title="Sair da Conta / Reiniciar Sessão"
          variant="ghost"
          leftIcon={<LogOut size={16} color={colors.danger} />}
          textStyle={{ color: colors.danger }}
          onPress={handleSignOut}
          style={styles.signOutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 22,
    gap: 14,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  themeCard: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 20,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  themeOptionLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  formCard: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 22,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  costExplanation: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
  saveBtn: {
    borderRadius: 18,
  },
  envCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 22,
    gap: 14,
  },
  envRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  envIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  envDetails: {
    flex: 1,
  },
  envTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  envSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  seedBtn: {
    borderRadius: 14,
  },
  signOutBtn: {
    marginTop: 8,
  },
});
