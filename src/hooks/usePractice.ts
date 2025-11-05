import { useState, useEffect } from "react";
import { PracticeSession, PracticeStats } from "@/types/practice";
import { checkAchievements } from "@/utils/achievements";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "rzd_practice_stats";
const SESSIONS_KEY = "rzd_practice_sessions";

export function usePractice(userId?: string) {
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
    if (userId) {
      loadPracticeDataFromSupabase();
    }
  }, [userId]);

  const loadPracticeDataFromSupabase = async () => {
    if (!userId) return;
    try {
      // Carregar estatísticas
      const { data: statsData, error: statsError } = await supabase
        .from("practice_stats")
        .select("*")
        .eq("user_id", userId)
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
        .eq("user_id", userId);

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
    if (!userId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats, userId]);

  useEffect(() => {
    if (!userId) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions, userId]);

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
    
    // Atualizar desafios diários (se logado e sucesso)
    if (userId && success) {
      try {
        const today = new Date().toISOString().split("T")[0];
        
        // Buscar desafios ativos de hoje
        const { data: challenges } = await supabase
          .from("daily_challenges" as any)
          .select("*")
          .eq("user_id", userId)
          .eq("date", today)
          .eq("completed", false);

        if (challenges && challenges.length > 0) {
          for (const challenge of challenges as any[]) {
            let newProgress = challenge.current_progress;
            let shouldUpdate = false;

            // Atualizar progresso baseado no tipo de desafio
            if (challenge.challenge_type === "practice_chords") {
              // Contar acordes únicos praticados hoje
              const { data: todayLog } = await supabase
                .from("daily_practice_log")
                .select("chords_practiced")
                .eq("user_id", userId)
                .eq("practice_date", today)
                .single();

              const uniqueChords = new Set(todayLog?.chords_practiced || []);
              uniqueChords.add(chordId);
              newProgress = uniqueChords.size;
              shouldUpdate = true;
            } else if (challenge.challenge_type === "new_chords") {
              // Contar novos acordes aprendidos hoje
              if (!stats.chordsLearned.includes(chordId)) {
                newProgress = challenge.current_progress + 1;
                shouldUpdate = true;
              }
            }

            if (shouldUpdate && newProgress !== challenge.current_progress) {
              const completed = newProgress >= challenge.target_value;
              
              await supabase
                .from("daily_challenges" as any)
                .update({
                  current_progress: newProgress,
                  completed,
                })
                .eq("id", challenge.id);

              if (completed) {
                toast.success(`🎉 Desafio concluído! +${challenge.xp_reward} XP`, {
                  description: challenge.title,
                  duration: 5000,
                });

                // Adicionar XP ao usuário
                const { data: practiceStats } = await supabase
                  .from("practice_stats")
                  .select("*")
                  .eq("user_id", userId)
                  .single();

                if (practiceStats) {
                  const currentXP = (practiceStats as any).total_xp || 0;
                  await supabase
                    .from("practice_stats")
                    .update({
                      total_xp: currentXP + challenge.xp_reward,
                    } as any)
                    .eq("user_id", userId);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar desafios:", error);
      }
    }
    
    // Atualizar metas de prática (se logado)
    if (userId && success) {
      try {
        // Buscar metas ativas
        const { data: activeGoals } = await supabase
          .from("practice_goals")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .eq("completed", false);

        if (activeGoals && activeGoals.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          
          for (const goal of activeGoals) {
            let shouldUpdate = false;
            let newValue = goal.current_value;

            // Determinar se deve atualizar baseado no tipo de meta
            if (goal.goal_type === "daily_chords") {
              // Verificar se é um novo acorde hoje
              const { data: todayLog } = await supabase
                .from("daily_practice_log")
                .select("chords_practiced")
                .eq("user_id", userId)
                .eq("practice_date", today)
                .single();

              if (todayLog && !todayLog.chords_practiced.includes(chordId)) {
                newValue = (todayLog.chords_practiced?.length || 0) + 1;
                shouldUpdate = true;
              }
            } else if (goal.goal_type === "weekly_chords") {
              // Contar acordes únicos da semana
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              
              const { data: weekLogs } = await supabase
                .from("daily_practice_log")
                .select("chords_practiced")
                .eq("user_id", userId)
                .gte("practice_date", weekAgo.toISOString().split("T")[0]);

              const uniqueChords = new Set<string>();
              weekLogs?.forEach(log => {
                log.chords_practiced?.forEach((c: string) => uniqueChords.add(c));
              });
              newValue = uniqueChords.size;
              shouldUpdate = true;
            }

            if (shouldUpdate) {
              const completed = newValue >= goal.target_value;
              await supabase
                .from("practice_goals")
                .update({
                  current_value: newValue,
                  completed,
                  completed_at: completed ? new Date().toISOString() : null,
                })
                .eq("id", goal.id);

              if (completed && !goal.completed) {
                toast.success("🎯 Meta concluída!", {
                  description: `Você completou sua meta!`,
                  duration: 5000,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar metas:", error);
      }
    }
    
    // Registrar dia de prática no streak (se logado)
    if (userId) {
      try {
        const today = new Date().toISOString().split("T")[0];
        
        // Verificar se já existe log para hoje
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
              total_attempts: existingLog.total_attempts + 1,
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
              total_attempts: 1,
            });
          
          // Atualizar streak
          const { data: streakData } = await supabase
            .from("practice_streaks")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (streakData) {
            const lastDate = streakData.last_practice_date;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            let newStreak = 1;
            let totalDays = streakData.total_practice_days + 1;

            if (lastDate === yesterdayStr) {
              newStreak = streakData.current_streak + 1;
            }

            const longestStreak = Math.max(newStreak, streakData.longest_streak);

            await supabase
              .from("practice_streaks")
              .update({
                current_streak: newStreak,
                longest_streak: longestStreak,
                last_practice_date: today,
                total_practice_days: totalDays,
              })
              .eq("user_id", userId);

            // Notificar milestones
            const milestones = [7, 14, 30, 60, 100, 365];
            if (milestones.includes(newStreak)) {
              toast.success(`🔥 ${newStreak} dias consecutivos!`, {
                description: `Badge de ${newStreak} dias desbloqueado!`,
                duration: 5000,
              });
            }
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar streak:", error);
      }
    }

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
    if (userId) {
      try {
        // Atualizar ou inserir sessão
        await supabase
          .from("practice_sessions")
          .upsert({
            user_id: userId,
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
          .eq("user_id", userId)
          .single();

        await supabase
          .from("practice_stats")
          .upsert({
            user_id: userId,
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

        // Atualizar leaderboard
        const { data: streakData } = await supabase
          .from("practice_streaks")
          .select("*")
          .eq("user_id", userId)
          .single();

        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", userId)
          .single();

        const username = profileData?.full_name || profileData?.email?.split("@")[0] || "Músico";
        const totalXp = (currentStats as any)?.total_xp || 0;
        
        // Calcular XP semanal e mensal (simplificado - em produção seria mais preciso)
        const weeklyXp = Math.min(totalXp, 500); // Placeholder
        const monthlyXp = Math.min(totalXp, 2000); // Placeholder

        await supabase.rpc("update_leaderboard_entry", {
          p_user_id: userId,
          p_username: username,
          p_total_xp: totalXp,
          p_current_streak: streakData?.current_streak || 0,
          p_chords_mastered: session.mastered 
            ? Array.from(new Set([...(currentStats?.chords_mastered || []), chordId])).length
            : (currentStats?.chords_mastered || []).length,
          p_total_practice_days: streakData?.total_practice_days || 0,
          p_weekly_xp: weeklyXp,
          p_monthly_xp: monthlyXp,
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
    if (userId) {
      try {
        await supabase
          .from("practice_sessions")
          .delete()
          .eq("user_id", userId);

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
          .eq("user_id", userId);
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
