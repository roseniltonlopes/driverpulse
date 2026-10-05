-- ==============================================================================
-- DRIVERPULSE — SCRIPT DDL E CONFIGURAÇÃO SUPABASE (POSTGRESQL + RLS)
-- ==============================================================================

-- Habilita extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    daily_goal NUMERIC(10,2) DEFAULT 250.00 NOT NULL,
    vehicle_model TEXT,
    maintenance_cost_per_km NUMERIC(10,2) DEFAULT 0.20 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE TURNOS DE TRABALHO
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    start_km INTEGER NOT NULL,
    end_km INTEGER,
    status TEXT CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE TRANSAÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('INCOME', 'EXPENSE')) NOT NULL,
    category TEXT CHECK (category IN (
        'UBER', '99', 'INDRIVE', 'PRIVATE',
        'FUEL', 'FOOD', 'MAINTENANCE', 'OTHER'
    )) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    odometer_km INTEGER,
    fuel_liters NUMERIC(6,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON public.shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_shift_id ON public.transactions(shift_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- 5. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE ACESSO (RLS)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their shifts" ON public.shifts;
CREATE POLICY "Users can manage their shifts" ON public.shifts
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their transactions" ON public.transactions;
CREATE POLICY "Users can manage their transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- 7. TRIGGER AUTOMÁTICO PARA CRIAR PERFIL AO CRIAR USUÁRIO NO AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, daily_goal, vehicle_model, maintenance_cost_per_km)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Motorista'),
    250.00,
    COALESCE(new.raw_user_meta_data->>'vehicle_model', 'Carro Padrão'),
    0.20
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
