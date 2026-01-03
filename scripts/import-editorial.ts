#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

type ExerciseRecord = {
  code: string;
  title?: string;
  level?: string;
  equipment?: string;
  muscles?: string;
  key_points?: string[];
  objective?: string;
  anatomy?: string;
  biomechanics?: string;
  benefits?: string;
  contraindications?: string;
  safety?: string[];
  regress?: string;
  progress?: string;
  dosage?: string;
  cues?: string[];
  sources?: string[];
  [key: string]: unknown;
};

type ExercisesData = {
  sessions?: Array<{
    exercises?: ExerciseRecord[];
  }>;
};

type EditorialSession = {
  title?: string;
  theme?: string;
  body?: string;
};

type EditorialData = {
  presentation: string;
  sessions: Record<string, EditorialSession>;
  conclusion: string;
  sources: string;
};

type SectionKey =
  | "title"
  | "level"
  | "equipment"
  | "muscles"
  | "key_points"
  | "objective"
  | "anatomy"
  | "biomechanics"
  | "benefits"
  | "contraindications"
  | "safety"
  | "regress"
  | "progress"
  | "progressions"
  | "dosage"
  | "cues"
  | "sources";

type ExerciseFieldKey = Exclude<SectionKey, "progressions">;

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "docs", "editorial", "master.fr.md");
const EXERCISES_PATH = path.join(ROOT, "src", "data", "exercises.json");
const EDITORIAL_PATH = path.join(ROOT, "src", "data", "editorial.fr.json");

const EXERCISE_HEADER_RE = /^\s*(?:#{1,3}\s*)?(S[1-5]-\d{2})\b\s*$/i;
const GLOBAL_HEADER_RE = /^#{0,3}\s*(PRESENTATION|CONCLUSION|SOURCES)\s*:?\s*(.*)$/i;
const SESSION_HEADER_RE = /^#{0,3}\s*SESSION\s+(S[1-5])\s*:?\s*(.*)$/i;
const HEADING_KEY_RE = /^###\s*(.+)$/i;
const KEY_VALUE_RE = /^([^:]+)\s*:\s*(.*)$/;
const BULLET_RE = /^(?:[-*•])\s+(.*)$/;

const LIST_KEYS = new Set<ExerciseFieldKey>([
  "key_points",
  "safety",
  "cues",
  "sources",
]);

const KEY_ALIASES: Record<string, SectionKey> = {
  title: "title",
  titre: "title",
  level: "level",
  niveau: "level",
  equipment: "equipment",
  materiel: "equipment",
  muscles: "muscles",
  key_points: "key_points",
  "key points": "key_points",
  "points cles": "key_points",
  "points cles technique": "key_points",
  safety: "safety",
  securite: "safety",
  objective: "objective",
  objectif: "objective",
  "objectifs fonctionnels": "objective",
  anatomy: "anatomy",
  "description anatomique": "anatomy",
  biomechanics: "biomechanics",
  "justifications biomecaniques": "biomechanics",
  benefits: "benefits",
  "benefices averes": "benefits",
  "contre indications et adaptations": "contraindications",
  "contre indications": "contraindications",
  "contre indications adaptations": "contraindications",
  "contre-indications et adaptations": "contraindications",
  "contre-indications": "contraindications",
  progressions: "progressions",
  regressions: "progressions",
  "progressions regressions": "progressions",
  progress: "progress",
  progression: "progress",
  regress: "regress",
  regression: "regress",
  dosage: "dosage",
  "dosage recommande": "dosage",
  "consignes pedagogiques": "cues",
  consignes: "cues",
  sources: "sources",
};

function normalizeKeyLabel(value: string): string {
  return value
    .trim()
    .replace(/:$/, "")
    .replace(/[\/]/g, " ")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function resolveKey(label: string): SectionKey | null {
  const normalized = normalizeKeyLabel(label);
  return KEY_ALIASES[normalized] ?? null;
}

function cleanBlock(value: string): string {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitProgressions(value: string): { progress?: string; regress?: string } {
  const progressMatch = value.match(
    /Progression\s*:\s*([\s\S]*?)(?=\n\s*R[eé]gression\s*:|$)/i
  );
  const regressMatch = value.match(/R[eé]gression\s*:\s*([\s\S]*?)$/i);

  const progress = progressMatch ? cleanBlock(progressMatch[1]) : "";
  const regress = regressMatch ? cleanBlock(regressMatch[1]) : "";

  const result: { progress?: string; regress?: string } = {};
  if (progress) result.progress = progress;
  if (regress) result.regress = regress;
  if (!progress && !regress) {
    const cleaned = cleanBlock(value);
    if (cleaned) result.progress = cleaned;
  }
  return result;
}

type BlockInfo = {
  exercises: Map<string, string[]>;
  presentation: string[];
  conclusion: string[];
  sources: string[];
  sessions: Map<string, string[]>;
};

function parseBlocks(source: string): BlockInfo {
  const lines = source.replace(/\r/g, "").split("\n");
  const info: BlockInfo = {
    exercises: new Map(),
    presentation: [],
    conclusion: [],
    sources: [],
    sessions: new Map(),
  };

  let currentType: "exercise" | "presentation" | "conclusion" | "sources" | "session" | null = null;
  let currentId: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentType || !buffer.length) return;
    if (currentType === "exercise" && currentId) {
      const existing = info.exercises.get(currentId) ?? [];
      info.exercises.set(currentId, existing.concat(buffer));
    } else if (currentType === "session" && currentId) {
      const existing = info.sessions.get(currentId) ?? [];
      info.sessions.set(currentId, existing.concat(buffer));
    } else if (currentType === "presentation") {
      info.presentation = info.presentation.concat(buffer);
    } else if (currentType === "conclusion") {
      info.conclusion = info.conclusion.concat(buffer);
    } else if (currentType === "sources") {
      info.sources = info.sources.concat(buffer);
    }
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentType) buffer.push("");
      continue;
    }
    if (trimmed.startsWith("#") && !EXERCISE_HEADER_RE.test(trimmed) && !GLOBAL_HEADER_RE.test(trimmed) && !SESSION_HEADER_RE.test(trimmed)) {
      continue;
    }

    const globalMatch = trimmed.match(GLOBAL_HEADER_RE);
    if (globalMatch) {
      flush();
      const label = globalMatch[1].toLowerCase();
      const inline = cleanBlock(globalMatch[2] ?? "");
      currentType = label as "presentation" | "conclusion" | "sources";
      currentId = null;
      buffer = [];
      if (inline) buffer.push(inline);
      continue;
    }

    const sessionMatch = trimmed.match(SESSION_HEADER_RE);
    if (sessionMatch) {
      flush();
      currentType = "session";
      currentId = sessionMatch[1].toUpperCase();
      buffer = [];
      const inline = cleanBlock(sessionMatch[2] ?? "");
      if (inline) buffer.push(inline);
      continue;
    }

    const exerciseMatch = trimmed.match(EXERCISE_HEADER_RE);
    if (exerciseMatch) {
      flush();
      currentType = "exercise";
      currentId = exerciseMatch[1].toUpperCase();
      buffer = [];
      continue;
    }

    if (currentType) {
      buffer.push(line);
    }
  }

  flush();
  return info;
}

