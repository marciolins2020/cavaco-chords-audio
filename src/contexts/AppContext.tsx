import React, { createContext, useContext, useState, useEffect } from "react";
import { useHistory, HistoryEntry } from "@/hooks/useHistory";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChordDatabase, DEFAULT_DB, mergeChordDatabases } from "@/constants/chordDatabase";

interface AppContextType {
  leftHanded: boolean;
  setLeftHanded: (value: boolean) => void;
  favorites: string[];
  toggleFavorite: (chordId: string) => void;
  isFavorite: (chordId: string) => boolean;
  history: HistoryEntry[];
  addToHistory: (chordId: string, context?: HistoryEntry["context"]) => void;
  clearHistory: () => void;
  getRecentChords: (limit?: number) => string[];
  chordDatabase: ChordDatabase;
  importChordDatabase: (database: ChordDatabase) => void;
  resetChordDatabase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leftHanded, setLeftHanded] = useState(() => {
    const saved = localStorage.getItem("leftHanded");
    return saved ? JSON.parse(saved) : false;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Gerenciamento do banco de dados de acordes
  const [chordDatabase, setChordDatabase] = useState<ChordDatabase>(() => {
    const saved = localStorage.getItem("customChordDatabase");
    if (saved) {
      try {
        const customDB = JSON.parse(saved);
        return mergeChordDatabases(DEFAULT_DB, customDB);
      } catch (error) {
        console.error("Erro ao carregar banco customizado:", error);
        return DEFAULT_DB;
      }
    }
    return DEFAULT_DB;
  });

  const { user } = useAuth();
  const { history, addToHistory, clearHistory, getRecentChords } = useHistory(user?.id);

  useEffect(() => {
    localStorage.setItem("leftHanded", JSON.stringify(leftHanded));
  }, [leftHanded]);

  // Carregar favoritos do Supabase quando o usuário faz login
  useEffect(() => {
    if (user) {
      loadFavoritesFromSupabase();
    }
  }, [user]);

  // Sincronizar favoritos locais com Supabase no login
  const loadFavoritesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("chord_id")
        .eq("user_id", user!.id);

      if (error) throw error;

      const supabaseFavorites = data.map((f) => f.chord_id);
      
      // Mesclar favoritos locais com os do Supabase
      const localFavorites = favorites;
      const merged = Array.from(new Set([...supabaseFavorites, ...localFavorites]));
      
      // Sincronizar favoritos locais que não estão no Supabase
      const toSync = localFavorites.filter((id) => !supabaseFavorites.includes(id));
      if (toSync.length > 0) {
        await Promise.all(
          toSync.map((chord_id) =>
            supabase.from("user_favorites").insert({ chord_id, user_id: user!.id })
          )
        );
      }

      setFavorites(merged);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
  };

  // Salvar favoritos no localStorage (modo offline)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const toggleFavorite = async (chordId: string) => {
    const isFav = favorites.includes(chordId);
    
    // Atualizar estado local imediatamente
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== chordId) : [...prev, chordId]
    );

    // Se logado, sincronizar com Supabase
    if (user) {
      try {
        if (isFav) {
          await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("chord_id", chordId);
        } else {
          await supabase
            .from("user_favorites")
            .insert({ chord_id: chordId, user_id: user.id });
        }
      } catch (error) {
        console.error("Erro ao sincronizar favorito:", error);
        toast.error("Erro ao salvar favorito");
        // Reverter em caso de erro
        setFavorites((prev) =>
          isFav ? [...prev, chordId] : prev.filter((id) => id !== chordId)
        );
      }
    }
  };

  const isFavorite = (chordId: string) => favorites.includes(chordId);

  // Importa um banco de dados de acordes customizado
  const importChordDatabase = (customDB: ChordDatabase) => {
    const merged = mergeChordDatabases(DEFAULT_DB, customDB);
    setChordDatabase(merged);
    localStorage.setItem("customChordDatabase", JSON.stringify(customDB));
    toast.success("Banco de acordes atualizado!", {
      description: `${customDB.chords.length} acordes importados`,
    });
  };

  // Reseta para o banco de dados padrão
  const resetChordDatabase = () => {
    setChordDatabase(DEFAULT_DB);
    localStorage.removeItem("customChordDatabase");
    toast.success("Banco de acordes restaurado para o padrão");
  };

  return (
    <AppContext.Provider
      value={{
        leftHanded,
        setLeftHanded,
        favorites,
        toggleFavorite,
        isFavorite,
        history,
        addToHistory,
        clearHistory,
        getRecentChords,
        chordDatabase,
        importChordDatabase,
        resetChordDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
