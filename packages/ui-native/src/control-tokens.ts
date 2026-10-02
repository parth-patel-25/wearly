/**
 * Shared control state tokens.
 *
 * The brand rose is one signal, not three: a primary button, a selected chip and
 * a primary badge must all be filled with the same `--wearly-primary`, or the
 * product ends up with two different "pinks mean chosen" and a user cannot trust
 * either. Spelling those three class strings separately in each component is how
 * they drift, so the pair lives here and every control reads it.
 *
 * `primary` is deepened to `#C54B75` in **both** themes specifically so white
 * text clears AA on it. `--wearly-brand` (#E86A93) is the decorative pink and
 * deliberately never fills a control carrying text — white on it is 3.04:1.
 */

import type { Tone } from "./tone";

export const CONTROL_PRIMARY = {
  /** Pressed fill. A press darkens, it never shifts colour. */
  pressed: "active:bg-primary/85",
  surface: "bg-primary",
  tone: "primary-foreground",
} as const satisfies { pressed: string; surface: string; tone: Tone };

export const CONTROL_SURFACE = {
  pressed: "active:bg-muted",
  surface: "bg-card",
  tone: "foreground",
} as const satisfies { pressed: string; surface: string; tone: Tone };
