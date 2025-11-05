import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  total_xp: number;
  current_streak: number;
  chords_mastered: number;
  total_practice_days: number;
  weekly_xp: number;
  monthly_xp: number;
  rank?: number;
}

export type LeaderboardType = "total" | "weekly" | "monthly" | "streak";

export const useLeaderboard = (type: LeaderboardType = "total") => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let orderBy = "total_xp";
      if (type === "weekly") orderBy = "weekly_xp";
      else if (type === "monthly") orderBy = "monthly_xp";
      else if (type === "streak") orderBy = "current_streak";

      const { data, error } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .order(orderBy, { ascending: false })
        .limit(100);

      if (error) throw error;

      const rankedEntries = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setEntries(rankedEntries);

      // Encontrar rank do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const myEntry = rankedEntries.find((e) => e.user_id === user.id);
        setMyRank(myEntry?.rank || null);
      }
    } catch (error) {
      console.error("Erro ao carregar leaderboard:", error);
      toast.error("Erro ao carregar ranking");
    } finally {
      setLoading(false);
    }
  };

  const updateMyEntry = async (
    username: string,
    totalXp: number,
    currentStreak: number,
    chordsMastered: number,
    totalPracticeDays: number,
    weeklyXp: number,
    monthlyXp: number
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase.rpc("update_leaderboard_entry", {
        p_user_id: user.id,
        p_username: username,
        p_total_xp: totalXp,
        p_current_streak: currentStreak,
        p_chords_mastered: chordsMastered,
        p_total_practice_days: totalPracticeDays,
        p_weekly_xp: weeklyXp,
        p_monthly_xp: monthlyXp,
      });

      if (error) throw error;

      await loadLeaderboard();
    } catch (error) {
      console.error("Erro ao atualizar entrada do leaderboard:", error);
    }
  };

  return {
    entries,
    loading,
    myRank,
    updateMyEntry,
    refresh: loadLeaderboard,
  };
};
