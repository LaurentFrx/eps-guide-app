export type SessionId = "S1" | "S2" | "S3" | "S4" | "S5";

export type SessionBase = {
  id: SessionId;
  title: string;
  subtitle: string;
  chips: string[];
};

export const SESSION_IDS: SessionId[] = ["S1", "S2", "S3", "S4", "S5"];

export const SESSIONS_BASE: Record<SessionId, SessionBase> = {
  S1: {
    id: "S1",
    title: "Gainage statique",
    subtitle: "Stabilité posturale - alignement - respiration",
    chips: ["Isométrie", "Posture", "Ceinture abdominale"],
  },
  S2: {
    id: "S2",
    title: "Gainage dynamique & abdominaux",
    subtitle: "Stabilité en mouvement - anti-rotation - contrôle lombo-pelvien",
    chips: ["Dynamique", "Anti-rotation", "Contrôle bassin"],
  },
  S3: {
    id: "S3",
    title: "Haut du corps - poussée & tirage",
    subtitle: "Pectoraux/Triceps - Dos/Biceps - Épaules",
    chips: ["Poussée", "Tirage", "Stabilité scapulaire"],
  },
  S4: {
    id: "S4",
    title: "Bas du corps - squat, fentes & hanche",
    subtitle: "Quadriceps - fessiers - ischios - stabilité",
    chips: ["Squat", "Unilatéral", "Chaîne postérieure"],
  },
  S5: {
    id: "S5",
    title: "Exercices fonctionnels & composés",
    subtitle: "Mouvements globaux - intensité - conditionnement",
    chips: ["Polyarticulaire", "Intensité", "Coordination"],
  },
};
