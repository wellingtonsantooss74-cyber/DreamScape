-- Execute este script no SQL Editor do Supabase para corrigir e configurar o banco de dados

-- 1. Tabela de Perfis (Configurações do App e Login)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  photo_url TEXT,
  theme TEXT DEFAULT 'light',
  color TEXT DEFAULT 'purple',
  nav_color TEXT DEFAULT 'default',
  is_premium BOOLEAN DEFAULT false,
  parent_pin TEXT,
  children_profiles JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem para evitar erros de duplicata
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios perfis" ON public.profiles;

-- Criar novas políticas
CREATE POLICY "Usuários podem ver seus próprios perfis" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tabela de Histórias
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY,
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  story_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias histórias" ON public.stories;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias histórias" ON public.stories;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias histórias" ON public.stories;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias histórias" ON public.stories;

-- Criar novas políticas
CREATE POLICY "Usuários podem ver suas próprias histórias" 
  ON public.stories FOR SELECT USING (auth.uid() = uid);

CREATE POLICY "Usuários podem inserir suas próprias histórias" 
  ON public.stories FOR INSERT WITH CHECK (auth.uid() = uid);

CREATE POLICY "Usuários podem atualizar suas próprias histórias" 
  ON public.stories FOR UPDATE USING (auth.uid() = uid);

CREATE POLICY "Usuários podem deletar suas próprias histórias" 
  ON public.stories FOR DELETE USING (auth.uid() = uid);


-- 3. Tabela de Pontuações do Aprender
CREATE TABLE IF NOT EXISTS public.learning_scores (
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.learning_scores ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias pontuações" ON public.learning_scores;
DROP POLICY IF EXISTS "Usuários podem inserir/atualizar suas próprias pontuações" ON public.learning_scores;

-- Criar novas políticas
CREATE POLICY "Usuários podem ver suas próprias pontuações" 
  ON public.learning_scores FOR SELECT USING (auth.uid() = uid);

CREATE POLICY "Usuários podem inserir/atualizar suas próprias pontuações" 
  ON public.learning_scores FOR ALL USING (auth.uid() = uid) WITH CHECK (auth.uid() = uid);
