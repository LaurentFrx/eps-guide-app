import {
  SESSIONS_BASE,
  SESSION_IDS,
  type SessionBase,
  type SessionId,
} from "@/lib/editorial/sessionsBase";
import { SESSION_ABOUT } from "@/lib/editorial/sessions.generated";

export type SessionEditorial = SessionBase & {
  introMd: string;
  extraMd: string;
};

export const SESSIONS_EDITORIAL: Record<SessionId, SessionEditorial> =
  SESSION_IDS.reduce((acc, id) => {
    const base = SESSIONS_BASE[id];
    const about = SESSION_ABOUT[id]?.aboutMd ?? "";
    const extra = SESSION_ABOUT[id]?.extraMd ?? "";
    acc[id] = {
      ...base,
      introMd: about,
      extraMd: extra,
    };
    return acc;
  }, {} as Record<SessionId, SessionEditorial>);

export { SESSION_IDS, type SessionId };
