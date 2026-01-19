"use client";

import type { ReactNode } from "react";
import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  CoachFeedback,
  Exercise,
  SessionItem,
  SessionPlan,
  TrainingTheme,
  UserObjectives,
  UserProfile,
} from "@/lib/v3/types";
import { exercisesSeed } from "@/lib/v3/seed/exercises";
import { knowledgeSeed } from "@/lib/v3/seed/knowledge";
import { quizzesSeed } from "@/lib/v3/seed/quizzes";
import {
  defaultObjectives,
  getObjectives,
  getProfile,
  listCoachFeedbacks,
  listSessions,
  noopSyncAdapter,
  resetV3Storage,
  saveCoachFeedback,
  saveObjectives,
  saveProfile,
  saveSessions,
  type SyncPayload,
} from "@/lib/v3/storage";

type ConsistencyStatus = "green" | "orange" | "red";

type AflProgress = {
  afl1: { score: number; max: number };
  afl2: { score: number; max: number };
  afl3: { score: number; max: number };
};

type V3Store = {
  ready: boolean;
  profile: UserProfile | null;
  sessions: SessionPlan[];
  exercises: Exercise[];
  knowledge: typeof knowledgeSeed;
  quizzes: typeof quizzesSeed;
  coachFeedbacks: CoachFeedback[];
  objectives: UserObjectives;
  adviceOfDay: string;
  nextPlannedSession: SessionPlan | null;
  lastSessions: (count?: number) => SessionPlan[];
  aflProgress: AflProgress;
  getItemStatus: (item: SessionItem, theme: TrainingTheme) => ConsistencyStatus;
  getSessionStatus: (session: SessionPlan) => ConsistencyStatus;
  completeOnboarding: (profile: UserProfile) => void;
  createSessionFromTemplate: (
    theme: TrainingTheme,
    level: UserProfile["level"],
    plannedAt?: string
  ) => SessionPlan;
  createCustomSession: (payload?: Partial<SessionPlan>) => SessionPlan;
  startSession: (id: string) => void;
  updateDuringSession: (
    sessionId: string,
    exerciseId: string,
    update: {
      planned?: Partial<SessionItem["planned"]>;
      performed?: SessionItem["performed"];
    }
  ) => void;
  completeSession: (id: string, rpeGlobal: number, fatigue: number, notes: string) => void;
  updateSessionNotes: (id: string, notes: string) => void;
  updateObjectives: (next: UserObjectives) => void;
  addCoachFeedback: (feedback: CoachFeedback) => void;
  addBadge: (badge: string) => void;
  awardXP: (amount: number) => void;
  resetV3: () => void;
};

const adviceList = [
  "Priorise une technique propre avant d’augmenter la charge.",
  "Note tes charges et ton ressenti après chaque séance.",
  "Un bon gainage améliore toutes les performances.",
  "Hydrate-toi avant la séance pour rester efficace.",
  "Prépare tes séances à l’avance pour gagner du temps.",
];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isoNow = () => new Date().toISOString();

const average = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const pickMid = (range: [number, number]) =>
  Math.round((range[0] + range[1]) / 2);

const getDailyAdvice = () => {
  const index = new Date().getDate() % adviceList.length;
  return adviceList[index];
};

const getStreak = (profile: UserProfile, endedAt: string) => {
  const prevDate = profile.streak.lastSessionDate;
  const today = new Date(endedAt);
  if (!prevDate) {
    return { current: 1, best: Math.max(profile.streak.best, 1), lastSessionDate: endedAt };
  }
  const last = new Date(prevDate);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);
  const current = diffDays === 1 ? profile.streak.current + 1 : 1;
  const best = Math.max(profile.streak.best, current);
  return { current, best, lastSessionDate: endedAt };
};

const V3StoreContext = createContext<V3Store | null>(null);

