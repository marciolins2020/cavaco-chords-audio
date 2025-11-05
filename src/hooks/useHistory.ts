import { useState, useEffect } from "react";

export interface HistoryEntry {
  chordId: string;
  timestamp: Date;
  context: "search" | "practice" | "identifier" | "browse";
}

const MAX_HISTORY_ITEMS = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem("rzd_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Converter strings de data de volta para objetos Date
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

  useEffect(() => {
    localStorage.setItem("rzd_history", JSON.stringify(history));
  }, [history]);

  const addToHistory = (
    chordId: string,
    context: HistoryEntry["context"] = "browse"
  ) => {
    setHistory((prev) => {
      // Remover entrada anterior do mesmo acorde
      const filtered = prev.filter((entry) => entry.chordId !== chordId);
      
      // Adicionar no início
      const newHistory = [
        { chordId, timestamp: new Date(), context },
        ...filtered,
      ];
      
      // Manter apenas os últimos MAX_HISTORY_ITEMS
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("rzd_history");
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
