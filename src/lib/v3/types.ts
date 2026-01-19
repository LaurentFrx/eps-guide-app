export type TrainingTheme = "PUISSANCE" | "ENDURANCE_FORCE" | "VOLUME";
export type Level = "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
export type Equipment = "AUCUN" | "HALTERES" | "MACHINES" | "BARRE";

export type UserProfile = {
  id: string;
  pseudo: string;
  theme: TrainingTheme;
  level: Level;
  equipment: Equipment[];
  createdAt: string;
  onboardingDone: boolean;
  xp: number;
  badges: string[];
  streak: { current: number; best: number; lastSessionDate?: string };
};

export type Exercise = {
  id: string;
  name: string;
  muscles: string[];
  equipment: Equipment[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  compatibleThemes: TrainingTheme[];
  technique: { cues: string[]; safety: string[]; commonMistakes: string[] };
  media: { image?: string; video?: string };
  paramsByTheme: {
    PUISSANCE: {
      setsRange: [number, number];
      repsRange: [number, number];
      restSecRange: [number, number];
      intensityHint: string;
    };
    ENDURANCE_FORCE: {
      setsRange: [number, number];
      repsRange: [number, number];
      restSecRange: [number, number];
      intensityHint: string;
    };
    VOLUME: {
      setsRange: [number, number];
      repsRange: [number, number];
      restSecRange: [number, number];
      intensityHint: string;
    };
  };
};

export type SessionItem = {
  exerciseId: string;
  order: number;
  planned: { sets: number; reps: number; restSec: number; loadKg?: number };
  performed?: {
    setsDone: number;
    repsDone: number[];
    loadKg?: number;
    rpe?: number;
    notes?: string;
  };
};

export type SessionPlan = {
  id: string;
  title: string;
  theme: TrainingTheme;
  status: "PLANIFIEE" | "TERMINEE";
  plannedAt?: string;
  startedAt?: string;
  endedAt?: string;
  items: SessionItem[];
  rpeGlobal?: number;
  fatigue?: number;
  notes?: string;
};

export type KnowledgeCard = {
  id: string;
  category: "Anatomie" | "Méthodes" | "Nutrition" | "Récupération" | "Sécurité";
  title: string;
  contentMd: string;
  relatedExerciseIds?: string[];
};

export type Quiz = {
  id: string;
  cardId: string;
  questions: {
    q: string;
    choices: string[];
    answerIndex: number;
    explanation: string;
  }[];
};

export type CoachFeedback = {
  id: string;
  fromUserPseudo: string;
  toUserPseudo: string;
  sessionId: string;
  checklist: { label: string; value: boolean }[];
  comment: string;
  createdAt: string;
};

export type UserObjectives = {
  main: string;
  shortTerm: string;
  midTerm: string;
  longTerm: string;
};
