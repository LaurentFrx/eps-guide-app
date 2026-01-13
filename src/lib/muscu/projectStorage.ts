import { PROJETS, type Projet } from "@/lib/muscu/types";

const STORAGE_KEY = "muscuProject";

export const readStoredProject = (): Projet | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && PROJETS.includes(raw as Projet)) {
    return raw as Projet;
  }
  return null;
};

export const writeStoredProject = (project: Projet | null) => {
  if (typeof window === "undefined") return;
  if (project) {
    window.localStorage.setItem(STORAGE_KEY, project);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};
