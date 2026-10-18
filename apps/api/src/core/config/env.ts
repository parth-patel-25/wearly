import { NODE_ENVS } from "@wearly/shared/enums";

/**
 * True when the API runs a production build (`NODE_ENV=production`).
 *
 * Reading `process.env` lives here rather than in `@wearly/shared` so the
 * enums package stays bundle-safe for web/mobile consumers.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === NODE_ENVS.PRODUCTION;
}
