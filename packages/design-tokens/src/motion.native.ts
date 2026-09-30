/**
 * Motion, as numbers.
 *
 * `motion.css` holds the same values for CSS transitions. Reanimated animates
 * on the UI thread and cannot read a CSS custom property, so this file mirrors
 * those tokens for native code.
 *
 * These must stay in sync with `motion.css`. If you change a duration there,
 * change it here in the same commit.
 */

/** Durations in milliseconds. Mirrors `--wearly-duration-*`. */
export const DURATION = {
  /** 200ms — surface changes, cards, expand/collapse. */
  base: 200,
  /** 150ms — press feedback, focus rings, the favourite heart. */
  fast: 150,
  /** 80ms — colour flips, opacity. Nothing you should consciously notice. */
  instant: 80,
  /** 300ms — sheets, dialogs, the hero expansion. */
  slow: 300,
} as const;

export type Duration = (typeof DURATION)[keyof typeof DURATION];

/**
 * `cubic-bezier(0.16, 1, 0.3, 1)` — decelerates into rest. This is the default
 * easing for the whole product; it reads as calm rather than springy.
 */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** `cubic-bezier(0.65, 0, 0.35, 1)` — symmetric, for two-way transitions. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/**
 * Spring presets, for the handful of interactions that need overshoot to feel
 * alive: the press scale and the favourite heart.
 *
 * `damping` and `stiffness` are Reanimated's; the numbers are chosen so the
 * settle is under ~200ms. A slower spring feels sluggish on a phone.
 */
export const SPRING = {
  /** The hero expansion. Slow enough to follow, fast enough not to wait. */
  hero: { damping: 28, mass: 0.9, stiffness: 180 },
  /** The favourite heart pop. A little overshoot, still fast. */
  pop: { damping: 12, mass: 0.5, stiffness: 320 },
  /** Press feedback: 1.0 → 0.97 → 1.0. Tight, almost no overshoot. */
  press: { damping: 26, mass: 0.6, stiffness: 420 },
  /**
   * A tab's icon and label settling as it becomes active. Damping ratio ~0.83,
   * so it overshoots by about 1% and settles in ~230ms — enough to read as
   * arriving rather than snapping, far short of a bounce.
   */
  tab: { damping: 24, mass: 0.7, stiffness: 300 },
  /**
   * The bottom bar's sliding active pill. Softer than `press` and slower, and
   * still only ~1% overshoot: the pill travels the width of the bar, so any
   * real overshoot reads as wobble rather than as life. Settles in ~290ms.
   */
  tabIndicator: { damping: 22, mass: 0.8, stiffness: 200 },
} as const;

export type SpringName = keyof typeof SPRING;
