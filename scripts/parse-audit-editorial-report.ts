#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";
import {
  normalizeLineEndings,
  stripTrailingWhitespace,
  splitParagraphs,
} from "./editorial-utils";

export type AuditSectionKey =
  | "materiel"
  | "consignes"
  | "dosage"
  | "securite"
  | "contre"
  | "description"
  | "objectifs"
  | "justifications"
  | "benefices"
  | "progression"
  | "regression"
  | "muscles"
  | "anatomie";

export type AuditSection = {
  key: AuditSectionKey;
  label: string;
  content: string;
  segment: string;
  start: number;
  end: number;
};

export type AuditEditorialEntry = {
  code: string;
  block: string;
  blockForFields: string;
  sections: AuditSection[];
  paragraphs: string[];
  source: "explicit" | "summary";
};

export type AuditGuide = {
  presentation: string;
  conclusion: string;
  sources: string;
  notes: string;
};

export type AuditSession = {
  id: string;
  header: string;
  about: string;
  extra: string;
};

export type AuditSegment = {
  type: "guide" | "session" | "exercise";
  id: string;
  text: string;
  startLine: number;
  endLine: number;
};

export type AuditParseResult = {
  raw: string;
  lines: string[];
  codeLineMap: Map<string, number>;
  entries: Record<string, AuditEditorialEntry>;
  summaryByCode: Record<string, string>;
  guide: AuditGuide;
  sessions: Record<string, AuditSession>;
  segments: AuditSegment[];
  unassigned: string[];
};

type MetaLineKind =
  | "session3-suite"
  | "session4-condensed"
  | "session4-summary"
  | "structure-sources"
  | "generic";

const ROOT = process.cwd();
const INPUT_PATHS = [
  path.join(ROOT, "docs", "editorial", "audit-editorial.report.md"),
  path.join(ROOT, "audit-editorial.report.md"),
];

