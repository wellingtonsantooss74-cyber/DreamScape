-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de Perfis (Configurações do App e Login)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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

-- Habilitar RLS (Row Level Security) para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Usuários podem ver seus próprios perfis" 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seus próprios perfis" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tabela de Histórias
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  uid UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  story_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para stories
CREATE POLICY "Usuários podem ver suas próprias histórias" 
  ON stories FOR SELECT USING (auth.uid() = uid);

CREATE POLICY "Usuários podem inserir suas próprias histórias" 
  ON stories FOR INSERT WITH CHECK (auth.uid() = uid);

CREATE POLICY "Usuários podem atualizar suas próprias histórias" 
  ON stories FOR UPDATE USING (auth.uid() = uid);

CREATE POLICY "Usuários podem deletar suas próprias histórias" 
  ON stories FOR DELETE USING (auth.uid() = uid);


-- 3. Tabela de Pontuações do Aprender
CREATE TABLE learning_scores (
  uid UUID REFERENCES auth.users(id) PRIMARY KEY,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para learning_scores
ALTER TABLE learning_scores ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para learning_scores
CREATE POLICY "Usuários podem ver suas próprias pontuações" 
  ON learning_scores FOR SELECT USING (auth.uid() = uid);

CREATE POLICY "Usuários podem inserir/atualizar suas próprias pontuações" 
  ON learning_scores FOR ALL USING (auth.uid() = uid) WITH CHECK (auth.uid() = uid);