function parseExerciseBlock(lines: string[]): Partial<ExerciseRecord> & { progressions?: string } {
  let currentKey: SectionKey | null = null;
  let buffer: string[] = [];
  let listItems: string[] = [];
  const result: Partial<Record<ExerciseFieldKey, string | string[]>> & {
    progressions?: string;
  } = {};

  const commit = () => {
    if (!currentKey) return;
    if (currentKey !== "progressions" && LIST_KEYS.has(currentKey as ExerciseFieldKey)) {
      const text = cleanBlock(buffer.join("\n"));
      const items = listItems.length ? listItems : text ? [text] : [];
      if (items.length) {
        const listKey = currentKey as ExerciseFieldKey;
        result[listKey] = items;
      }
    } else {
      const text = cleanBlock(buffer.join("\n"));
      if (text) {
        if (currentKey === "progressions") {
          result.progressions = text;
        } else {
          const valueKey = currentKey as ExerciseFieldKey;
          result[valueKey] = text;
        }
      }
    }
    buffer = [];
    listItems = [];
  };

  const setKey = (label: string, inlineValue?: string) => {
    const key = resolveKey(label);
    if (!key) return false;
    commit();
    currentKey = key;
    const inline = inlineValue ? cleanBlock(inlineValue) : "";
    if (inline) {
      if (key !== "progressions" && LIST_KEYS.has(key as ExerciseFieldKey)) {
        const bullet = inline.match(BULLET_RE);
        listItems.push((bullet ? bullet[1] : inline).trim());
      } else {
        buffer.push(inline);
      }
    }
    return true;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (currentKey) buffer.push("");
      continue;
    }

    const headingMatch = trimmed.match(HEADING_KEY_RE);
    if (headingMatch && setKey(headingMatch[1])) {
      continue;
    }

    const kvMatch = trimmed.match(KEY_VALUE_RE);
    if (kvMatch && setKey(kvMatch[1], kvMatch[2])) {
      continue;
    }

    const bulletMatch = trimmed.match(BULLET_RE);
    if (bulletMatch && currentKey) {
      if (LIST_KEYS.has(currentKey)) {
        listItems.push(bulletMatch[1].trim());
      } else {
        buffer.push(bulletMatch[1].trim());
      }
      continue;
    }

    if (currentKey) {
      buffer.push(trimmed);
    }
  }

  commit();
  return result as Partial<ExerciseRecord> & { progressions?: string };
}

