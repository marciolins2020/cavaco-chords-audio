-- Criar tabela de desafios diários
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own challenges"
ON public.daily_challenges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
ON public.daily_challenges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
ON public.daily_challenges
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_daily_challenges_updated_at
BEFORE UPDATE ON public.daily_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar campo de XP total na tabela practice_stats
ALTER TABLE public.practice_stats
ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0;