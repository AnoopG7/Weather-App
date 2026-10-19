import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (city: string) => void;
  removeFavorite: (city: string) => void;
  isFavorite: (city: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "weather_forecast_favorite_cities";
const DEFAULT_FAVORITES = ["Delhi", "Mumbai", "Bengaluru"];

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_FAVORITES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const addFavorite = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setFavorites((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const removeFavorite = (city: string) => {
    setFavorites((prev) => prev.filter((c) => c.toLowerCase() !== city.toLowerCase().trim()));
  };

  const isFavorite = (city: string) => {
    return favorites.some((c) => c.toLowerCase() === city.toLowerCase().trim());
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
