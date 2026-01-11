import raw from "@/data/editorial.fr.json";
import type {
  EditorialData,
  GuideData,
  GuideSession,
} from "@/lib/editorial/schema";
import {
  SESSIONS_EDITORIAL,
  SESSION_IDS,
} from "@/lib/editorial/sessions";
import { SESSION_ABOUT } from "@/lib/editorial/sessions.generated";

const fallbackSessions: GuideSession[] = SESSION_IDS.map((id, index) => ({
  id,
  title: `Session ${index + 1}`,
  theme: "",
}));

const stripTextPrefix = (value: string): string =>
  value.replace(/^(text|texte)\s*:\s*/i, "").trim();

const toText = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "text" in value) {
    const text = (value as { text?: unknown }).text;
    if (typeof text === "string") return text.trim();
  }
  return "";
};

const normalizeSources = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  const text = toText(value);
  if (!text) return [];

  return text
    .split("\n")
    .map((line) =>
      stripTextPrefix(line.trim().replace(/^[-*•]\s+/, ""))
    )
    .filter(Boolean);
};

export function getGuideData(): GuideData {
  const data = raw as unknown as EditorialData;
  const guide = data.guide ?? {};

  const presentation = stripTextPrefix(
    toText(data.presentation ?? guide.presentation)
  );
  const conclusion = stripTextPrefix(
    toText(data.conclusion ?? guide.conclusion)
  );
  const notes = stripTextPrefix(toText(data.notes ?? guide.notes));
  const sources = normalizeSources(data.sources ?? guide.sources);
  const sessions = SESSION_IDS.map((id) => {
    const base = SESSIONS_EDITORIAL[id];
    const about = SESSION_ABOUT[id]?.aboutMd ?? base?.introMd ?? "";
    return {
      id,
      title: base?.title ?? "",
      theme: base?.subtitle ?? "",
      body: about,
    };
  });

  return {
    presentation,
    conclusion,
    notes,
    sources,
    sessions: sessions.length ? sessions : fallbackSessions,
  };
}
