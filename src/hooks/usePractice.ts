import { useState, useEffect } from "react";
import { PracticeSession, PracticeStats } from "@/types/practice";
import { checkAchievements } from "@/utils/achievements";
import { toast } from "sonner";

const STORAGE_KEY = "rzd_practice_stats";
const SESSIONS_KEY = "rzd_practice_sessions";

export function usePractice() {
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
        // Converter strings de data para Date
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

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

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

  const recordAttempt = (chordId: string, success: boolean, time?: number) => {
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
      
      // Atualizar melhor tempo
      if (time && (!session.bestTime || time < session.bestTime)) {
        session.bestTime = time;
      }

      // Marcar como dominado após 3 acertos consecutivos
      // Para simplificar, vamos considerar dominado se tem >= 3 sucessos
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

      // Adicionar aos acordes aprendidos
      if (success && !newStats.chordsLearned.includes(chordId)) {
        newStats.chordsLearned = [...newStats.chordsLearned, chordId];
      }

      // Adicionar aos acordes dominados
      if (session.mastered && !newStats.chordsMastered.includes(chordId)) {
        newStats.chordsMastered = [...newStats.chordsMastered, chordId];
      }

      // Atualizar dias consecutivos
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
          // Dia seguinte, incrementar
          newStats.consecutiveDays++;
        } else {
          // Quebrou o streak
          newStats.consecutiveDays = 1;
        }
      } else {
        newStats.consecutiveDays = 1;
      }

      newStats.lastPracticeDate = now;

      // Atualizar melhor tempo geral
      if (time && success) {
        if (!newStats.fastestTransition || time < newStats.fastestTransition) {
          newStats.fastestTransition = time;
        }
      }

      // Verificar novas conquistas
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
  };

  const getSession = (chordId: string): PracticeSession | null => {
    return sessions[chordId] || null;
  };

  const resetStats = () => {
    setStats(getInitialStats());
    setSessions({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSIONS_KEY);
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
