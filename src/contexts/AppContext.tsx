import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { ChordDatabase, DEFAULT_DB, mergeChordDatabases } from "@/constants/chordDatabase";

interface AppContextType {
  leftHanded: boolean;
  setLeftHanded: (value: boolean) => void;
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

  useEffect(() => {
    localStorage.setItem("leftHanded", JSON.stringify(leftHanded));
  }, [leftHanded]);

  const importChordDatabase = (customDB: ChordDatabase) => {
    const merged = mergeChordDatabases(DEFAULT_DB, customDB);
    setChordDatabase(merged);
    localStorage.setItem("customChordDatabase", JSON.stringify(customDB));
    toast.success("Banco de acordes atualizado!", {
      description: `${customDB.chords.length} acordes importados`,
    });
  };

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
