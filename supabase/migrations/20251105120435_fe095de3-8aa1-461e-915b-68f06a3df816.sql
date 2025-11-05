-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar tabela para rastrear streaks
CREATE TABLE IF NOT EXISTS public.practice_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  streak_freeze_count INTEGER NOT NULL DEFAULT 0,
  total_practice_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico diário de prática
CREATE TABLE IF NOT EXISTS public.daily_practice_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice_date DATE NOT NULL,
  sessions_count INTEGER NOT NULL DEFAULT 1,
  chords_practiced TEXT[] DEFAULT '{}',
  total_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, practice_date)
);

-- Enable Row Level Security
ALTER TABLE public.practice_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_practice_log ENABLE ROW LEVEL SECURITY;

-- Policies para practice_streaks
CREATE POLICY "Users can view their own streak"
ON public.practice_streaks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak"
ON public.practice_streaks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak"
ON public.practice_streaks
FOR UPDATE
USING (auth.uid() = user_id);

-- Policies para daily_practice_log
CREATE POLICY "Users can view their own practice log"
ON public.daily_practice_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice log"
ON public.daily_practice_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice log"
ON public.daily_practice_log
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_practice_streaks_updated_at
BEFORE UPDATE ON public.practice_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_practice_streaks_user_id ON public.practice_streaks(user_id);
CREATE INDEX idx_daily_practice_log_user_date ON public.daily_practice_log(user_id, practice_date DESC);