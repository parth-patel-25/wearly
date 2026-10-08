/**
 * Splash choreography, in one place.
 *
 * Milliseconds from the moment the splash mounts. The full performance runs
 * ~2750ms: a clean background beat, a slow left-to-right fabric wipe over
 * the mark, the flourish settling last, the wordmark and tagline arriving
 * quietly, a short hold, then a calm crossfade out.
 *
 * Feature-level numbers, not design tokens — they choreograph one screen.
 * The curve still comes from the shared ease-out token at the call site.
 */

export const SPLASH_TIMING = {
  /** Clean background before anything moves. */
  backgroundDelay: 200,
  /** Crossfade into the app. */
  exitDuration: 300,
  /** Vivid flourish settling into place. */
  flourishDelay: 1300,
  flourishDuration: 300,
  /** Completed logo held for recognition. */
  holdUntil: 2450,
  /** Veil wipe revealing the W + lower leaf, left -> center -> right. */
  markRevealDelay: 200,
  markRevealDuration: 1100,
  /** Barely-there settle once the whole mark is visible (critically damped). */
  settleDelay: 1450,
  /** Tagline whispering in last. */
  taglineDelay: 1950,
  taglineDuration: 350,
  /** Wordmark rising beneath the symbol. */
  wordmarkDelay: 1650,
  wordmarkDuration: 350,
} as const;

/** Full performance length, including the exit fade. */
export const SPLASH_TOTAL_MS = 2750;

/** Reduced-motion path: background, composed mark fade, wordmark, home. */
export const SPLASH_REDUCED_MS = 500;
export const SPLASH_REDUCED_FADE_MS = 400;
