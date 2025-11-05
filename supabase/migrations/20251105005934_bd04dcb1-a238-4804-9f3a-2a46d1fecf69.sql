-- Criar tabela de estatísticas de prática (se não existir)
CREATE TABLE IF NOT EXISTS public.practice_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0,
  total_successes INTEGER DEFAULT 0,
  chords_learned TEXT[] DEFAULT '{}',
  chords_mastered TEXT[] DEFAULT '{}',
  consecutive_days INTEGER DEFAULT 0,
  last_practice_date TIMESTAMP WITH TIME ZONE,
  fastest_transition INTEGER,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.practice_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para practice_stats
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_stats' AND policyname = 'Users can view their own stats') THEN
    CREATE POLICY "Users can view their own stats"
      ON public.practice_stats FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_stats' AND policyname = 'Users can insert their own stats') THEN
    CREATE POLICY "Users can insert their own stats"
      ON public.practice_stats FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_stats' AND policyname = 'Users can update their own stats') THEN
    CREATE POLICY "Users can update their own stats"
      ON public.practice_stats FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Criar tabela de sessões de prática
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  chord_id TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  successes INTEGER DEFAULT 0,
  mastered BOOLEAN DEFAULT false,
  best_time INTEGER,
  last_practiced TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, chord_id)
);

ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para practice_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_sessions' AND policyname = 'Users can view their own sessions') THEN
    CREATE POLICY "Users can view their own sessions"
      ON public.practice_sessions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_sessions' AND policyname = 'Users can insert their own sessions') THEN
    CREATE POLICY "Users can insert their own sessions"
      ON public.practice_sessions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practice_sessions' AND policyname = 'Users can update their own sessions') THEN
    CREATE POLICY "Users can update their own sessions"
      ON public.practice_sessions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Criar tabela de favoritos
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  chord_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, chord_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_favorites
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can view their own favorites') THEN
    CREATE POLICY "Users can view their own favorites"
      ON public.user_favorites FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can insert their own favorites') THEN
    CREATE POLICY "Users can insert their own favorites"
      ON public.user_favorites FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can delete their own favorites') THEN
    CREATE POLICY "Users can delete their own favorites"
      ON public.user_favorites FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Criar tabela de histórico
CREATE TABLE IF NOT EXISTS public.user_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  chord_id TEXT NOT NULL,
  context TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_history
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_history' AND policyname = 'Users can view their own history') THEN
    CREATE POLICY "Users can view their own history"
      ON public.user_history FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_history' AND policyname = 'Users can insert their own history') THEN
    CREATE POLICY "Users can insert their own history"
      ON public.user_history FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_history' AND policyname = 'Users can delete their own history') THEN
    CREATE POLICY "Users can delete their own history"
      ON public.user_history FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;

-- Triggers para updated_at (se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_practice_stats_updated_at') THEN
    CREATE TRIGGER update_practice_stats_updated_at
      BEFORE UPDATE ON public.practice_stats
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_practice_sessions_updated_at') THEN
    CREATE TRIGGER update_practice_sessions_updated_at
      BEFORE UPDATE ON public.practice_sessions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;

-- Índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_chord_id ON public.practice_sessions(chord_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON public.user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_created_at ON public.user_history(created_at DESC);