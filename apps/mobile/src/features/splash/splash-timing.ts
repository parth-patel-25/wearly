/**
 * Splash choreography, in one place.
 *
 * Milliseconds from the moment the splash mounts. The full performance runs
 * ~1800ms: a clean background beat, a left-to-right fabric wipe over the
 * mark, the flourish settling last, the wordmark and tagline arriving
 * quietly, a short hold, then a calm crossfade out.
 *
 * Feature-level numbers, not design tokens — they choreograph one screen.
 * The curve still comes from the shared ease-out token at the call site.
 */

export const SPLASH_TIMING = {
  /** Clean background before anything moves. */
  backgroundDelay: 150,
  /** Crossfade into the app. */
  exitDuration: 250,
  /** Vivid flourish settling into place. */
  flourishDelay: 650,
  flourishDuration: 200,
  /** Completed logo held for recognition. */
  holdUntil: 1550,
  /** Veil wipe revealing the W + lower leaf, left -> center -> right. */
  markRevealDelay: 150,
  markRevealDuration: 500,
  /** Barely-there settle once the whole mark is visible (critically damped). */
  settleDelay: 800,
  /** Tagline whispering in last. */
  taglineDelay: 1150,
  taglineDuration: 250,
  /** Wordmark rising beneath the symbol. */
  wordmarkDelay: 950,
  wordmarkDuration: 250,
} as const;

/** Full performance length, including the exit fade. */
export const SPLASH_TOTAL_MS = 1800;

/** Reduced-motion path: background, composed mark fade, wordmark, home. */
export const SPLASH_REDUCED_MS = 500;
export const SPLASH_REDUCED_FADE_MS = 400;
