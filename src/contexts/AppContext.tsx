import React, { createContext, useContext, useState, useEffect } from "react";
import { useHistory, HistoryEntry } from "@/hooks/useHistory";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const { user } = useAuth();
  const { history, addToHistory, clearHistory, getRecentChords } = useHistory();

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
