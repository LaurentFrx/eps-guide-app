import packageJson from "../../package.json";

const rawVersion =
  typeof packageJson?.version === "string" ? packageJson.version : "0.0.0";

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? rawVersion;

const resolveCommit = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return "dev";
  return trimmed.slice(0, 7);
};

const rawCommit =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  process.env.GIT_COMMIT_SHA ??
  null;

export const APP_COMMIT = resolveCommit(rawCommit);
export const APP_VERSION_LABEL = `v${APP_VERSION} (${APP_COMMIT})`;
