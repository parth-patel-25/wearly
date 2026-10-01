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
   * The tab bar's travelling active circle. Damped to the point of being nearly
   * critical — the overshoot is there to take the hard edge off the landing, not
   * to be seen.
   *
   * This is a different argument from the one that removed `tab` and
   * `tabIndicator`. Those described a *rounded rectangle* sliding the width of the
   * bar: a decelerating curve is right for a shape that is not an object, and a
   * capsule's overshoot reads as wobble because a capsule has no centre of mass
   * for the eye to follow. The circle that replaced it is an object — a discrete
   * disc with a glyph in it that lifts clear of the bar — so it gets the same
   * treatment as the favourite heart rather than a timing curve.
   *
   * Tighter than `hero` deliberately: a hero expansion happens once and can be
   * watched, while the bar is a control that gets re-tapped constantly. Anything
   * slower than this reads as lag on the fourth tap of a session.
   */
  tab: { damping: 26, mass: 0.7, stiffness: 260 },
} as const;

export type SpringName = keyof typeof SPRING;
