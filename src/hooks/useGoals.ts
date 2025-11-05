import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PracticeGoal {
  id: string;
  user_id: string;
  goal_type: "daily_time" | "weekly_chords" | "daily_chords" | "weekly_sessions";
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useGoals = (userId: string | undefined) => {
  const [goals, setGoals] = useState<PracticeGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadGoals();
      subscribeToGoals();
    }
  }, [userId]);

  const loadGoals = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("practice_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals((data || []) as PracticeGoal[]);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      toast.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToGoals = () => {
    const channel = supabase
      .channel("practice_goals_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "practice_goals",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createGoal = async (
    goalType: PracticeGoal["goal_type"],
    targetValue: number,
    endDate?: Date
  ) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("practice_goals")
        .insert({
          user_id: userId,
          goal_type: goalType,
          target_value: targetValue,
          end_date: endDate?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Meta criada com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      toast.error("Erro ao criar meta");
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const completed = newValue >= goal.target_value;

      const { error } = await supabase
        .from("practice_goals")
        .update({
          current_value: newValue,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", goalId);

      if (error) throw error;

      if (completed && !goal.completed) {
        toast.success("🎉 Meta concluída! Parabéns!");
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("practice_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
      toast.success("Meta removida");
    } catch (error) {
      console.error("Erro ao deletar meta:", error);
      toast.error("Erro ao remover meta");
    }
  };

  const toggleGoalActive = async (goalId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("practice_goals")
        .update({ is_active: isActive })
        .eq("id", goalId);

      if (error) throw error;
      toast.success(isActive ? "Meta ativada" : "Meta pausada");
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      toast.error("Erro ao atualizar meta");
    }
  };

  return {
    goals,
    loading,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    toggleGoalActive,
  };
};