export function V3StoreProvider({ children }: { children: ReactNode }) {
  const [ready] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(() => getProfile());
  const [sessions, setSessions] = useState<SessionPlan[]>(() => listSessions());
  const [coachFeedbacks, setCoachFeedbacks] = useState<CoachFeedback[]>(() =>
    listCoachFeedbacks()
  );
  const [objectives, setObjectivesState] = useState<UserObjectives>(() =>
    getObjectives()
  );
  const [adviceOfDay] = useState(() => getDailyAdvice());

  const exercises = useMemo(() => exercisesSeed, []);
  const knowledge = useMemo(() => knowledgeSeed, []);
  const quizzes = useMemo(() => quizzesSeed, []);
  const exerciseMap = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  const sync = useCallback(async (payload: SyncPayload) => {
    await noopSyncAdapter.push(payload);
  }, []);

  const getItemStatus = useCallback(
    (item: SessionItem, theme: TrainingTheme): ConsistencyStatus => {
      const exercise = exerciseMap.get(item.exerciseId);
      if (!exercise) return "orange";
      const params = exercise.paramsByTheme[theme];
      const plannedSets = item.performed?.setsDone ?? item.planned.sets;
      const plannedReps = item.performed?.repsDone?.length
        ? Math.round(average(item.performed.repsDone))
        : item.planned.reps;
      const plannedRest = item.planned.restSec;

      const statusForValue = (value: number, range: [number, number]) => {
        const [min, max] = range;
        if (value < min * 0.5 || value > max * 2) return "red";
        if (value < min || value > max) return "orange";
        return "green";
      };

      const statuses: ConsistencyStatus[] = [
        statusForValue(plannedSets, params.setsRange),
        statusForValue(plannedReps, params.repsRange),
        statusForValue(plannedRest, params.restSecRange),
      ];

      if (statuses.includes("red")) return "red";
      if (statuses.includes("orange")) return "orange";
      return "green";
    },
    [exerciseMap]
  );

  const getSessionStatus = useCallback(
    (session: SessionPlan): ConsistencyStatus => {
      if (!session.items.length) return "orange";
      const statuses = session.items.map((item) => getItemStatus(item, session.theme));
      if (statuses.includes("red")) return "red";
      if (statuses.includes("orange")) return "orange";
      return "green";
    },
    [getItemStatus]
  );

  const completeOnboarding = useCallback(
    (nextProfile: UserProfile) => {
      setProfile(nextProfile);
      saveProfile(nextProfile);
      sync({ profile: nextProfile, sessions, objectives, coachFeedbacks });
    },
    [coachFeedbacks, objectives, sessions, sync]
  );

  const createSessionItems = useCallback(
    (theme: TrainingTheme, exerciseIds: string[]) => {
      return exerciseIds.map((id, index) => {
        const exercise = exerciseMap.get(id);
        if (!exercise) {
          return {
            exerciseId: id,
            order: index + 1,
            planned: { sets: 3, reps: 8, restSec: 90 },
          };
        }
        const params = exercise.paramsByTheme[theme];
        return {
          exerciseId: id,
          order: index + 1,
          planned: {
            sets: pickMid(params.setsRange),
            reps: pickMid(params.repsRange),
            restSec: pickMid(params.restSecRange),
          },
        };
      });
    },
    [exerciseMap]
  );

  const createSessionFromTemplate = useCallback(
    (theme: TrainingTheme, level: UserProfile["level"], plannedAt?: string) => {
      const themeExercises = exercises.filter((exercise) =>
        exercise.compatibleThemes.includes(theme)
      );
      const difficultyCap = level === "DEBUTANT" ? 2 : level === "INTERMEDIAIRE" ? 3 : 5;
      const filtered = themeExercises.filter((exercise) => exercise.difficulty <= difficultyCap);
      const pool = filtered.length ? filtered : themeExercises;
      const slotIndex =
        sessions.filter((session) => session.title.startsWith("Programme S")).length % 8;
      const picks = Array.from({ length: 4 }, (_, i) => pool[(slotIndex + i) % pool.length]);
      const items = createSessionItems(theme, picks.map((item) => item.id));
      const session: SessionPlan = {
        id: createId(),
        title: `Programme S${slotIndex + 1}`,
        theme,
        status: "PLANIFIEE",
        plannedAt,
        items,
      };
      const nextSessions = [session, ...sessions];
      setSessions(nextSessions);
      saveSessions(nextSessions);
      sync({ profile, sessions: nextSessions, objectives, coachFeedbacks });
      return session;
    },
    [coachFeedbacks, createSessionItems, exercises, objectives, profile, sessions, sync]
  );

  const createCustomSession = useCallback(
    (payload?: Partial<SessionPlan>) => {
      const session: SessionPlan = {
        id: createId(),
        title: payload?.title ?? "Séance personnalisée",
        theme: payload?.theme ?? profile?.theme ?? "VOLUME",
        status: payload?.status ?? "PLANIFIEE",
        plannedAt: payload?.plannedAt,
        items: payload?.items ?? [],
        rpeGlobal: payload?.rpeGlobal,
        fatigue: payload?.fatigue,
        notes: payload?.notes,
      };
      const nextSessions = [session, ...sessions];
      setSessions(nextSessions);
      saveSessions(nextSessions);
      sync({ profile, sessions: nextSessions, objectives, coachFeedbacks });
      return session;
    },
    [coachFeedbacks, objectives, profile, sessions, sync]
  );

  const startSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.map((session) =>
          session.id === id && !session.startedAt
            ? { ...session, startedAt: isoNow() }
            : session
        );
        saveSessions(next);
        sync({ profile, sessions: next, objectives, coachFeedbacks });
        return next;
      });
    },
    [coachFeedbacks, objectives, profile, sync]
  );

  const updateDuringSession = useCallback(
    (
      sessionId: string,
      exerciseId: string,
      update: {
        planned?: Partial<SessionItem["planned"]>;
        performed?: SessionItem["performed"];
      }
    ) => {
      setSessions((prev) => {
        const next = prev.map((session) => {
          if (session.id !== sessionId) return session;
          const items = session.items.map((item) => {
            if (item.exerciseId !== exerciseId) return item;
            return {
              ...item,
              planned: { ...item.planned, ...update.planned },
              performed: update.performed ?? item.performed,
            };
          });
          return { ...session, items };
        });
        saveSessions(next);
        sync({ profile, sessions: next, objectives, coachFeedbacks });
        return next;
      });
    },
    [coachFeedbacks, objectives, profile, sync]
  );

  const completeSession = useCallback(
    (id: string, rpeGlobal: number, fatigue: number, notes: string) => {
      const endedAt = isoNow();
      setSessions((prev) => {
        const next = prev.map((session) => {
          if (session.id !== id) return session;
          const nextSession: SessionPlan = {
            ...session,
            status: "TERMINEE",
            endedAt,
            rpeGlobal: clamp(rpeGlobal, 1, 10),
            fatigue: clamp(fatigue, 1, 10),
            notes,
          };
          return nextSession;
        });
        saveSessions(next);
        sync({ profile, sessions: next, objectives, coachFeedbacks });
        return next;
      });
      if (profile) {
        const nextProfile = {
          ...profile,
          xp: profile.xp + 10,
          streak: getStreak(profile, endedAt),
        };
        setProfile(nextProfile);
        saveProfile(nextProfile);
      }
    },
    [coachFeedbacks, objectives, profile, sync]
  );

  const updateSessionNotes = useCallback(
    (id: string, notes: string) => {
      setSessions((prev) => {
        const next = prev.map((session) =>
          session.id === id ? { ...session, notes } : session
        );
        saveSessions(next);
        sync({ profile, sessions: next, objectives, coachFeedbacks });
        return next;
      });
    },
    [coachFeedbacks, objectives, profile, sync]
  );

  const updateObjectives = useCallback(
    (nextObjectives: UserObjectives) => {
      setObjectivesState(nextObjectives);
      saveObjectives(nextObjectives);
      sync({ profile, sessions, objectives: nextObjectives, coachFeedbacks });
    },
    [coachFeedbacks, profile, sessions, sync]
  );

  const addCoachFeedback = useCallback(
    (feedback: CoachFeedback) => {
      setCoachFeedbacks((prev) => {
        const next = [feedback, ...prev];
        saveCoachFeedback(feedback);
        sync({ profile, sessions, objectives, coachFeedbacks: next });
        return next;
      });
    },
    [objectives, profile, sessions, sync]
  );

  const addBadge = useCallback(
    (badge: string) => {
      setProfile((prev) => {
        if (!prev) return prev;
        if (prev.badges.includes(badge)) return prev;
        const next = { ...prev, badges: [...prev.badges, badge] };
        saveProfile(next);
        sync({ profile: next, sessions, objectives, coachFeedbacks });
        return next;
      });
    },
    [coachFeedbacks, objectives, sessions, sync]
  );

  const awardXP = useCallback(
    (amount: number) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, xp: prev.xp + amount };
        saveProfile(next);
        sync({ profile: next, sessions, objectives, coachFeedbacks });
        return next;
      });
    },
    [coachFeedbacks, objectives, sessions, sync]
  );

  const resetV3 = useCallback(() => {
    resetV3Storage();
    setProfile(null);
    setSessions([]);
    setObjectivesState(defaultObjectives);
    setCoachFeedbacks([]);
  }, []);

  const nextPlannedSession = useMemo(() => {
    const planned = sessions.filter((session) => session.status === "PLANIFIEE");
    if (!planned.length) return null;
    return planned.sort((a, b) => (a.plannedAt ?? "").localeCompare(b.plannedAt ?? ""))[0];
  }, [sessions]);

  const lastSessions = useCallback(
    (count = 3) => {
      const done = sessions.filter((session) => session.status === "TERMINEE");
      return done
        .sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? ""))
        .slice(0, count);
    },
    [sessions]
  );

  const aflProgress = useMemo(() => {
    const afl1 = { score: 0, max: 12 };
    const afl2 = { score: 0, max: 4 };
    const afl3 = { score: 0, max: 4 };

    if (profile?.theme && objectives.main.trim()) {
      afl1.score += 4;
    }

    if (profile?.theme) {
      const themedSessions = sessions.filter(
        (session) => session.theme === profile.theme
      );
      if (themedSessions.length >= 4) {
        afl1.score += 4;
      }
      const consistentDone = themedSessions.filter(
        (session) =>
          session.status === "TERMINEE" && getSessionStatus(session) !== "red"
      );
      if (consistentDone.length >= 2) {
        afl1.score += 4;
      }
    }

    const doneSessions = sessions.filter((session) => session.status === "TERMINEE");
    if (doneSessions.length >= 4) {
      afl2.score += 2;
    }
    const withRpe = doneSessions.filter((session) => typeof session.rpeGlobal === "number");
    const hasReflexion = doneSessions.some((session) => session.notes?.trim());
    if (withRpe.length >= 3 && hasReflexion) {
      afl2.score += 2;
    }

    if (profile) {
      const given = coachFeedbacks.filter(
        (feedback) => feedback.fromUserPseudo === profile.pseudo
      );
      const received = coachFeedbacks.filter(
        (feedback) => feedback.toUserPseudo === profile.pseudo
      );
      if (given.length >= 1) afl3.score += 2;
      if (received.length >= 1) afl3.score += 2;
    }

    return { afl1, afl2, afl3 };
  }, [coachFeedbacks, getSessionStatus, objectives.main, profile, sessions]);

  const value: V3Store = {
    ready,
    profile,
    sessions,
    exercises,
    knowledge,
    quizzes,
    coachFeedbacks,
    objectives,
    adviceOfDay,
    nextPlannedSession,
    lastSessions,
    aflProgress,
    getItemStatus,
    getSessionStatus,
    completeOnboarding,
    createSessionFromTemplate,
    createCustomSession,
    startSession,
    updateDuringSession,
    completeSession,
    updateSessionNotes,
    updateObjectives,
    addCoachFeedback,
    addBadge,
    awardXP,
    resetV3,
  };

  return createElement(V3StoreContext.Provider, { value }, children);
}

export function useV3Store() {
  const ctx = useContext(V3StoreContext);
  if (!ctx) {
    throw new Error("useV3Store must be used within V3StoreProvider");
  }
  return ctx;
}
