import type { CoachFeedback, SessionPlan, UserObjectives, UserProfile } from "@/lib/v3/types";

const VERSION_KEY = "epsmuscu:v3:version";
const PROFILE_KEY = "epsmuscu:v3:profile";
const SESSIONS_KEY = "epsmuscu:v3:sessions";
const OBJECTIVES_KEY = "epsmuscu:v3:objectives";
const FEEDBACKS_KEY = "epsmuscu:v3:feedbacks";
const CURRENT_VERSION = "1";

const isBrowser = () => typeof window !== "undefined";

const readJson = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const defaultObjectives: UserObjectives = {
  main: "",
  shortTerm: "",
  midTerm: "",
  longTerm: "",
};

export const initV3Storage = () => {
  if (!isBrowser()) return;
  const version = window.localStorage.getItem(VERSION_KEY);
  if (!version) {
    window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
};

export const getProfile = (): UserProfile | null => {
  initV3Storage();
  return readJson<UserProfile | null>(PROFILE_KEY, null);
};

export const saveProfile = (profile: UserProfile) => {
  initV3Storage();
  writeJson(PROFILE_KEY, profile);
};

export const listSessions = (): SessionPlan[] => {
  initV3Storage();
  return readJson<SessionPlan[]>(SESSIONS_KEY, []);
};

export const saveSessions = (sessions: SessionPlan[]) => {
  initV3Storage();
  writeJson(SESSIONS_KEY, sessions);
};

export const saveSession = (session: SessionPlan) => {
  const sessions = listSessions();
  const index = sessions.findIndex((item) => item.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  saveSessions(sessions);
};

export const getObjectives = (): UserObjectives => {
  initV3Storage();
  return readJson<UserObjectives>(OBJECTIVES_KEY, defaultObjectives);
};

export const saveObjectives = (objectives: UserObjectives) => {
  initV3Storage();
  writeJson(OBJECTIVES_KEY, objectives);
};

export const listCoachFeedbacks = (): CoachFeedback[] => {
  initV3Storage();
  return readJson<CoachFeedback[]>(FEEDBACKS_KEY, []);
};

export const saveCoachFeedback = (feedback: CoachFeedback) => {
  const feedbacks = listCoachFeedbacks();
  feedbacks.unshift(feedback);
  writeJson(FEEDBACKS_KEY, feedbacks);
};

export const resetV3Storage = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.localStorage.removeItem(SESSIONS_KEY);
  window.localStorage.removeItem(OBJECTIVES_KEY);
  window.localStorage.removeItem(FEEDBACKS_KEY);
  window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
};

export type SyncPayload = {
  profile: UserProfile | null;
  sessions: SessionPlan[];
  objectives: UserObjectives;
  coachFeedbacks: CoachFeedback[];
};

export type SyncAdapter = {
  push: (payload: SyncPayload) => Promise<void>;
  pull: () => Promise<Partial<SyncPayload>>;
};

export const noopSyncAdapter: SyncAdapter = {
  push: async () => {},
  pull: async () => ({}),
};
