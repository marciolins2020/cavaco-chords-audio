import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StreakData {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  streak_freeze_count: number;
  total_practice_days: number;
}

interface DailyLog {
  practice_date: string;
  sessions_count: number;
  chords_practiced: string[];
  total_attempts: number;
}

export const useStreak = (userId: string | undefined) => {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadStreakData();
      loadDailyLogs();
    }
  }, [userId]);

  const loadStreakData = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("practice_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        // Criar streak inicial
        const { data: newStreak, error: insertError } = await supabase
          .from("practice_streaks")
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertError) throw insertError;
        setStreak(newStreak);
      } else {
        setStreak(data);
      }
    } catch (error) {
      console.error("Erro ao carregar streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyLogs = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("daily_practice_log")
        .select("*")
        .eq("user_id", userId)
        .order("practice_date", { ascending: false })
        .limit(365);

      if (error) throw error;
      setDailyLogs(data || []);
    } catch (error) {
      console.error("Erro ao carregar logs diários:", error);
    }
  };

  const recordPracticeDay = async (chordId: string, attempts: number) => {
    if (!userId || !streak) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const lastPracticeDate = streak.last_practice_date;
      
      // Atualizar ou criar log diário
      const { data: existingLog } = await supabase
        .from("daily_practice_log")
        .select("*")
        .eq("user_id", userId)
        .eq("practice_date", today)
        .single();

      if (existingLog) {
        // Atualizar log existente
        const updatedChords = [...new Set([...existingLog.chords_practiced, chordId])];
        await supabase
          .from("daily_practice_log")
          .update({
            sessions_count: existingLog.sessions_count + 1,
            chords_practiced: updatedChords,
            total_attempts: existingLog.total_attempts + attempts,
          })
          .eq("id", existingLog.id);
      } else {
        // Criar novo log
        await supabase
          .from("daily_practice_log")
          .insert({
            user_id: userId,
            practice_date: today,
            chords_practiced: [chordId],
            total_attempts: attempts,
          });
      }

      // Verificar se deve atualizar streak
      if (lastPracticeDate !== today) {
        await updateStreak(today, lastPracticeDate);
      }

      await loadDailyLogs();
    } catch (error) {
      console.error("Erro ao registrar dia de prática:", error);
    }
  };

  const updateStreak = async (today: string, lastDate: string | null) => {
    if (!userId || !streak) return;

    const todayDate = new Date(today);
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    let totalDays = streak.total_practice_days + 1;

    if (lastDate === yesterdayStr) {
      // Continuou o streak
      newStreak = streak.current_streak + 1;
    } else if (lastDate === today) {
      // Já praticou hoje
      return;
    }

    const longestStreak = Math.max(newStreak, streak.longest_streak);

    const { error } = await supabase
      .from("practice_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_practice_date: today,
        total_practice_days: totalDays,
      })
      .eq("user_id", userId);

    if (error) throw error;

    // Verificar milestones
    checkMilestones(newStreak);

    setStreak({
      ...streak,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_practice_date: today,
      total_practice_days: totalDays,
    });
  };

  const checkMilestones = (currentStreak: number) => {
    const milestones = [7, 14, 30, 60, 100, 365];
    if (milestones.includes(currentStreak)) {
      toast.success(`🔥 Incrível! ${currentStreak} dias de prática consecutivos!`, {
        description: `Você desbloqueou o badge de ${currentStreak} dias!`,
        duration: 5000,
      });
    }
  };

  const useStreakFreeze = async () => {
    if (!userId || !streak || streak.streak_freeze_count <= 0) {
      toast.error("Você não tem congelamentos disponíveis");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("practice_streaks")
        .update({
          last_practice_date: today,
          streak_freeze_count: streak.streak_freeze_count - 1,
        })
        .eq("user_id", userId);

      if (error) throw error;

      setStreak({
        ...streak,
        last_practice_date: today,
        streak_freeze_count: streak.streak_freeze_count - 1,
      });

      toast.success("❄️ Congelamento de streak usado!", {
        description: "Seu streak foi preservado por mais um dia.",
      });
    } catch (error) {
      console.error("Erro ao usar congelamento:", error);
      toast.error("Erro ao usar congelamento");
    }
  };

  return {
    streak,
    dailyLogs,
    loading,
    recordPracticeDay,
    useStreakFreeze,
  };
};
