import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DailyChallenge {
  id: string;
  date: string;
  challenge_type: "practice_chords" | "perfect_streak" | "time_challenge" | "new_chords";
  target_value: number;
  current_progress: number;
  xp_reward: number;
  completed: boolean;
  title: string;
  description: string;
  icon: string;
}

const CHALLENGE_TEMPLATES = [
  {
    challenge_type: "practice_chords",
    title: "Mestre dos Acordes",
    description: "Pratique {target} acordes diferentes hoje",
    icon: "🎯",
    xp_reward: 100,
    target_value: 5,
  },
  {
    challenge_type: "perfect_streak",
    title: "Perfeição Total",
    description: "Acerte {target} acordes seguidos sem errar",
    icon: "⭐",
    xp_reward: 150,
    target_value: 10,
  },
  {
    challenge_type: "time_challenge",
    title: "Maratona Musical",
    description: "Pratique por {target} minutos hoje",
    icon: "⏱️",
    xp_reward: 120,
    target_value: 30,
  },
  {
    challenge_type: "new_chords",
    title: "Explorador",
    description: "Aprenda {target} novos acordes hoje",
    icon: "🔍",
    xp_reward: 200,
    target_value: 3,
  },
];

export const useDailyChallenges = (userId: string | undefined) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadOrCreateChallenges();
    }
  }, [userId]);

  const loadOrCreateChallenges = async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      // Verificar se já existem desafios para hoje
      const { data: existingChallenges, error } = await supabase
        .from("daily_challenges" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("date", today);

      if (error) throw error;

      if (existingChallenges && existingChallenges.length > 0) {
        setChallenges(existingChallenges as any as DailyChallenge[]);
      } else {
        // Criar novos desafios para hoje
        await createDailyChallenges(today);
      }
    } catch (error) {
      console.error("Erro ao carregar desafios:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDailyChallenges = async (date: string) => {
    if (!userId) return;

    try {
      // Selecionar 3 desafios aleatórios
      const selectedTemplates = CHALLENGE_TEMPLATES.sort(() => Math.random() - 0.5).slice(0, 3);

      const newChallenges = selectedTemplates.map((template) => ({
        user_id: userId,
        date,
        challenge_type: template.challenge_type,
        target_value: template.target_value,
        current_progress: 0,
        xp_reward: template.xp_reward,
        completed: false,
        title: template.title,
        description: template.description.replace("{target}", template.target_value.toString()),
        icon: template.icon,
      }));

      const { data, error } = await supabase
        .from("daily_challenges" as any)
        .insert(newChallenges)
        .select();

      if (error) throw error;

      setChallenges(data as any as DailyChallenge[]);
      toast.success("🎮 Novos desafios diários disponíveis!");
    } catch (error) {
      console.error("Erro ao criar desafios:", error);
    }
  };

  const updateChallengeProgress = async (
    challengeId: string,
    progress: number
  ) => {
    try {
      const challenge = challenges.find((c) => c.id === challengeId);
      if (!challenge) return;

      const completed = progress >= challenge.target_value;

      const { error } = await supabase
        .from("daily_challenges" as any)
        .update({
          current_progress: progress,
          completed,
        })
        .eq("id", challengeId);

      if (error) throw error;

      // Atualizar estado local
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, current_progress: progress, completed }
            : c
        )
      );

      // Notificar conclusão
      if (completed && !challenge.completed) {
        toast.success(`🎉 Desafio concluído! +${challenge.xp_reward} XP`, {
          description: challenge.title,
          duration: 5000,
        });

        // Adicionar XP ao usuário
        await addXPReward(challenge.xp_reward);
      }
    } catch (error) {
      console.error("Erro ao atualizar desafio:", error);
    }
  };

  const addXPReward = async (xp: number) => {
    if (!userId) return;

    try {
      const { data: stats } = await supabase
        .from("practice_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (stats) {
        // Criar campo de XP se não existir
        const currentXP = (stats as any).total_xp || 0;
        await supabase
          .from("practice_stats")
          .update({
            total_xp: currentXP + xp,
          } as any)
          .eq("user_id", userId);
      }
    } catch (error) {
      console.error("Erro ao adicionar XP:", error);
    }
  };

  const checkChallengeProgress = async (
    type: DailyChallenge["challenge_type"],
    value: number
  ) => {
    const challenge = challenges.find(
      (c) => c.challenge_type === type && !c.completed
    );

    if (challenge) {
      await updateChallengeProgress(challenge.id, value);
    }
  };

  return {
    challenges,
    loading,
    updateChallengeProgress,
    checkChallengeProgress,
  };
};
