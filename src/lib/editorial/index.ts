import raw from "@/data/editorial.fr.json";
import type {
  EditorialData,
  EditorialSession,
  GuideData,
  GuideSession,
} from "@/lib/editorial/schema";

const SESSION_IDS = ["S1", "S2", "S3", "S4", "S5"] as const;

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

const normalizeSessionId = (value: string): string => {
  const trimmed = value.trim().toUpperCase();
  if (/^S[1-5]$/.test(trimmed)) return trimmed;
  if (/^[1-5]$/.test(trimmed)) return `S${trimmed}`;
  return trimmed;
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

const normalizeSession = (
  id: string,
  session: EditorialSession | undefined
): GuideSession => ({
  id: normalizeSessionId(id),
  title: stripTextPrefix(toText(session?.title)),
  theme: stripTextPrefix(toText(session?.theme)),
  body: stripTextPrefix(toText(session?.body)),
});

const normalizeSessions = (value: unknown): GuideSession[] => {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const entry = item as EditorialSession & { id?: unknown; session?: unknown };
        const idValue =
          typeof entry.id === "string"
            ? entry.id
            : typeof entry.session === "string"
              ? entry.session
              : SESSION_IDS[index] ?? "";
        return normalizeSession(idValue, entry);
      })
      .filter((session): session is GuideSession => Boolean(session?.id));
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, EditorialSession>);
    return entries
      .map(([id, session]) => normalizeSession(id, session))
      .filter((session) => session.id.length > 0)
      .sort((a, b) => {
        const indexA = SESSION_IDS.indexOf(a.id as (typeof SESSION_IDS)[number]);
        const indexB = SESSION_IDS.indexOf(b.id as (typeof SESSION_IDS)[number]);
        if (indexA === -1 && indexB === -1) return a.id.localeCompare(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  }

  return [];
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
  const sources = normalizeSources(data.sources ?? guide.sources);
  const sessions = normalizeSessions(data.sessions ?? guide.sessions);

  return {
    presentation,
    conclusion,
    sources,
    sessions: sessions.length ? sessions : fallbackSessions,
  };
}
