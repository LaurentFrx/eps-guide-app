export type MuscuZone =
  | "Abdos"
  | "Dorsaux"
  | "Membres supérieurs"
  | "Membres inférieurs"
  | "Crosstraining";

export type Projet = "Tonification" | "Volume" | "Puissance";

export type Status = "draft" | "approved";

export type BaseMeta = {
  id: string;
  title: string;
  updatedAtISO: string;
  status: Status;
};

export type MuscuExercise = BaseMeta & {
  zone: MuscuZone;
  targetMuscles: string[];
  setup: string[];
  cues: string[];
  breathing: string[];
  mistakes: string[];
  safety: string[];
  projets: Projet[];
  videoUrl?: string;
  posterSrc?: string;
  equipment?: string[];
};

export type Stretch = BaseMeta & {
  target: string[];
  cues: string[];
  safety: string[];
  videoUrl?: string;
  posterSrc?: string;
};

export type KnowledgeSection =
  | "Projets"
  | "Paramètres"
  | "Méthodes"
  | "Anatomie"
  | "Contractions";

export type KnowledgeTheme = BaseMeta & {
  section: KnowledgeSection;
  summary: string;
  bullets: string[];
  imageSrc?: string;
  alt?: string;
  relatedExerciseIds?: string[];
};

export type EvaluationProfileName = "Evaluation";

export type EvaluationProfile = BaseMeta & {
  profile: EvaluationProfileName;
  sections: { title: string; bullets: string[] }[];
  infographics?: string[];
};

export type Infographic = {
  id: string;
  title: string;
  src: string;
  alt: string;
};

export const MUSCU_ZONES: MuscuZone[] = [
  "Abdos",
  "Dorsaux",
  "Membres supérieurs",
  "Membres inférieurs",
  "Crosstraining",
];

export const PROJETS: Projet[] = ["Tonification", "Volume", "Puissance"];

export const KNOWLEDGE_SECTIONS: KnowledgeSection[] = [
  "Projets",
  "Paramètres",
  "Méthodes",
  "Anatomie",
  "Contractions",
];

export const EVALUATION_PROFILES: EvaluationProfileName[] = ["Evaluation"];

