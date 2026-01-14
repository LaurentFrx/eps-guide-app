// Versioning: PATCH (2.0.1) small UI/text/bugfix, MINOR (2.1.0) new visible feature, MAJOR (3.0.0) structural revamp.
export const APP_VERSION = "2.0.0";
// Icon cache busting: bump only when icons/manifest assets change.
export const ICON_V = "2";

export const BUILD_TIME =
  process.env.NEXT_PUBLIC_BUILD_TIME ??
  process.env.VERCEL_BUILD_TIME ??
  process.env.BUILD_TIME ??
  null;

export const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
export const COMMIT_REF = process.env.VERCEL_GIT_COMMIT_REF ?? null;
