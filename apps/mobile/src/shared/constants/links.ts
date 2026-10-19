/**
 * Support and legal destinations.
 *
 * Read from `EXPO_PUBLIC_*` so the URLs live in the environment, not in the
 * source. None are configured in this build, so every value is `null` and the
 * Profile screen omits the row rather than linking to a placeholder. Set the
 * variables in `apps/mobile/.env` (documented in `.env.example`) to turn the
 * rows on.
 *
 * The product spec forbids inventing an official policy URL or a support
 * address. An unset value must therefore never fall back to a guessed one —
 * silence is the honest state, a fake link is not.
 */

const readUrl = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

export const SUPPORT_EMAIL = readUrl(process.env.EXPO_PUBLIC_SUPPORT_EMAIL);
export const PRIVACY_URL = readUrl(process.env.EXPO_PUBLIC_PRIVACY_URL);
export const TERMS_URL = readUrl(process.env.EXPO_PUBLIC_TERMS_URL);
