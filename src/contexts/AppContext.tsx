import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  leftHanded: boolean;
  setLeftHanded: (value: boolean) => void;
  favorites: string[];
  toggleFavorite: (chordId: string) => void;
  isFavorite: (chordId: string) => boolean;
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

  useEffect(() => {
    localStorage.setItem("leftHanded", JSON.stringify(leftHanded));
  }, [leftHanded]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (chordId: string) => {
    setFavorites((prev) =>
      prev.includes(chordId)
        ? prev.filter((id) => id !== chordId)
        : [...prev, chordId]
    );
  };

  const isFavorite = (chordId: string) => favorites.includes(chordId);

  return (
    <AppContext.Provider
      value={{ leftHanded, setLeftHanded, favorites, toggleFavorite, isFavorite }}
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
