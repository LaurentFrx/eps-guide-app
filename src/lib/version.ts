export const APP_VERSION = "0.2.2";

export const BUILD_TIME =
  process.env.NEXT_PUBLIC_BUILD_TIME ??
  process.env.VERCEL_BUILD_TIME ??
  process.env.BUILD_TIME ??
  null;

export const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
export const COMMIT_REF = process.env.VERCEL_GIT_COMMIT_REF ?? null;
