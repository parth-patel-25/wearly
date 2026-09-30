import { Circle, Path, Polyline, Rect } from "react-native-svg";

/**
 * The Wearly icon set.
 *
 * One 24×24 grid, 1.75 stroke, round caps and joins. Stroke-based rather than
 * filled, so a single set reads at every size without a second weight.
 *
 * Filled twins are the exception, and only where a control has to read as *on*:
 * the favourite heart, and the four tab-bar glyphs, where "which tab am I in" has
 * to survive at 18px. A filled twin is the `<name>-filled` of the same shape, so a
 * caller switches state by swapping the name rather than by restyling the icon —
 * `Icon` has no `filled` prop, and adding one would put a fill decision in every
 * caller's hands.
 *
 * Where a filled twin has an interior detail — a doorway, a compass needle — the
 * detail is cut out with `fillRule="evenodd"` rather than painted in a second
 * colour. `react-native-svg` cannot ask what is behind the icon, so a knockout is
 * the only version that stays correct on a card, a brand panel or the tab pill.
 *
 * Glyphs take the resolved colour rather than `currentColor`: `react-native-svg`
 * cannot inherit a colour from an ordinary React Native view, so passing it in is
 * the only way an icon re-themes with the rest of the app.
 */

export type Glyph = (color: string) => React.ReactNode;

const STROKE = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.75,
} as const;

const stroke = (color: string) => ({ ...STROKE, stroke: color });

/** A filled shape, with its interior details knocked out. */
const filled = (color: string) => ({
  fill: color,
  fillRule: "evenodd" as const,
  stroke: color,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  /** Thinner than the outline weight: a filled edge needs less ink. */
  strokeWidth: 1.5,
});

