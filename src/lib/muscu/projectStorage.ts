import { PROJETS, type Projet } from "@/lib/muscu/types";

const STORAGE_KEY = "eps:muscu:project:v1";

const safeLocalStorageGet = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
};

const safeLocalStorageRemove = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
};

export const readStoredProject = (): Projet | null => {
  const raw = safeLocalStorageGet(STORAGE_KEY);
  if (raw && PROJETS.includes(raw as Projet)) {
    return raw as Projet;
  }
  return null;
};

export const writeStoredProject = (project: Projet | null) => {
  if (project) {
    safeLocalStorageSet(STORAGE_KEY, project);
  } else {
    safeLocalStorageRemove(STORAGE_KEY);
  }
};

export const subscribeStoredProject = (cb: (project: Projet | null) => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cb(readStoredProject());
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};
