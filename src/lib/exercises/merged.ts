import "server-only";

import { unstable_cache } from "next/cache";
import { getAllExercisesRaw } from "@/lib/exercises/index";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { normalizeExerciseRecord, type ExerciseRecord } from "@/lib/exercises/schema";
import {
  getCustomExercise,
  getOverride,
  listCustomCodes,
} from "@/lib/admin/store";
import { isKvConfigured } from "@/lib/admin/config";
import { SESSIONS_EDITORIAL, SESSION_IDS, type SessionId } from "@/lib/editorial/sessions";
import { getExerciseHeroSrcOrFallback } from "@/lib/exerciseAssets";
import type {
  Exercise,
  ExerciseWithSession,
  Session,
} from "@/lib/exercise-data";

export type MergedExerciseRecord = ExerciseRecord & {
  source: "base" | "custom";
  hasOverride: boolean;
};

const EXERCISES_TAG = "exercises";

const toExerciseBase = (record: ExerciseRecord): Exercise => ({
  code: record.code,
  title: record.title,
  level: record.level,
  equipment: record.equipment,
  muscles: record.muscles,
  objective: record.objective,
  anatomy: record.anatomy,
  key_points: record.key_points,
  safety: record.safety,
  regress: record.regress,
  progress: record.progress,
  dosage: record.dosage,
  image: record.image ?? "/exercises/fallback.svg",
});

const getSessionNum = (code: string) => {
  const match = code.match(/^S([1-5])-/);
  return match ? Number(match[1]) : null;
};

const buildSessionBase = (id: SessionId) => ({
  id,
  title: SESSIONS_EDITORIAL[id].title,
  subtitle: SESSIONS_EDITORIAL[id].subtitle,
  chips: SESSIONS_EDITORIAL[id].chips,
  introMd: SESSIONS_EDITORIAL[id].introMd,
  accent: `var(--${id.toLowerCase()})`,
  heroImage: getExerciseHeroSrcOrFallback(`${id}-01`, `/exercises/${id}/hero.jpg`),
});

const listMergedRecordsInternal = async (): Promise<MergedExerciseRecord[]> => {
  const baseRecords = getAllExercisesRaw();

  if (!isKvConfigured()) {
    return baseRecords.map((record) => ({
      ...record,
      source: "base",
      hasOverride: false,
    }));
  }

  const customCodes = await listCustomCodes();
  const customRecords = (
    await Promise.all(customCodes.map((code) => getCustomExercise(code)))
  ).filter((record): record is ExerciseRecord => Boolean(record));

  const customMap = new Map(
    customRecords.map((record) => [normalizeExerciseCode(record.code), record])
  );

  const mergedBase = await Promise.all(
    baseRecords.map(async (record) => {
      const normalized = normalizeExerciseCode(record.code);
      if (customMap.has(normalized)) {
        return null;
      }
      const override = await getOverride(normalized);
      const merged = override
        ? normalizeExerciseRecord({ ...record, ...override, code: normalized })
        : record;
      return {
        ...merged,
        source: "base" as const,
        hasOverride: Boolean(override),
      };
    })
  );

  const mergedCustom = customRecords.map((record) => ({
    ...normalizeExerciseRecord(record),
    source: "custom" as const,
    hasOverride: false,
  }));

  type BaseMergedRecord = MergedExerciseRecord & { source: "base" };
  const filteredBase = mergedBase.filter(
    (record): record is BaseMergedRecord => Boolean(record)
  );

  return [...filteredBase, ...mergedCustom].sort((a, b) =>
    a.code.localeCompare(b.code, "fr", { numeric: true })
  );
};

const listMergedRecordsCached = unstable_cache(
  listMergedRecordsInternal,
  ["merged-exercises-records"],
  { tags: [EXERCISES_TAG] }
);

export const getMergedExerciseRecords = async () => listMergedRecordsCached();

export const getMergedExerciseRecord = async (code: string) => {
  const normalized = normalizeExerciseCode(code);
  const records = await listMergedRecordsCached();
  return records.find((record) => record.code === normalized) ?? null;
};

export const getMergedExercises = async (): Promise<ExerciseWithSession[]> => {
  const records = await listMergedRecordsCached();
  return records
    .map((record) => {
      const sessionNum = getSessionNum(record.code);
      if (!sessionNum) return null;
      const sessionId = `S${sessionNum}` as SessionId;
      return {
        ...toExerciseBase(record),
        sessionNum,
        sessionTitle: SESSIONS_EDITORIAL[sessionId].title,
      };
    })
    .filter((record): record is ExerciseWithSession => Boolean(record));
};

export const getMergedSessions = async () => {
  const exercises = await getMergedExercises();
  const counts = new Map<SessionId, number>();
  SESSION_IDS.forEach((id) => counts.set(id, 0));
  exercises.forEach((exercise) => {
    const id = `S${exercise.sessionNum}` as SessionId;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  return SESSION_IDS.map((id) => ({
    ...buildSessionBase(id),
    exerciseCount: counts.get(id) ?? 0,
  }));
};

export const getMergedSession = async (sessionId: SessionId): Promise<Session | null> => {
  const exercises = await getMergedExercises();
  const sessionNum = Number(sessionId.replace("S", ""));
  const sessionExercises = exercises
    .filter((exercise) => exercise.sessionNum === sessionNum)
    .map(({ sessionNum, sessionTitle, ...rest }) => {
      void sessionNum;
      void sessionTitle;
      return rest;
    });

  if (!sessionExercises.length) return null;

  const base = buildSessionBase(sessionId);
  return {
    num: sessionNum,
    title: base.title,
    subtitle: base.subtitle,
    chips: base.chips,
    introMd: base.introMd,
    exercises: sessionExercises,
  };
};