export const GLYPHS = {
  "arrow-left": (c) => (
    <>
      <Path d="M19 12H5" {...stroke(c)} />
      <Polyline points="12 19 5 12 12 5" {...stroke(c)} />
    </>
  ),
  "arrow-right": (c) => (
    <>
      <Path d="M5 12h14" {...stroke(c)} />
      <Polyline points="12 5 19 12 12 19" {...stroke(c)} />
    </>
  ),
  bag: (c) => (
    <>
      <Path d="M6 7h12l1 13H5L6 7Z" {...stroke(c)} />
      <Path d="M9 10V6a3 3 0 0 1 6 0v4" {...stroke(c)} />
    </>
  ),
  "bag-filled": (c) => (
    <>
      {/* Solid body, handle left as a wire: the arc sits above the bag so it
          still reads, and the part over the body is the same colour. */}
      <Path d="M6 7h12l1 13H5L6 7Z" {...filled(c)} />
      <Path d="M9 10V6a3 3 0 0 1 6 0v4" {...stroke(c)} />
    </>
  ),
  calendar: (c) => (
    <>
      <Rect height="17" rx="3" width="18" x="3" y="5" {...stroke(c)} />
      <Path d="M16 2v4M8 2v4M3 10h18" {...stroke(c)} />
    </>
  ),
  camera: (c) => (
    <>
      <Path
        d="M14.5 4h-5L8 6.5H5a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3L14.5 4Z"
        {...stroke(c)}
      />
      <Circle cx="12" cy="13" r="3.5" {...stroke(c)} />
    </>
  ),
  check: (c) => <Polyline points="20 6 9 17 4 12" {...stroke(c)} />,
  "chevron-down": (c) => <Polyline points="6 9 12 15 18 9" {...stroke(c)} />,
  "chevron-left": (c) => <Polyline points="15 18 9 12 15 6" {...stroke(c)} />,
  "chevron-right": (c) => <Polyline points="9 18 15 12 9 6" {...stroke(c)} />,
  clock: (c) => (
    <>
      <Circle cx="12" cy="12" r="9" {...stroke(c)} />
      <Path d="M12 7v5l3.5 2" {...stroke(c)} />
    </>
  ),
  close: (c) => (
    <>
      <Path d="M18 6 6 18" {...stroke(c)} />
      <Path d="m6 6 12 12" {...stroke(c)} />
    </>
  ),
  compass: (c) => (
    <>
      <Circle cx="12" cy="12" r="9" {...stroke(c)} />
      <Path d="m15.8 8.2-2 5.6-5.6 2 2-5.6 5.6-2Z" {...stroke(c)} />
    </>
  ),
  "compass-filled": (c) => (
    /* Solid ring with the needle knocked out, so the needle reads at 18px
       without needing a second colour behind it. */
    <Path
      d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18ZM15.8 8.2l-2 5.6-5.6 2 2-5.6 5.6-2Z"
      {...filled(c)}
    />
  ),
  heart: (c) => (
    <Path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      {...stroke(c)}
    />
  ),
  "heart-filled": (c) => (
    <Path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      {...filled(c)}
    />
  ),
  home: (c) => (
    <>
      <Path
        d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z"
        {...stroke(c)}
      />
      <Path d="M9.5 21v-6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6" {...stroke(c)} />
    </>
  ),
  "home-filled": (c) => (
    /* The doorway is the second subpath: evenodd turns the overlap into a hole
       that opens through the bottom edge, which is what makes it a door and not
       a window. The stroke on it doubles as the door frame. */
    <Path
      d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9ZM9.5 21v-6a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6Z"
      {...filled(c)}
    />
  ),
  lock: (c) => (
    <>
      <Rect height="11" rx="2.5" width="18" x="3" y="10" {...stroke(c)} />
      <Path d="M7.5 10V7a4.5 4.5 0 0 1 9 0v3" {...stroke(c)} />
    </>
  ),
  "map-pin": (c) => (
    <>
      <Path
        d="M20 10.5c0 5.5-8 11.5-8 11.5s-8-6-8-11.5a8 8 0 0 1 16 0Z"
        {...stroke(c)}
      />
      <Circle cx="12" cy="10.5" r="2.75" {...stroke(c)} />
    </>
  ),
  plus: (c) => (
    <>
      <Path d="M5 12h14" {...stroke(c)} />
      <Path d="M12 5v14" {...stroke(c)} />
    </>
  ),
  search: (c) => (
    <>
      <Circle cx="11" cy="11" r="7" {...stroke(c)} />
      <Path d="m16.5 16.5 4.5 4.5" {...stroke(c)} />
    </>
  ),
  shield: (c) => (
    <Path
      d="M20 12.5c0 5-3.5 7.5-7.7 8.95a1 1 0 0 1-.6 0C7.5 20 4 17.5 4 12.5V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1v6.5Z"
      {...stroke(c)}
    />
  ),
  shirt: (c) => (
    <Path
      d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 1.99.8L6 9v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9l1.15.96a1 1 0 0 0 1.99-.8l.58-3.47a2 2 0 0 0-1.34-2.23Z"
      {...stroke(c)}
    />
  ),
  sliders: (c) => (
    <>
      <Path
        d="M4 21v-6M4 11V3M12 21v-9M12 8V3M20 21v-4M20 13V3"
        {...stroke(c)}
      />
      <Path d="M1.5 15h5M9.5 8h5M17.5 17h5" {...stroke(c)} />
    </>
  ),
  sparkles: (c) => (
    <>
      <Path
        d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z"
        {...stroke(c)}
      />
      <Path
        d="M18.5 15.5 19.5 18l2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"
        {...stroke(c)}
      />
    </>
  ),
  truck: (c) => (
    <>
      <Path d="M1 5h14v11H1zM15 9h4l3 3v4h-7V9Z" {...stroke(c)} />
      <Circle cx="6" cy="18.5" r="2.25" {...stroke(c)} />
      <Circle cx="18" cy="18.5" r="2.25" {...stroke(c)} />
    </>
  ),
  user: (c) => (
    <>
      <Path
        d="M20 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19.5V21"
        {...stroke(c)}
      />
      <Circle cx="12" cy="7.5" r="4" {...stroke(c)} />
    </>
  ),
  "user-filled": (c) => (
    <>
      {/* Head as a path rather than a <Circle> so both parts can share `filled`
          without a second element type. The body's `Z` closes it along y=21. */}
      <Path d="M12 3.5a4 4 0 1 0 0 8 4 4 0 1 0 0-8Z" {...filled(c)} />
      <Path
        d="M20 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-7A4.5 4.5 0 0 0 4 19.5V21Z"
        {...filled(c)}
      />
    </>
  ),
} as const satisfies Record<string, Glyph>;

export type IconName = keyof typeof GLYPHS;
