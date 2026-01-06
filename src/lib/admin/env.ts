export const ADMIN_COOKIE_NAME = "eps_admin";
export const ADMIN_TOKEN_TTL = "7d";

export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "";
export const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? "";

export const KV_REST_API_URL = process.env.KV_REST_API_URL ?? "";
export const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN ?? "";
export const KV_REST_API_READ_ONLY_TOKEN =
  process.env.KV_REST_API_READ_ONLY_TOKEN ?? "";

export const isKvConfigured = () =>
  Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);

export const isAdminConfigured = () =>
  Boolean(ADMIN_PASSWORD_HASH && ADMIN_JWT_SECRET && isKvConfigured());
