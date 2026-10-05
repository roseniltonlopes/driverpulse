# DriverPulse 🚗💨

**DriverPulse** é um aplicativo mobile profissional desenvolvido com **React Native**, **Expo Router**, **TypeScript**, **Zustand** e **Supabase**, projetado especificamente para motoristas de aplicativo (Uber, 99, inDrive, corridas particulares) e entregadores autônomos.

O aplicativo resolve o principal desafio da categoria: **a falta de clareza sobre o lucro líquido real**, calculando instantaneamente as deduções diretas (combustível, alimentação) e os custos diferidos de desgaste veicular e depreciação por quilômetro rodado.

---

## 📱 Funcionalidades Principais (MVP)

### 1. ⏱️ Gestão de Turnos (Shift Tracker)
- Abertura de turno registrando **hodômetro inicial (km)** e cronômetro em tempo real.
- Fechamento de turno registrando **hodômetro final** e cálculo automático da distância percorrida ($\Delta\text{km}$).
- Registro e cancelamento de turnos com persistência local e em nuvem.

### 2. ⚡ Lançamento Rápido de Movimentações
- **Receitas:** Discriminadas por plataforma (**Uber**, **99 App**, **inDrive**, **Particular**).
- **Despesas:** Categorizadas em **Combustível**, **Alimentação**, **Manutenção / Troca de Óleo** e **Outros**.
- **Autonomia de Combustível (km/l):** Registro com volume em litros, hodômetro e cálculo automático do consumo médio.

### 3. 📊 Dashboard Operacional Dinâmico
- **Lucro Líquido Real:** $\text{Faturamento Bruto} - (\text{Despesas Diretas} + \text{Reserva de Manutenção por km})$.
- **Barra de Meta Diária:** Acompanhamento visual da meta de faturamento com valor restante.
- **Métricas de Eficiência:** Rendimento líquido por quilômetro ($\text{R\$}/\text{km}$) e por hora trabalhada ($\text{R\$}/\text{h}$).

### 4. 📅 Relatórios e Histórico Consolidado
- Filtros por período: **Hoje**, **Últimos 7 Dias** e **Histórico Completo**.
- Gráficos e indicadores de distribuição de receita por plataforma e despesas por categoria.

### 5. ⚙️ Perfil e Personalização
- Edição de meta diária de faturamento.
- Configuração do modelo do veículo.
- Ajuste do custo estimado de manutenção/depreciação por km rodado (padrão: `R$ 0,20/km`).
- **Gerador de Dados de Demonstração (Seed Demo):** Permite popular o aplicativo com dados realistas de exemplo com 1 clique para testes imediatos.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Framework Base** | React Native + Expo SDK 57 (Managed Workflow) |
| **Roteamento** | Expo Router (v4 / File-based Routing) |
| **Linguagem** | TypeScript (Modo Estrito) |
| **Gerenciamento de Estado** | Zustand |
| **Banco de Dados & Auth** | Supabase (PostgreSQL + RLS) + Suporte Local Offline (AsyncStorage) |
| **Ícones** | Lucide React Native |

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Servidor de Desenvolvimento Expo

```bash
npx expo start
```

### 2. Executar no Dispositivo ou Emulador
- **Android:** Pressione `a` no terminal ou `npm run android`
- **iOS:** Pressione `i` no terminal ou `npm run ios` (macOS)
- **Web:** Pressione `w` no terminal ou `npm run web`
- **Dispositivo Físico:** Abra o aplicativo **Expo Go** no celular e escaneie o QR Code exibido no terminal.

---

## 🗄️ Configuração do Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** do Supabase e execute o script contido em [`supabase/schema.sql`](./supabase/schema.sql).
3. Crie um arquivo `.env` na raiz do projeto com as suas credenciais:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```

*Nota: O aplicativo possui resiliência total e opera normalmente em modo offline/local utilizando `AsyncStorage` mesmo sem configurar o Supabase.*
