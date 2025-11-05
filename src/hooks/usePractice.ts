import { useState, useEffect } from "react";
import { PracticeSession, PracticeStats } from "@/types/practice";
import { checkAchievements } from "@/utils/achievements";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "rzd_practice_stats";
const SESSIONS_KEY = "rzd_practice_sessions";

export function usePractice() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PracticeStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          lastPracticeDate: parsed.lastPracticeDate
            ? new Date(parsed.lastPracticeDate)
            : undefined,
        };
      } catch {
        return getInitialStats();
      }
    }
    return getInitialStats();
  });

  const [sessions, setSessions] = useState<Record<string, PracticeSession>>(() => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((key) => {
          parsed[key].lastPracticed = new Date(parsed[key].lastPracticed);
        });
        return parsed;
      } catch {
        return {};
      }
    }
    return {};
  });

  // Carregar dados do Supabase quando o usuário faz login
  useEffect(() => {
    if (user) {
      loadPracticeDataFromSupabase();
    }
  }, [user]);

  const loadPracticeDataFromSupabase = async () => {
    try {
      // Carregar estatísticas
      const { data: statsData, error: statsError } = await supabase
        .from("practice_stats")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (statsError && statsError.code !== "PGRST116") throw statsError;

      if (statsData) {
        setStats({
          totalAttempts: statsData.total_attempts,
          totalSuccesses: statsData.total_successes,
          chordsLearned: statsData.chords_learned || [],
          chordsMastered: statsData.chords_mastered || [],
          consecutiveDays: statsData.consecutive_days,
          lastPracticeDate: statsData.last_practice_date
            ? new Date(statsData.last_practice_date)
            : undefined,
          fastestTransition: statsData.fastest_transition || undefined,
          achievements: statsData.achievements || [],
        });
      }

      // Carregar sessões
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", user!.id);

      if (sessionsError) throw sessionsError;

      if (sessionsData) {
        const loadedSessions: Record<string, PracticeSession> = {};
        sessionsData.forEach((s) => {
          loadedSessions[s.chord_id] = {
            chordId: s.chord_id,
            attempts: s.attempts,
            successes: s.successes,
            lastPracticed: new Date(s.last_practiced),
            mastered: s.mastered,
            bestTime: s.best_time || undefined,
          };
        });
        setSessions(loadedSessions);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de prática:", error);
    }
  };

  // Salvar no localStorage apenas quando não logado
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions, user]);

  function getInitialStats(): PracticeStats {
    return {
      totalAttempts: 0,
      totalSuccesses: 0,
      chordsLearned: [],
      chordsMastered: [],
      consecutiveDays: 0,
      achievements: [],
    };
  }

  const recordAttempt = async (chordId: string, success: boolean, time?: number) => {
    const now = new Date();

    // Atualizar sessão do acorde
    const session = sessions[chordId] || {
      chordId,
      attempts: 0,
      successes: 0,
      lastPracticed: now,
      mastered: false,
    };

    session.attempts++;
    session.lastPracticed = now;

    if (success) {
      session.successes++;
      
      if (time && (!session.bestTime || time < session.bestTime)) {
        session.bestTime = time;
      }

      if (session.successes >= 3 && !session.mastered) {
        session.mastered = true;
        toast.success(`🎉 Você dominou o acorde ${chordId}!`);
      }
    }

    setSessions((prev) => ({
      ...prev,
      [chordId]: session,
    }));

    // Atualizar estatísticas gerais
    setStats((prev) => {
      const newStats = { ...prev };
      newStats.totalAttempts++;

      if (success) {
        newStats.totalSuccesses++;
      }

      if (success && !newStats.chordsLearned.includes(chordId)) {
        newStats.chordsLearned = [...newStats.chordsLearned, chordId];
      }

      if (session.mastered && !newStats.chordsMastered.includes(chordId)) {
        newStats.chordsMastered = [...newStats.chordsMastered, chordId];
      }

      const lastDate = prev.lastPracticeDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastDate) {
        const lastPractice = new Date(lastDate);
        lastPractice.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Mesmo dia, manter streak
        } else if (diffDays === 1) {
          newStats.consecutiveDays++;
        } else {
          newStats.consecutiveDays = 1;
        }
      } else {
        newStats.consecutiveDays = 1;
      }

      newStats.lastPracticeDate = now;

      if (time && success) {
        if (!newStats.fastestTransition || time < newStats.fastestTransition) {
          newStats.fastestTransition = time;
        }
      }

      const newAchievements = checkAchievements(newStats);
      newAchievements.forEach((achievement) => {
        newStats.achievements = [...newStats.achievements, achievement.id];
        toast.success(
          `🏆 Nova conquista: ${achievement.icon} ${achievement.name}`,
          {
            description: achievement.description,
            duration: 5000,
          }
        );
      });

      return newStats;
    });

    // Sincronizar com Supabase se logado
    if (user) {
      try {
        // Atualizar ou inserir sessão
        await supabase
          .from("practice_sessions")
          .upsert({
            user_id: user.id,
            chord_id: chordId,
            attempts: session.attempts,
            successes: session.successes,
            best_time: session.bestTime || null,
            mastered: session.mastered,
            last_practiced: now.toISOString(),
          });

        // Atualizar estatísticas gerais
        const { data: currentStats } = await supabase
          .from("practice_stats")
          .select("*")
          .eq("user_id", user.id)
          .single();

        await supabase
          .from("practice_stats")
          .upsert({
            user_id: user.id,
            total_attempts: (currentStats?.total_attempts || 0) + 1,
            total_successes: (currentStats?.total_successes || 0) + (success ? 1 : 0),
            chords_learned: Array.from(new Set([...(currentStats?.chords_learned || []), ...(success ? [chordId] : [])])),
            chords_mastered: session.mastered 
              ? Array.from(new Set([...(currentStats?.chords_mastered || []), chordId]))
              : currentStats?.chords_mastered || [],
            consecutive_days: stats.consecutiveDays,
            last_practice_date: now.toISOString(),
            fastest_transition: time && success 
              ? Math.min(time, currentStats?.fastest_transition || Infinity)
              : currentStats?.fastest_transition,
            achievements: stats.achievements,
          });
      } catch (error) {
        console.error("Erro ao sincronizar prática:", error);
      }
    }
  };

  const getSession = (chordId: string): PracticeSession | null => {
    return sessions[chordId] || null;
  };

  const resetStats = async () => {
    setStats(getInitialStats());
    setSessions({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSIONS_KEY);

    // Se logado, resetar no Supabase também
    if (user) {
      try {
        await supabase
          .from("practice_sessions")
          .delete()
          .eq("user_id", user.id);

        await supabase
          .from("practice_stats")
          .update({
            total_attempts: 0,
            total_successes: 0,
            chords_learned: [],
            chords_mastered: [],
            consecutive_days: 0,
            fastest_transition: null,
            achievements: [],
            last_practice_date: null,
          })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Erro ao resetar estatísticas:", error);
      }
    }

    toast.success("Estatísticas resetadas");
  };

  return {
    stats,
    sessions,
    recordAttempt,
    getSession,
    resetStats,
  };
}
