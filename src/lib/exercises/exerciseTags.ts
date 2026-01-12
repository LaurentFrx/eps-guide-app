import type { MuscuZone, Projet } from "@/lib/muscu/types";

export type Zone = MuscuZone;
export type ItemType = "Exercice" | "Étirement" | "Technique" | "Séance";

export type ExerciseTags = {
  zone?: Zone;
  type?: ItemType;
  projets?: Projet[];
  themes?: string[];
};

export const exerciseTagsByCode: Record<string, ExerciseTags> = {
  "S1-01": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Tonification"],
    themes: ["gainage", "stabilite"],
  },
  "S1-02": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Volume"],
    themes: ["gainage"],
  },
  "S1-03": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Tonification"],
    themes: ["lateraux"],
  },
  "S1-04": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Tonification"],
    themes: ["anti-rotation"],
  },
  "S1-05": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Volume"],
    themes: ["endurance"],
  },
  "S2-01": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Tonification"],
    themes: ["dynamique"],
  },
  "S2-02": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Volume"],
    themes: ["rotation"],
  },
  "S2-03": {
    zone: "Abdos",
    type: "Exercice",
    projets: ["Puissance"],
    themes: ["anti-extension"],
  },
  "S3-01": {
    zone: "Membres supérieurs",
    type: "Exercice",
    projets: ["Tonification"],
    themes: ["poussee"],
  },
  "S3-02": {
    zone: "Membres supérieurs",
    type: "Exercice",
    projets: ["Volume"],
    themes: ["poussee"],
  },
  "S4-01": {
    zone: "Membres inférieurs",
    type: "Exercice",
    projets: ["Volume"],
    themes: ["squat"],
  },
  "S4-02": {
    zone: "Membres inférieurs",
    type: "Exercice",
    projets: ["Tonification"],
    themes: ["fentes"],
  },
  "S5-01": {
    zone: "Crosstraining",
    type: "Exercice",
    projets: ["Tonification", "Puissance"],
    themes: ["cardio"],
  },
  "S5-02": {
    zone: "Crosstraining",
    type: "Exercice",
    projets: ["Tonification"],
    themes: ["circuit"],
  },
  "S5-03": {
    zone: "Crosstraining",
    type: "Exercice",
    projets: ["Puissance"],
    themes: ["explosif"],
  },
};