const BLOCK_CODE_LINE_RE =
  /^\s*(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\b/;
const CODE_TOKEN_RE = /\bS[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2}\b/g;
const RANGE_RE =
  /\b(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\s*(?:a|\u00E0|à|to|[-\u2010\u2011\u2012\u2013\u2014]|…|\u2026)\s*(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\b/gi;
const GLOBAL_SUFFIX_RE = /(?:^|\n)(Conclusion|Sources)\s*:/g;
const SESSION_HEADER_RE =
  /^\s*Session\s+([1-5])\s*[-:\u2010\u2011\u2012\u2013\u2014]\s*(.+)$/i;
const PRESENTATION_RE = /^\s*Pr.?sentation\s*:\s*/i;
const CONCLUSION_RE = /^\s*Conclusion\s*:\s*/i;
const SOURCES_RE = /^\s*Sources\s*:\s*/i;
const META_NOTE_RE =
  /(Suite des exercices|En raison de la longueur|Chaque fiche suit la m.?me structure|\(Les exercices S2-10|\(En r.?sum|Probablement ins.?r.?|\(S4-05)/i;
const STRUCTURE_NOTE_RE =
  /Chaque fiche suiv\w*\s+la m.?me structure/i;
const DOSAGE_NOTE_RE = /Le dosage\b/i;
const EDITOR_COMMENT_RE = /\b(Probablement|Peut[-\u2010-\u2015]?[\u00EAe]tre)\b/i;

const SESSION3_SUITE_LINE =
  "(. Suite des exercices de Session 3, y compris S3-04 pompes inclin‚es, S3-05 pompes avec rotation (T push-up) qui travaille la stabilit‚ unilat‚rale et l'ouverture thoracique, S3-06 dips aux barres parallŠles - renfor‡ant triceps, pectoraux inf‚rieurs, delto‹des ant., avec attention aux ‚paules en bas, S3-07 … S3-09 variantes de tractions pronation, supination, neutre - travail dorsaux, biceps avec diff‚rences d'activation (pull-up vs chin-up, cf. citations sur biceps plus engag‚s en chin-ups), S3-10 d‚velopp‚ haltŠres couch‚ - force pectoraux sans barre, S3-11 d‚velopp‚ haltŠres inclin‚ - focus pectoraux sup‚rieurs, S3-12 rowing un bras haltŠre - renforcement dorsaux unilat‚raux et transversaux, S3-13 rowing pench‚ deux haltŠres - global dos, S3-14 ‚levations lat‚rales - isolation delto‹des lat., S3-15 ‚levations frontales - delto‹des ant., S3-16 curl biceps - isolation biceps, S3-17 hammer curl - brachial, avant-bras, S3-18 extension triceps overhead - longue portion triceps, S3-19 kickback triceps - chef lat‚ral triceps, S3-20 face pulls ‚lastique - travail r‚traction scapulaire, exo posture scapulo-hum‚rale). Chaque fiche suivrait la mˆme structure : description anatomique (muscles cibl‚s et synergiques), objectifs (souvent ‚quilibrer agonistes/antagonistes : ex face pull pour corriger posture des ‚paules), justifications biom‚caniques (ex: importance du centrage scapulaire en face pull pour posture), b‚n‚fices (r‚f‚rence possible comme face pulls am‚liorent posture ‚paule ), contre-indications (ex: prudence curls en cas tendinite coude), progressions (ex: tractions avec ‚lastique assist‚ -> poids du corps -> lest‚), consignes (beaucoup d'accent sur la forme : ex: tractions bien descendre bras tendus, pas de ® kipping ¯). Le dosage pour le haut du corps varie : force pure (3-6 reps pour tractions difficiles), hypertrophie (8-12), endurance (15+ pour petits exos).)";
const SESSION4_CONDENSED_LINE =
  "(En raison de la longueur, les fiches suivantes de la Session 4 sont condens‚es mais suivraient la mˆme structure d‚taill‚e.)";
const SESSION4_SUMMARY_LINE =
  "(S4-05 Fentes arriŠre : semblable aux fentes avant mais en reculant, moins de stress ant‚rieur genou, plus de fessier ; S4-06 Fentes lat‚rales : sollicitent adducteurs et abducteurs en plus, visent la mobilit‚ dans le plan frontal ; S4-07 Soulev‚ de terre roumain (RDL) : exercice chaŒne post‚rieure, ischio-jambiers, fessiers, lombaires - on d‚taillerait posture dos neutre, charniŠre de hanche, ne pas arrondir, grand b‚n‚fice sur force ischios et pr‚vention blessures ischio ; S4-08 Hip Thrust au sol : pont fessier au sol avec poids corporel, cible grand fessier, ischios second., renforce extension hanche utile pour sprint/saut ; S4-09 Hip Thrust sur banc avec charge : variation plus complŠte amplitude, trŠs grande activation du grand fessier (on citerait Contreras 2015 qui montrait plus d'EMG glute max qu'un squat), b‚n‚fices sur performance sprint et pr‚vention lombalgie ; S4-10 Glute Bridge (pont fessier) : similaire hip thrust au sol sans charge ; S4-11 Step-ups sur caisson : quadriceps et fessiers en unilat‚ral fonctionnel (monter marche), am‚liore puissance jambe individuelle et ‚quilibre ; S4-12 Pistol Squat (squat une jambe) : exercice avanc‚ de force et ‚quilibre une jambe, quadriceps trŠs sollicit‚, demandant grande stabilit‚ - mention des risques pour genou si mal contr“l‚, progressions avec assistance ; S4-13 Nordic Hamstring Curl : exo chaŒn‚s, on le mentionne d‚j… plus haut - il cible ischio en excentrique pur, prouv‚ r‚duire blessures de ~50% , on insisterait sur la technique (corps droit, se laisser tomber frein‚ par ischios), contre-indication si tendinopathies aigu‰s, progression via assistance ‚lastique ; S4-14 Mollets debout : isolant gastrocs, important pour cheville et impulsion (am‚liore l'‚conomie de course, pr‚vient tendinopathies Achille), consignes (plein amplitude, pause en bas) ; S4-15 Jump Squats : squat saut‚ pour puissance, usage prudent pour articulations, bas volume, etc.)";
const STRUCTURE_SOURCES_LINE =
  "(Chaque fiche suit la mˆme structure ; sources scientifiques pourraient ˆtre cit‚es notamment pour le Nordic Curl, le hip thrust vs squat, etc.)";

const META_LINE_KINDS = new Map<string, MetaLineKind>([
  [SESSION3_SUITE_LINE, "session3-suite"],
  [SESSION4_CONDENSED_LINE, "session4-condensed"],
  [SESSION4_SUMMARY_LINE, "session4-summary"],
  [STRUCTURE_SOURCES_LINE, "structure-sources"],
]);


const LABEL_PATTERNS: Array<{ key: AuditSectionKey; label: string }> = [
  { key: "materiel", label: "materiel" },
  { key: "materiel", label: "materiels" },
  { key: "consignes", label: "consignes" },
  { key: "consignes", label: "consignes cles" },
  { key: "consignes", label: "consignes pedagogiques" },
  { key: "dosage", label: "dosage recommande" },
  { key: "dosage", label: "dosage" },
  { key: "securite", label: "securite" },
  { key: "contre", label: "contre indications" },
  { key: "contre", label: "contre indications et adaptations" },
  { key: "description", label: "description anatomique" },
  { key: "description", label: "description" },
  { key: "objectifs", label: "objectifs fonctionnels" },
  { key: "objectifs", label: "objectifs" },
  { key: "justifications", label: "justifications biomecaniques" },
  { key: "justifications", label: "justifications" },
  { key: "benefices", label: "benefices averes" },
  { key: "benefices", label: "benefices" },
  { key: "progression", label: "progressions regressions" },
  { key: "progression", label: "progressions / regressions" },
  { key: "progression", label: "progressions" },
  { key: "regression", label: "regressions" },
  { key: "progression", label: "progression" },
  { key: "regression", label: "regression" },
  { key: "muscles", label: "muscles" },
  { key: "anatomie", label: "anatomie" },
];

const LABEL_PATTERN_LOOKUP = new Map(
  LABEL_PATTERNS.map((entry) => [entry.label, entry.key])
);

const LABEL_PATTERN_REGEX = new RegExp(
  `\\b(${LABEL_PATTERNS.map((entry) => entry.label)
    .sort((a, b) => b.length - a.length)
    .map((label) => label.replace(/\s+/g, "\\s+"))
    .join("|")})\\b\\s*:`,
  "gi"
);

const normalizeCodeToken = (value: string) =>
  value.replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-");

const normalizeLabelToken = (value: string) =>
  value.replace(/\s+/g, " ").trim().toLowerCase();

const stripLabelPrefix = (value: string, regex: RegExp) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(regex, "").trim();
};

const normalizeForLabelSearch = (value: string) => {
  let normalized = "";
  const startMap: number[] = [];
  const endMap: number[] = [];
  let index = 0;

  for (const char of value) {
    const start = index;
    const length = char.length;
    index += length;

    let out = char
      .replace(/[\u0153\u0152]/g, "oe")
      .replace(/[\u00E6\u00C6]/g, "ae")
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();
    out = out.replace(/[^a-z0-9:\s]/g, " ");

    if (!out) continue;
    for (const outChar of out) {
      normalized += outChar;
      startMap.push(start);
      endMap.push(start + length);
    }
  }

  return { normalized, startMap, endMap };
};

const sliceForFields = (block: string): string => {
  let cutIndex = block.length;
  let match: RegExpExecArray | null;
  while ((match = GLOBAL_SUFFIX_RE.exec(block)) !== null) {
    if (match.index < cutIndex) {
      cutIndex = match.index;
    }
  }
  return block.slice(0, cutIndex);
};

const normalizeSessionId = (value: string) => {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return "";
  if (/^S[1-5]$/.test(trimmed)) return trimmed;
  if (/^[1-5]$/.test(trimmed)) return `S${trimmed}`;
  return trimmed;
};

const hasMultipleCodes = (value: string) => {
  const matches = value.match(CODE_TOKEN_RE) ?? [];
  const normalized = matches
    .map((code) => normalizeExerciseCode(normalizeCodeToken(code)))
    .filter(Boolean);
  return new Set(normalized).size > 1;
};

const getMetaLineKind = (line: string): MetaLineKind | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const exact = META_LINE_KINDS.get(trimmed);
  if (exact) return exact;
  if (!trimmed.startsWith("(")) return null;
  if (META_NOTE_RE.test(trimmed)) return "generic";
  return null;
};

const splitExerciseBlockLines = (lines: string[]) => {
  let leakIndex = -1;
  let leakKind: MetaLineKind | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const kind = getMetaLineKind(lines[i]);
    if (!kind) continue;
    leakIndex = i;
    leakKind = kind;
    break;
  }
  if (leakIndex <= 0) {
    return { exercise: lines, leak: [] as string[], leakIndex: -1, leakKind: null };
  }
  return {
    exercise: lines.slice(0, leakIndex),
    leak: lines.slice(leakIndex),
    leakIndex,
    leakKind,
  };
};

const inferSessionFromText = (value: string) => {
  const sessionMatch = value.match(/Session\s+([1-5])/i);
  if (sessionMatch) return normalizeSessionId(`S${sessionMatch[1]}`);
  const codeMatch = value.match(/\bS([1-5])[-\u2010\u2011\u2012\u2013\u2014]\d{2}\b/i);
  if (codeMatch) return normalizeSessionId(`S${codeMatch[1]}`);
  return "";
};

const stripMetaWrapper = (value: string) => {
  let output = value.trim();
  if (output.startsWith("(") && output.endsWith(")")) {
    output = output.slice(1, -1).trim();
  }
  return output;
};

const cleanSummaryDescription = (value: string) =>
  value
    .replace(/^[\s,;:–—-]+/, "")
    .replace(/\)\s*$/, "")
    .replace(/\s+$/, "")
    .trim();

const isRangeConnector = (value: string) => {
  const cleaned = value.replace(/\s+/g, "").toLowerCase();
  if (!cleaned) return false;
  if (["a", "to", "au", "aux", "à"].includes(cleaned)) return true;
  if (/^[\-\u2010\u2011\u2012\u2013\u2014.]+$/.test(cleaned)) return true;
  return cleaned === "…" || cleaned === "\u2026";
};

const expandRangeCodes = (start: string, end: string) => {
  const startNorm = normalizeExerciseCode(normalizeCodeToken(start));
  const endNorm = normalizeExerciseCode(normalizeCodeToken(end));
  if (!isValidExerciseCode(startNorm) || !isValidExerciseCode(endNorm)) return [];
  if (startNorm.slice(0, 2) !== endNorm.slice(0, 2)) return [];
  const startNum = Number(startNorm.slice(3));
  const endNum = Number(endNorm.slice(3));
  if (!Number.isFinite(startNum) || !Number.isFinite(endNum)) return [];
  const min = Math.min(startNum, endNum);
  const max = Math.max(startNum, endNum);
  const session = startNorm.slice(0, 2);
  const codes: string[] = [];
  for (let i = min; i <= max; i += 1) {
    codes.push(normalizeExerciseCode(`${session}-${String(i).padStart(2, "0")}`));
  }
  return codes;
};

const extractSummaryItems = (value: string) => {
  const text = normalizeCodeToken(value);
  const matches = Array.from(text.matchAll(CODE_TOKEN_RE));
  const items: Record<string, string> = {};
  if (!matches.length) return items;

  let index = 0;
  while (index < matches.length) {
    const current = matches[index];
    if (current.index == null) {
      index += 1;
      continue;
    }

    const currentCode = normalizeExerciseCode(current[0]);
    const next = matches[index + 1];
    if (next && next.index != null) {
      const between = text.slice(current.index + current[0].length, next.index);
      if (isRangeConnector(between)) {
        const rangeCodes = expandRangeCodes(current[0], next[0]);
        const afterRangeStart = next.index + next[0].length;
        const afterRangeEnd = matches[index + 2]?.index ?? text.length;
        const description = cleanSummaryDescription(
          text.slice(afterRangeStart, afterRangeEnd)
        );
        if (description) {
          rangeCodes.forEach((code) => {
            items[code] = `${code} ${description}`.trim();
          });
        }
        index += 2;
        continue;
      }
    }

    const nextIndex = next?.index ?? text.length;
    const description = cleanSummaryDescription(
      text.slice(current.index + current[0].length, nextIndex)
    );
    if (description) {
      items[currentCode] = `${currentCode} ${description}`.trim();
    }
    index += 1;
  }

  return items;
};

const splitStructureNote = (value: string) => {
  const match = value.match(STRUCTURE_NOTE_RE);
  if (!match || match.index == null) {
    return { structure: "", remaining: value };
  }
  const start = match.index;
  const before = value.slice(0, start).trim();
  const after = value.slice(start).trim();
  const dosageMatch = after.match(DOSAGE_NOTE_RE);
  if (dosageMatch && dosageMatch.index != null) {
    const structure = after.slice(0, dosageMatch.index).trim();
    const tail = after.slice(dosageMatch.index).trim();
    const remaining = [before, tail].filter(Boolean).join(" ").trim();
    return { structure, remaining };
  }
  const remaining = before.trim();
  return { structure: after, remaining };
};

const splitSession3Suite = (value: string) => {
  const structureIndex = value.search(STRUCTURE_NOTE_RE);
  const summaryRaw =
    structureIndex >= 0 ? value.slice(0, structureIndex).trim() : value.trim();
  const structureRaw =
    structureIndex >= 0 ? value.slice(structureIndex).trim() : "";
  let summaryText = summaryRaw;
  let structureNote = "";
  let dosageNote = "";
  const firstCodeMatches = summaryRaw.match(CODE_TOKEN_RE);
  if (firstCodeMatches?.length) {
    const startIndex = summaryRaw.indexOf(firstCodeMatches[0]);
    if (startIndex >= 0) {
      summaryText = summaryRaw.slice(startIndex).trim();
    }
  }

  const dosageIndex = summaryText.search(DOSAGE_NOTE_RE);
  if (dosageIndex >= 0) {
    dosageNote = [dosageNote, summaryText.slice(dosageIndex).trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
    summaryText = summaryText.slice(0, dosageIndex).trim();
  }

  if (structureRaw) {
    const dosageIndex = structureRaw.search(DOSAGE_NOTE_RE);
    if (dosageIndex >= 0) {
      structureNote = structureRaw.slice(0, dosageIndex).trim();
      dosageNote = structureRaw.slice(dosageIndex).trim();
    } else {
      structureNote = structureRaw.trim();
    }
  }

  return { summaryText, structureNote, dosageNote };
};


const parseSections = (block: string): AuditSection[] => {
  const matches: Array<{
    key: AuditSectionKey;
    label: string;
    labelStart: number;
    contentStart: number;
    labelStartNorm: number;
  }> = [];

  const { normalized, startMap, endMap } = normalizeForLabelSearch(block);
  let match: RegExpExecArray | null;
  while ((match = LABEL_PATTERN_REGEX.exec(normalized)) !== null) {
    const labelRaw = normalizeLabelToken(match[1]);
    const key = LABEL_PATTERN_LOOKUP.get(labelRaw);
    if (!key) continue;
    const labelStartNorm = match.index;
    const contentStartNorm = match.index + match[0].length;
    const labelStart = startMap[labelStartNorm];
    const contentStart = endMap[contentStartNorm - 1];
    if (labelStart == null || contentStart == null) continue;
    matches.push({
      key,
      label: match[1],
      labelStart,
      contentStart,
      labelStartNorm,
    });
  }

  matches.sort((a, b) => a.labelStartNorm - b.labelStartNorm);

  const sections: AuditSection[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const end = next ? next.labelStart : block.length;
    const content = block.slice(current.contentStart, end);
    const segment = block.slice(current.labelStart, end);
    sections.push({
      key: current.key,
      label: current.label,
      content,
      segment,
      start: current.labelStart,
      end,
    });
  }

  return sections;
};

export async function parseAuditEditorialReport(
  filePath: string
): Promise<AuditParseResult> {
  const rawInput = await fs.readFile(filePath, "utf8");
  const raw = stripTrailingWhitespace(normalizeLineEndings(rawInput));
  const lines = raw.split("\n");

  const sessionHeaders: Array<{ id: string; line: number; header: string }> = [];
  const conclusionLines: number[] = [];
  const sourcesLines: number[] = [];

  lines.forEach((line, index) => {
    const sessionMatch = line.match(SESSION_HEADER_RE);
    if (sessionMatch) {
      sessionHeaders.push({
        id: normalizeSessionId(`S${sessionMatch[1]}`),
        line: index,
        header: line.trim(),
      });
    }
    if (CONCLUSION_RE.test(line)) conclusionLines.push(index);
    if (SOURCES_RE.test(line)) sourcesLines.push(index);
  });

  const exerciseStarts: Array<{ code: string; line: number }> = [];
  lines.forEach((line, index) => {
    const codeMatch = line.match(BLOCK_CODE_LINE_RE);
    if (!codeMatch) return;
    const rawCode = normalizeCodeToken(codeMatch[1]);
    const code = normalizeExerciseCode(rawCode);
    if (!isValidExerciseCode(code)) return;
    exerciseStarts.push({ code, line: index });
  });

  const codeLineMap = new Map<string, number>();
  const entries: Record<string, AuditEditorialEntry> = {};
  const summaryByCode: Record<string, string> = {};
  const guideNotes: string[] = [];
  const sessions: Record<string, AuditSession> = {};
  const segments: AuditSegment[] = [];
  const assigned = Array(lines.length).fill(false);

  const markRange = (startLine: number, endLine: number) => {
    const safeStart = Math.max(0, startLine);
    const safeEnd = Math.min(lines.length, endLine);
    for (let i = safeStart; i < safeEnd; i += 1) {
      assigned[i] = true;
    }
  };

  const addSegment = (segment: AuditSegment) => {
    segments.push(segment);
    markRange(segment.startLine, segment.endLine);
  };

  const registerEntry = (
    code: string,
    block: string,
    source: AuditEditorialEntry["source"]
  ) => {
    const existing = entries[code];
    if (existing && existing.source === "explicit") return;
    if (existing && existing.source === "summary" && source === "summary") return;
    const blockForFields = sliceForFields(block);
    const sections = parseSections(blockForFields);
    const paragraphs = splitParagraphs(block);
    entries[code] = {
      code,
      block,
      blockForFields,
      sections,
      paragraphs,
      source,
    };
  };

  const appendSessionExtra = (sessionId: string, text: string) => {
    if (!text.trim()) return;
    if (hasMultipleCodes(text)) return;
    const existing = sessions[sessionId];
    sessions[sessionId] = {
      id: sessionId,
      header: existing?.header ?? "",
      about: existing?.about ?? "",
      extra: [existing?.extra, text].filter(Boolean).join("\n\n"),
    };
  };

  const appendGuideNote = (text: string) => {
    if (!text.trim()) return;
    guideNotes.push(text.trim());
  };

  const registerSummaryItems = (text: string) => {
    const items = extractSummaryItems(text);
    for (const [code, item] of Object.entries(items)) {
      if (!isValidExerciseCode(code)) continue;
      summaryByCode[code] = item;
      registerEntry(code, item, "summary");
    }
  };

const registerMetaBlock = (
  text: string,
  startLine?: number,
  endLine?: number,
  sessionHint?: string,
  kind?: MetaLineKind | null
) => {
  const trimmed = text.trim();
  if (!trimmed) return;
  const cleaned = stripMetaWrapper(trimmed);
  if (!cleaned) return;
  if (EDITOR_COMMENT_RE.test(cleaned)) {
    if (typeof startLine === "number" && typeof endLine === "number") {
      markRange(startLine, endLine);
    }
    return;
  }
  const metaKind = kind ?? getMetaLineKind(trimmed) ?? "generic";

    if (metaKind === "session4-condensed") {
      appendGuideNote(cleaned);
      if (typeof startLine === "number" && typeof endLine === "number") {
        addSegment({
          type: "guide",
          id: "notes",
          text: cleaned,
          startLine,
          endLine,
        });
      }
      return;
    }

    if (metaKind === "structure-sources") {
      appendGuideNote(cleaned);
      if (typeof startLine === "number" && typeof endLine === "number") {
        addSegment({
          type: "guide",
          id: "notes",
          text: cleaned,
          startLine,
          endLine,
        });
      }
      return;
    }

    if (metaKind === "session3-suite") {
      const { summaryText, structureNote, dosageNote } =
        splitSession3Suite(cleaned);
      if (summaryText) {
        registerSummaryItems(summaryText);
        if (typeof startLine === "number" && typeof endLine === "number") {
          addSegment({
            type: "session",
            id: "S3:extra",
            text: summaryText,
            startLine,
            endLine,
          });
        }
      }
      if (structureNote) appendGuideNote(structureNote);
      if (dosageNote) appendGuideNote(dosageNote);
      if (
        (structureNote || dosageNote) &&
        typeof startLine === "number" &&
        typeof endLine === "number"
      ) {
        addSegment({
          type: "guide",
          id: "notes",
          text: [structureNote, dosageNote].filter(Boolean).join("\n\n"),
          startLine,
          endLine,
        });
      }
      return;
    }

    if (metaKind === "session4-summary") {
      let summaryText = cleaned;
      const structureMatch = cleaned.match(STRUCTURE_NOTE_RE);
      if (structureMatch?.index != null) {
        appendGuideNote(cleaned.slice(structureMatch.index).trim());
        summaryText = cleaned.slice(0, structureMatch.index).trim();
      }
      registerSummaryItems(summaryText);
      if (typeof startLine === "number" && typeof endLine === "number") {
        addSegment({
          type: "session",
          id: "S4:extra",
          text: summaryText,
          startLine,
          endLine,
        });
      }
      return;
    }

    const { structure, remaining } = splitStructureNote(cleaned);
    if (structure) appendGuideNote(structure.trim());
    const sessionId = sessionHint ?? inferSessionFromText(cleaned);
    const sessionText = remaining.trim();

    if (sessionText) {
      if (sessionId) {
        const codes = sessionText.match(CODE_TOKEN_RE) ?? [];
        if (codes.length <= 1) {
          appendSessionExtra(sessionId, sessionText);
        }
      } else {
        appendGuideNote(sessionText);
      }
    }

    if (sessionId === "S3" || sessionId === "S4") {
      registerSummaryItems(sessionText || cleaned);
    }

    const codes = new Set<string>();
    const rangeMatches = Array.from(cleaned.matchAll(RANGE_RE));
    const codeMatches = cleaned.match(CODE_TOKEN_RE) ?? [];

    for (const code of codeMatches) {
      const normalized = normalizeExerciseCode(normalizeCodeToken(code));
      if (isValidExerciseCode(normalized)) {
        codes.add(normalized);
      }
    }

    for (const range of rangeMatches) {
      const expanded = expandRangeCodes(range[1], range[2]);
      expanded.forEach((code) => codes.add(code));
    }

    for (const code of codes) {
      if (entries[code]) continue;
      registerEntry(code, cleaned, "summary");
    }

    if (typeof startLine === "number" && typeof endLine === "number") {
      addSegment({
        type: sessionId ? "session" : "guide",
        id: sessionId ? `${sessionId}:extra` : "notes",
        text: cleaned,
        startLine,
        endLine,
      });
    }
  };

  const sessionRanges = sessionHeaders.map((header, idx) => {
    const nextSession = sessionHeaders[idx + 1];
    const nextSessionLine = nextSession ? nextSession.line : lines.length;
    const nextConclusion = conclusionLines.length
      ? Math.min(...conclusionLines.filter((line) => line > header.line))
      : lines.length;
    const sessionEnd = Math.min(nextSessionLine, nextConclusion);
    const firstExercise = exerciseStarts
      .map((entry) => entry.line)
      .find((line) => line > header.line && line < sessionEnd);
    return {
      id: header.id,
      header: header.header,
      startLine: header.line,
      endLine: firstExercise ?? sessionEnd,
    };
  });

  for (let i = 0; i < exerciseStarts.length; i += 1) {
    const current = exerciseStarts[i];
    const next = exerciseStarts[i + 1];
    const startLine = current.line;
    const nextLine = next ? next.line : lines.length;
    const nextSessionLine = sessionHeaders
      .map((entry) => entry.line)
      .filter((line) => line > startLine)
      .sort((a, b) => a - b)[0];
    const nextConclusionLine = conclusionLines
      .filter((line) => line > startLine)
      .sort((a, b) => a - b)[0];
    const endLine = Math.min(
      nextLine,
      nextSessionLine ?? lines.length,
      nextConclusionLine ?? lines.length
    );

    const blockLines = lines.slice(startLine, endLine);
    const {
      exercise: exerciseLines,
      leak: leakLines,
      leakIndex,
      leakKind,
    } = splitExerciseBlockLines(blockLines);
    const block = exerciseLines.join("\n");
    const code = current.code;
    registerEntry(code, block, "explicit");
    codeLineMap.set(code, startLine);

    if (block.trim()) {
      addSegment({
        type: "exercise",
        id: code,
        text: block,
        startLine,
        endLine: startLine + exerciseLines.length,
      });
    }

    if (leakLines.length) {
      const leakText = leakLines.join("\n").trim();
      const leakStart = startLine + (leakIndex >= 0 ? leakIndex : 0);
      const leakEnd = startLine + blockLines.length;
      registerMetaBlock(leakText, leakStart, leakEnd, undefined, leakKind);
    }
  }

  sessionRanges.forEach((range) => {
    if (!range.id) return;
    const contentLines = lines.slice(range.startLine + 1, range.endLine);
    const aboutLines: string[] = [];
    contentLines.forEach((line, offset) => {
      if (!line.trim()) return;
      const kind = getMetaLineKind(line);
      if (kind) {
        const lineIndex = range.startLine + 1 + offset;
        registerMetaBlock(line, lineIndex, lineIndex + 1, range.id, kind);
      } else {
        aboutLines.push(line);
      }
    });
    const existing = sessions[range.id];
    sessions[range.id] = {
      id: range.id,
      header: range.header,
      about: [existing?.about, aboutLines.join("\n").trim()]
        .filter(Boolean)
        .join("\n\n"),
      extra: existing?.extra ?? "",
    };
    if (sessions[range.id].about) {
      addSegment({
        type: "session",
        id: `${range.id}:about`,
        text: sessions[range.id].about,
        startLine: range.startLine,
        endLine: range.endLine,
      });
    }
  });

  const firstSessionLine = sessionHeaders.length
    ? sessionHeaders[0].line
    : lines.length;
  const guideLines = lines.slice(0, firstSessionLine).filter((line) => line.trim());
  const presentation = stripLabelPrefix(guideLines.join("\n"), PRESENTATION_RE);
  const conclusionLine = conclusionLines.length ? conclusionLines[0] : -1;
  const sourcesLine = sourcesLines.length ? sourcesLines[0] : -1;

  const conclusion =
    conclusionLine >= 0
      ? stripLabelPrefix(
          lines
            .slice(
              conclusionLine,
              sourcesLine > conclusionLine ? sourcesLine : lines.length
            )
            .join("\n"),
          CONCLUSION_RE
        )
      : "";
  const sources =
    sourcesLine >= 0
      ? stripLabelPrefix(
          lines.slice(sourcesLine).join("\n"),
          SOURCES_RE
        )
      : "";

  if (presentation) {
    addSegment({
      type: "guide",
      id: "presentation",
      text: presentation,
      startLine: 0,
      endLine: firstSessionLine,
    });
  }
  if (conclusion) {
    addSegment({
      type: "guide",
      id: "conclusion",
      text: conclusion,
      startLine: conclusionLine,
      endLine: sourcesLine > conclusionLine ? sourcesLine : lines.length,
    });
  }
  if (sources) {
    addSegment({
      type: "guide",
      id: "sources",
      text: sources,
      startLine: sourcesLine,
      endLine: lines.length,
    });
  }

  const guide: AuditGuide = {
    presentation,
    conclusion,
    sources,
    notes: guideNotes.join("\n\n").trim(),
  };

  const unassigned: string[] = [];
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    if (!assigned[index]) {
      unassigned.push(`${index + 1}: ${line}`);
    }
  });

  return {
    raw,
    lines,
    codeLineMap,
    entries,
    summaryByCode,
    guide,
    sessions,
    segments,
    unassigned,
  };
}

async function main() {
  const inputPath = await (async () => {
    for (const candidate of INPUT_PATHS) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        continue;
      }
    }
    throw new Error("audit-editorial.report.md not found.");
  })();

  const result = await parseAuditEditorialReport(inputPath);
  const output = {
    codes: Object.keys(result.entries).sort(),
    entries: result.entries,
  };

  const outputPath = path.join(
    ROOT,
    "reports",
    "audit-editorial.parsed.json"
  );
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");
  console.log(
    `Parsed audit editorial codes (${output.codes.length}). Output: ${outputPath}`
  );
}

if (process.argv[1] && process.argv[1].endsWith("parse-audit-editorial-report.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}





