import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface HistoryEntry {
  chordId: string;
  timestamp: Date;
  context: "search" | "practice" | "identifier" | "browse";
}

const MAX_HISTORY_ITEMS = 50;

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem("rzd_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Carregar histórico do Supabase quando o usuário faz login
  useEffect(() => {
    if (user) {
      loadHistoryFromSupabase();
    }
  }, [user]);

  const loadHistoryFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from("user_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(MAX_HISTORY_ITEMS);

      if (error) throw error;

      const supabaseHistory = data.map((h) => ({
        chordId: h.chord_id,
        timestamp: new Date(h.created_at),
        context: h.context as HistoryEntry["context"],
      }));

      setHistory(supabaseHistory);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  // Salvar no localStorage apenas quando não logado
  useEffect(() => {
    if (!user) {
      localStorage.setItem("rzd_history", JSON.stringify(history));
    }
  }, [history, user]);

  const addToHistory = async (
    chordId: string,
    context: HistoryEntry["context"] = "browse"
  ) => {
    const newEntry = { chordId, timestamp: new Date(), context };
    
    setHistory((prev) => {
      const filtered = prev.filter((entry) => entry.chordId !== chordId);
      const newHistory = [newEntry, ...filtered];
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });

    // Se logado, salvar no Supabase
    if (user) {
      try {
        // Deletar entrada anterior do mesmo acorde
        await supabase
          .from("user_history")
          .delete()
          .eq("user_id", user.id)
          .eq("chord_id", chordId);

        // Inserir nova entrada
        await supabase.from("user_history").insert({
          user_id: user.id,
          chord_id: chordId,
          context,
        });
      } catch (error) {
        console.error("Erro ao salvar histórico:", error);
      }
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    localStorage.removeItem("rzd_history");

    // Se logado, limpar do Supabase também
    if (user) {
      try {
        await supabase
          .from("user_history")
          .delete()
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Erro ao limpar histórico:", error);
      }
    }
  };

  const getRecentChords = (limit: number = 10): string[] => {
    return history.slice(0, limit).map((entry) => entry.chordId);
  };

  return {
    history,
    addToHistory,
    clearHistory,
    getRecentChords,
  };
}
