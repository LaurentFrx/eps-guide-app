"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type GuideBookmark = {
  route: string;
  page: number;
  title: string;
  accent?: string;
};

const STORAGE_KEY = "eps-guide:guide-bookmarks";

const normalizeRoute = (route: string) =>
  route.trim().replace(/\/+$/, "").toLowerCase();

const readBookmarks = (): GuideBookmark[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .map((item) => ({
        route: normalizeRoute(String(item.route ?? "")),
        page: Number(item.page ?? 1),
        title: String(item.title ?? "Guide"),
        accent: item.accent ? String(item.accent) : undefined,
      }))
      .filter((item) => item.route);
    return normalized;
  } catch {
    return [];
  }
};

const writeBookmarks = (bookmarks: GuideBookmark[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
};

export const useGuideBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<GuideBookmark[]>(() =>
    readBookmarks()
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setBookmarks(readBookmarks());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const bookmarksByRoute = useMemo(() => {
    return new Map(bookmarks.map((item) => [normalizeRoute(item.route), item]));
  }, [bookmarks]);

  const saveBookmark = useCallback((bookmark: GuideBookmark) => {
    setBookmarks((prev) => {
      const route = normalizeRoute(bookmark.route);
      const next = prev.filter((item) => normalizeRoute(item.route) !== route);
      const payload = { ...bookmark, route };
      const updated = [payload, ...next];
      writeBookmarks(updated);
      return updated;
    });
  }, []);

  const removeBookmark = useCallback((route: string) => {
    setBookmarks((prev) => {
      const normalized = normalizeRoute(route);
      const next = prev.filter((item) => normalizeRoute(item.route) !== normalized);
      writeBookmarks(next);
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const isBookmarked = useCallback(
    (route: string) => bookmarksByRoute.has(normalizeRoute(route)),
    [bookmarksByRoute]
  );

  return {
    bookmarks,
    saveBookmark,
    removeBookmark,
    clearBookmarks,
    isBookmarked,
  };
};
