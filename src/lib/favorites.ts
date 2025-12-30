"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eps-guide:favorites";

const normalizeCode = (code: string) => code.trim().toUpperCase();

const readFavorites = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const normalized = parsed
      .map((value) => String(value))
      .map(normalizeCode)
      .filter(Boolean);
    return Array.from(new Set(normalized));
  } catch {
    return [];
  }
};

const writeFavorites = (favorites: string[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setFavorites(readFavorites());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFavorite = useCallback((code: string) => {
    setFavorites((prev) => {
      const normalized = normalizeCode(code);
      const exists = prev.includes(normalized);
      const next = exists
        ? prev.filter((item) => item !== normalized)
        : [...prev, normalized];
      writeFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (code: string) => favoritesSet.has(normalizeCode(code)),
    [favoritesSet]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
};
