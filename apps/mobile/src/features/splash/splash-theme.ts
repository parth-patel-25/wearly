/**
 * Splash palette.
 *
 * Gradient stop colours for the flow mark, per theme. Geometry (viewBox,
 * coordinates, path data) is fixed in the generated `wearly-flow-mark` —
 * only stops change. Light reuses the approved asset stops verbatim; dark is
 * an intentional lightening of the same rose family (never white text on
 * vivid pink, never an inverted look).
 */

/** Stop triples, in gradient order, keyed by the asset's gradient ids. */
export interface FlowMarkPalette {
  "wearly-leaf-bottom-gradient": [string, string, string];
  "wearly-leaf-top-gradient": [string, string, string];
  "wearly-w-gradient": [string, string, string];
}

/** Approved asset stops, verbatim (`assets/brand/wearly-flow-mark.svg`). */
export const FLOW_MARK_LIGHT: FlowMarkPalette = {
  "wearly-leaf-bottom-gradient": ["#F19BB8", "#F39DBA", "#F7B0C8"],
  "wearly-leaf-top-gradient": ["#C2476D", "#DE6A90", "#F08BAA"],
  "wearly-w-gradient": ["#C6436C", "#BA3C63", "#EA729B"],
};

/**
 * Dark variant: the same rose family lifted so the mark glows softly on
 * `#171316` instead of muddying into it. Hue preserved, geometry untouched.
 */
export const FLOW_MARK_DARK: FlowMarkPalette = {
  "wearly-leaf-bottom-gradient": ["#EFB9CB", "#F3C6D5", "#F8DBE4"],
  "wearly-leaf-top-gradient": ["#E89AB4", "#F0A9C0", "#F7C3D4"],
  "wearly-w-gradient": ["#E7A2B8", "#D6879F", "#F6C2D4"],
};
