const FALLBACK_VERSION = "dev";

export const ASSET_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  process.env.NEXT_PUBLIC_ASSET_VERSION ??
  FALLBACK_VERSION;

export const withAssetVersion = (path: string) => {
  if (!path) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${ASSET_VERSION}`;
};