function parseSessionBlock(lines: string[]): EditorialSession {
  let currentKey: "title" | "theme" | null = null;
  let buffer: string[] = [];
  const session: EditorialSession = {};
  const bodyLines: string[] = [];

  const commit = () => {
    if (!currentKey) return;
    const text = cleanBlock(buffer.join("\n"));
    if (text) session[currentKey] = text;
    buffer = [];
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (currentKey) buffer.push("");
      else bodyLines.push("");
      continue;
    }

    const kvMatch = trimmed.match(KEY_VALUE_RE);
    if (kvMatch) {
      const keyLabel = resolveKey(kvMatch[1]);
      if (keyLabel === "title" || keyLabel === "level") {
        commit();
        currentKey = "title";
        buffer.push(kvMatch[2] ?? "");
        continue;
      }
      if (normalizeKeyLabel(kvMatch[1]) === "theme") {
        commit();
        currentKey = "theme";
        buffer.push(kvMatch[2] ?? "");
        continue;
      }
    }

    if (currentKey) {
      buffer.push(trimmed);
    } else {
      bodyLines.push(trimmed);
    }
  }

  commit();
  const body = cleanBlock(bodyLines.join("\n"));
  if (body) session.body = body;
  return session;
}

async function main() {
  const source = await fs.readFile(INPUT_PATH, "utf8");
  const raw = await fs.readFile(EXERCISES_PATH, "utf8");
  const data = JSON.parse(raw) as ExercisesData;
  const exercises =
    data.sessions?.flatMap((session) => session.exercises ?? []) ?? [];

  const blocks = parseBlocks(source);
  const exerciseMap = blocks.exercises;

  let matched = 0;
  const updatedCodes: string[] = [];

  for (const exercise of exercises) {
    const lines = exerciseMap.get(exercise.code);
    if (!lines) continue;
    matched += 1;
    updatedCodes.push(exercise.code);

    const fields = parseExerciseBlock(lines);

    if (fields.title) exercise.title = fields.title;
    if (fields.level) exercise.level = fields.level;
    if (fields.equipment) exercise.equipment = fields.equipment;
    if (fields.muscles) exercise.muscles = fields.muscles;
    if (fields.key_points) exercise.key_points = fields.key_points;
    if (fields.objective) exercise.objective = fields.objective;
    if (fields.anatomy) exercise.anatomy = fields.anatomy;
    if (fields.biomechanics) exercise.biomechanics = fields.biomechanics;
    if (fields.benefits) exercise.benefits = fields.benefits;
    if (fields.contraindications) {
      exercise.contraindications = fields.contraindications;
    }
    if (fields.safety) exercise.safety = fields.safety;
    if (fields.regress) exercise.regress = fields.regress;
    if (fields.progress) exercise.progress = fields.progress;
    if (fields.dosage) exercise.dosage = fields.dosage;
    if (fields.cues) exercise.cues = fields.cues;
    if (fields.sources) exercise.sources = fields.sources;

    if (fields.progressions && (!fields.progress || !fields.regress)) {
      const split = splitProgressions(fields.progressions);
      if (!fields.progress && split.progress) exercise.progress = split.progress;
      if (!fields.regress && split.regress) exercise.regress = split.regress;
    }
  }

  const missingInJson = Array.from(exerciseMap.keys()).filter(
    (code) => !exercises.some((exercise) => exercise.code === code)
  );
  const missingInMd = exercises
    .map((exercise) => exercise.code)
    .filter((code) => !exerciseMap.has(code));

  await fs.writeFile(EXERCISES_PATH, JSON.stringify(data, null, 2), "utf8");

  const presentation = cleanBlock(blocks.presentation.join("\n"));
  const conclusion = cleanBlock(blocks.conclusion.join("\n"));
  const sources = cleanBlock(blocks.sources.join("\n"));

  const sessions: Record<string, EditorialSession> = {
    S1: {},
    S2: {},
    S3: {},
    S4: {},
    S5: {},
  };

  for (const [sessionId, lines] of blocks.sessions.entries()) {
    sessions[sessionId] = parseSessionBlock(lines);
  }

  const editorial: EditorialData = {
    presentation,
    sessions,
    conclusion,
    sources,
  };

  await fs.writeFile(EDITORIAL_PATH, JSON.stringify(editorial, null, 2), "utf8");

  console.log(`Editorial blocks found: ${exerciseMap.size}`);
  console.log(`Exercises matched in JSON: ${matched}`);
  console.log("Missing in exercises.json:", missingInJson);
  console.log("Missing in master.fr.md:", missingInMd);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


