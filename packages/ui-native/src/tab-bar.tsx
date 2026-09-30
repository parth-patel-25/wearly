import { View } from "react-native";
import type { IconName } from "./icon-glyphs";
import type { TabFrame } from "./tab-bar-indicator";
import { TabBarIndicator } from "./tab-bar-indicator";
import { TabItem } from "./tab-bar-item";
import type { TabMetrics } from "./use-tab-frames";
import { useTabFrames } from "./use-tab-frames";

/**
 * The bottom navigation.
 *
 * A floating pill rather than a full-bleed bar: the container is inset from the
 * screen edges, lifted off the bottom edge by a fixed gap, and carries a shadow.
 * It reads as one object sitting on the screen rather than as a strip the screen
 * is cut off by, which is the register a fashion marketplace wants — the
 * navigation is furniture, not a frame.
 *
 * Two consequences of floating it, both deliberate:
 *
 * - The top border is gone. A rule that ran the full width of the screen was
 *   what made the old bar feel like a division; the pill's own border and
 *   `shadow-float` separate it instead, which is what the elevation scale
 *   reserves shadows for.
 * - No bottom safe-area padding here. The navigator wraps this component in a
 *   container that already applies `insets.bottom`, so adding `pb-safe-*` would
 *   double the gap on a device with a home indicator. The fixed `pb-3` below is
 *   the *design* gap above that inset, not a substitute for it.
 *
 * The horizontal and vertical padding below is the bar's own proportion. It is
 * not a lever on the active pill: the pill fills its tab's slot exactly, because
 * a capsule inset inside every slot reads as five separate compartments rather
 * than as one bar with one object in it.
 *
 * The centre action used to be a fixed 48px filled circle with no label, wedged
 * between the other four. It is gone: listing a piece is a destination, not
 * something you do from wherever you happen to be standing, so it is a tab like
 * the other four. All five are `flex-1` slots now, which means the bar's geometry
 * no longer depends on one tab being a different shape from its neighbours.
 *
 * `accessibilityState.selected` carries the active tab, so the current location is
 * never communicated by colour alone.
 */

export const TAB_KEYS = [
  "home",
  "discover",
  "list",
  "rentals",
  "profile",
] as const;
export type TabKey = (typeof TAB_KEYS)[number];

const ICONS: Record<TabKey, IconName> = {
  discover: "compass",
  home: "home",
  /**
   * A hanger, not a plus. The old centre action said "add"; this one says
   * "clothing on a rail", which is what the screen is actually about — and it is
   * the same register as the other four, rather than a button wearing a nav
   * item's clothes.
   */
  list: "hanger",
  profile: "user",
  rentals: "bag",
};

/**
 * The active twin of each icon. Outline alone says "here are five destinations";
 * a filled glyph says "you are here", which is the one piece of state the tab
 * bar has to communicate. It survives at 18px in a way that a bolder stroke does
 * not, and it does not lean on colour alone — `accessibilityState.selected`
 * still carries the same fact to assistive technology.
 */
const ICONS_ACTIVE: Record<TabKey, IconName> = {
  discover: "compass-filled",
  home: "home-filled",
  list: "hanger-filled",
  profile: "user-filled",
  rentals: "bag-filled",
};

const LABELS: Record<TabKey, string> = {
  discover: "Discover",
  home: "Home",
  list: "List",
  profile: "Profile",
  rentals: "Rentals",
};

export interface TabBarProps {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
}

/**
 * The pill's width, in pixels of breathing room either side of a tab's own
 * content.
 *
 * The reason the pill is sized from the content rather than the slot is that a
 * slot-sized pill cannot change width at all: five equal `flex-1` slots all
 * measure the same, so a pill that fills its slot is a fixed-width bar sliding
 * side to side, and the horizontal resize is never actually exercised. Hugging
 * the content is what makes the pill genuinely wider under "Discover" than under
 * "Home", so the width change is real and the travel distance varies the way a
 * hand-sized thing would vary.
 *
 * 10pt either side is roughly a `space-2` plus a hair — enough that the label
 * never crowds the curve of the end cap, while still leaving a visible gap
 * between neighbouring pills.
 */
const PILL_PADDING = 10;

/**
 * The pill's target for a tab: the content's width plus padding, centred on the
 * slot.
 *
 * Clamped to the slot so it can never reach a neighbour's. On a narrow phone
 * that clamp is what stops a long translated label pushing the pill over the
 * next tab's icon — the pill gives up its padding rather than its boundary.
 */
function pillFrameFor(metrics: TabMetrics | undefined): TabFrame | undefined {
  if (
    metrics === undefined ||
    metrics.contentWidth <= 0 ||
    metrics.slotWidth <= 0
  ) {
    return undefined;
  }
  const width = Math.min(
    metrics.contentWidth + PILL_PADDING * 2,
    metrics.slotWidth
  );
  const centre = metrics.slotX + metrics.slotWidth / 2;
  return { width, x: centre - width / 2 };
}

/** Inset from the screen edges, and the gap between the pill and the bottom. */
const GUTTER = "px-4";
const LIFT = "pt-2 pb-3";

export function TabBar({ active, onSelect }: TabBarProps) {
  const { metrics, onContentLayoutFor, onLayoutFor } =
    useTabFrames<TabKey>(TAB_KEYS);

  return (
    <View className={`bg-background ${GUTTER} ${LIFT}`}>
      {/* `px-1.5` / `py-1.5` is the bar's own proportion. The pill's *height* is
          the slot's height; only its width comes from the tab's content, so it
          varies per tab and the horizontal resize is real. */}
      <View className="flex-row items-center rounded-pill border border-border bg-card px-1.5 py-1.5 shadow-float">
        {/* First child, so the indicator paints behind every tab. */}
        <TabBarIndicator frame={pillFrameFor(metrics[active])} />

        {TAB_KEYS.map((key) => (
          <TabItem
            active={active === key}
            activeIcon={ICONS_ACTIVE[key]}
            icon={ICONS[key]}
            key={key}
            label={LABELS[key]}
            onContentLayout={onContentLayoutFor[key]}
            onLayout={onLayoutFor[key]}
            onPress={() => onSelect(key)}
          />
        ))}
      </View>
    </View>
  );
}
