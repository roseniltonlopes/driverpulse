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
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useShiftStore } from '../../stores/useShiftStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/theme';
import { isSupabaseConfigured } from '../../services/supabase';
import { formatBRL } from '../../utils/formatters';

export default function ProfileScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil e Parâmetros</Text>
          <Text style={styles.subtitle}>
            Configure suas metas, veículo e custos estimados de rodagem.
          </Text>
        </View>

        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userAvatar}>
            <User size={28} color={COLORS.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.name || 'Motorista'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Modo Local / Demo'}</Text>
          </View>
        </Card>

        {/* Form Settings */}
        <Card style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Configurações Operacionais</Text>

          <Input
            label="Seu Nome / Apelido"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Carlos Silva"
            leftIcon={<User size={18} color={COLORS.textSecondary} />}
          />

          <Input
            label="Modelo do Veículo"
            value={vehicleModel}
            onChangeText={setVehicleModel}
            placeholder="Ex: Chevrolet Onix Plus 1.0"
            leftIcon={<Car size={18} color={COLORS.textSecondary} />}
          />

          <Input
            label="Meta Diária de Faturamento (R$)"
            value={dailyGoal}
            onChangeText={setDailyGoal}
            keyboardType="numeric"
            placeholder="250.00"
            leftIcon={<Target size={18} color={COLORS.primary} />}
          />

          <Input
            label="Custo Est. Manutenção / Depreciação (R$/km)"
            value={maintenanceCost}
            onChangeText={setMaintenanceCost}
            keyboardType="numeric"
            placeholder="0.20"
            leftIcon={<Wrench size={18} color={COLORS.warning} />}
          />

          <Text style={styles.costExplanation}>
            💡 O custo por km (padrão sugerido: R$ 0,20/km) desconta automaticamente óleo, pneus, freios e depreciação veicular do seu faturamento bruto.
          </Text>

          <Button
            title={savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
            variant={savedSuccess ? 'outline' : 'primary'}
            leftIcon={
              savedSuccess ? (
                <Check size={18} color={COLORS.primary} />
              ) : (
                <Save size={18} color="#FFFFFF" />
              )
            }
            loading={saving}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </Card>

        {/* Database & Demo Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ambiente e Demonstração</Text>
        </View>

        <Card style={styles.envCard}>
          <View style={styles.envRow}>
            <View style={styles.envIconBox}>
              <Database size={20} color={isSupabaseConfigured() ? COLORS.primary : COLORS.info} />
            </View>
            <View style={styles.envDetails}>
              <Text style={styles.envTitle}>
                {isSupabaseConfigured() ? 'Supabase Conectado' : 'Modo Local (AsyncStorage)'}
              </Text>
              <Text style={styles.envSubtitle}>
                {isSupabaseConfigured()
                  ? 'Sincronização em nuvem com PostgreSQL e RLS ativa.'
                  : 'Seus dados estão salvos com segurança no armazenamento local do dispositivo.'}
              </Text>
            </View>
          </View>

          <Button
            title="Carregar Massa de Testes (Demo)"
            variant="secondary"
            leftIcon={<Sparkles size={16} color={COLORS.warning} />}
            onPress={handleSeedDemo}
            style={styles.seedBtn}
          />
        </Card>

        {/* Logout */}
        <Button
          title="Sair da Conta / Reiniciar Sessão"
          variant="ghost"
          leftIcon={<LogOut size={16} color={COLORS.danger} />}
          textStyle={{ color: COLORS.danger }}
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.cardElevated,
    marginBottom: 16,
    gap: 14,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  formCard: {
    padding: 18,
    backgroundColor: COLORS.cardElevated,
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  costExplanation: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 16,
  },
  saveBtn: {
    borderRadius: 12,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  envCard: {
    padding: 16,
    backgroundColor: COLORS.cardElevated,
    marginBottom: 16,
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
    borderRadius: 10,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  envDetails: {
    flex: 1,
  },
  envTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  envSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  seedBtn: {
    borderRadius: 10,
  },
  signOutBtn: {
    marginTop: 8,
  },
});
