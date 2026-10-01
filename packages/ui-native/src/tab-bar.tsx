import { View } from "react-native";

import type { IconName } from "./icon-glyphs";
import { TabBarActiveCircle } from "./tab-bar-active-circle";
import { TabItem } from "./tab-bar-item";
import type { TabMetrics } from "./use-tab-frames";
import { useTabFrames } from "./use-tab-frames";

/**
 * The bottom tab bar.
 *
 * Four equal destinations, one travelling circle, no centre action. See
 * `docs/DESIGN_SYSTEM.md` §10 for the reasoning behind the circle; this file only
 * owns the *geometry* of it, which is written out below as named constants so the
 * proportions can be adjusted in one place rather than re-derived from whatever
 * the slots happen to measure on a given phone.
 */

export const TAB_KEYS = ["home", "discover", "list", "profile"] as const;
export type TabKey = (typeof TAB_KEYS)[number];

/**
 * Outline glyphs, drawn only while a tab is *inactive*. The active glyph is drawn
 * inside the travelling circle instead — see `tab-bar-active-circle.tsx`.
 */
const ICONS: Record<TabKey, IconName> = {
  discover: "compass",
  home: "home",
  list: "hanger",
  profile: "user",
};

/** The filled twin of each glyph, carried by the circle while its tab is active. */
const ICONS_ACTIVE: Record<TabKey, IconName> = {
  discover: "compass-filled",
  home: "home-filled",
  list: "hanger-filled",
  profile: "user-filled",
};

const LABELS: Record<TabKey, string> = {
  discover: "Discover",
  home: "Home",
  list: "List",
  profile: "Profile",
};

export interface TabBarProps {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
}

/**
 * The circle's diameter.
 *
 * Fixed rather than derived from the slot, because it contains no of the tab's own
 * content — the active glyph moves *into* it. That is what removes the arithmetic
 * the old capsule was stuck with: a rounded rectangle wrapping a stacked
 * icon-over-label column has to negotiate its aspect ratio against its own
 * contents, and a square disc does not. 48pt holds a 22pt icon with room to spare.
 */
const CIRCLE = 48;

/**
 * How far the circle rises above the bar's top edge, in pixels.
 *
 * Roughly a third of the circle sits proud of the bar, which is what makes the
 * active tab read as *raised* rather than as an item inside a row. The remainder
 * overlaps the bar's own surface, so the two never look like separate objects.
 *
 * `CONTAINER`'s `pt-5` is this number's allowance in the layout: the circle is
 * painted outside the bar, so the padding has to reserve room for it or it would
 * be clipped by whatever bounds the tab shell.
 */
const CIRCLE_OVERHANG = 16;

/**
 * The outer container.
 *
 * `pb-safe-or-4` is `max(env(safe-area-inset-bottom), 1rem)`, which is the one
 * bottom-inset form this bar needs. The raw inset alone leaves a bar flush against
 * the screen edge on devices that report no inset at all, and a fixed padding
 * would then over-pad a device with a home indicator. The `max` takes whichever is
 * larger, so gesture nav, three-button nav and iPhones all get a comfortable gap
 * without a per-platform constant anywhere.
 *
 * `pt-5` reserves the circle's overhang as *gap*, not as a safe-area inset — the
 * same distinction `pt-2` was making before the circle existed.
 */
const CONTAINER = "px-3 pt-5 pb-safe-or-4";
/** The bar's own card. `py-1` sets the outer height from `SLOT_HEIGHT` below. */
const CARD =
  "flex-row items-center py-1 rounded-pill border border-border bg-card shadow-float";

/**
 * The circle's horizontal centre, from a measured slot.
 *
 * Returns `undefined` until the slot has been laid out, which is what keeps the
 * circle off screen for the one frame before anything has been measured.
 */
function circleCenterFor(metrics: TabMetrics | undefined): number | undefined {
  if (metrics === undefined || metrics.slotWidth <= 0) {
    return undefined;
  }
  return metrics.slotX + metrics.slotWidth / 2;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  const { metrics, onLayoutFor } = useTabFrames<TabKey>(TAB_KEYS);
  return (
    <View className={`bg-background ${CONTAINER}`}>
      <View className={CARD}>
        <TabBarActiveCircle
          activeIcon={ICONS_ACTIVE[active]}
          centerX={circleCenterFor(metrics[active])}
          overhang={CIRCLE_OVERHANG}
          size={CIRCLE}
        />
        {TAB_KEYS.map((key) => (
          <TabItem
            active={active === key}
            icon={ICONS[key]}
            key={key}
            label={LABELS[key]}
            onLayout={onLayoutFor[key]}
            onPress={() => onSelect(key)}
          />
        ))}
      </View>
    </View>
  );
}
