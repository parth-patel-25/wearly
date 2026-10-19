import Constants from "expo-constants";

/**
 * App identity, read from the installed build rather than duplicated.
 *
 * `expo-constants` resolves `expoConfig` from `app.json` at build time, so the
 * version the UI shows is the version actually installed. When the config is
 * unavailable — an unusual runtime, a test harness — it resolves to `null` and
 * the caller hides the row rather than printing "undefined".
 */

export const APP_NAME = "Wearly";

export const APP_VERSION: string | null = Constants.expoConfig?.version ?? null;
