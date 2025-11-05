-- Criar tabela de leaderboard público
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  chords_mastered INTEGER NOT NULL DEFAULT 0,
  total_practice_days INTEGER NOT NULL DEFAULT 0,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  monthly_xp INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_xp ON public.leaderboard_entries(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly_xp ON public.leaderboard_entries(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_monthly_xp ON public.leaderboard_entries(monthly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_streak ON public.leaderboard_entries(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard_entries(user_id);

-- Enable RLS
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ver o leaderboard
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard_entries
FOR SELECT
USING (true);

-- Policy: Usuários podem inserir suas próprias entradas
CREATE POLICY "Users can insert their own entry"
ON public.leaderboard_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias entradas
CREATE POLICY "Users can update their own entry"
ON public.leaderboard_entries
FOR UPDATE
USING (auth.uid() = user_id);

-- Criar função para atualizar entrada do leaderboard
CREATE OR REPLACE FUNCTION public.update_leaderboard_entry(
  p_user_id UUID,
  p_username TEXT,
  p_total_xp INTEGER,
  p_current_streak INTEGER,
  p_chords_mastered INTEGER,
  p_total_practice_days INTEGER,
  p_weekly_xp INTEGER,
  p_monthly_xp INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.leaderboard_entries (
    user_id,
    username,
    total_xp,
    current_streak,
    chords_mastered,
    total_practice_days,
    weekly_xp,
    monthly_xp,
    last_updated
  )
  VALUES (
    p_user_id,
    p_username,
    p_total_xp,
    p_current_streak,
    p_chords_mastered,
    p_total_practice_days,
    p_weekly_xp,
    p_monthly_xp,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    username = EXCLUDED.username,
    total_xp = EXCLUDED.total_xp,
    current_streak = EXCLUDED.current_streak,
    chords_mastered = EXCLUDED.chords_mastered,
    total_practice_days = EXCLUDED.total_practice_days,
    weekly_xp = EXCLUDED.weekly_xp,
    monthly_xp = EXCLUDED.monthly_xp,
    last_updated = now();
END;
$$;

-- Adicionar constraint unique para user_id
ALTER TABLE public.leaderboard_entries ADD CONSTRAINT leaderboard_entries_user_id_key UNIQUE (user_id);