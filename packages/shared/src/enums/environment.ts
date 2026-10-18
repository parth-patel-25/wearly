/**
 * Runtime environment names.
 *
 * Shared so the API (and any future server code) compares against a named
 * member instead of a bare `"production"` string. Deliberately just constants:
 * reading `process.env` stays in the app, so this module is safe to import from
 * web/mobile bundles too.
 */
export const NODE_ENVS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export type NodeEnv = (typeof NODE_ENVS)[keyof typeof NODE_ENVS];
