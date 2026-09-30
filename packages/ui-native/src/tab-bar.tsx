import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { View } from "react-native";
import type { IconName } from "./icon-glyphs";
import type { TabFrame } from "./tab-bar-indicator";
import { TabBarIndicator } from "./tab-bar-indicator";
import { TabItem } from "./tab-bar-item";

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
 * The centre action is emphasised because publishing clothing is a first-class
 * thing you can do on Wearly, not a hidden menu item; the emphasis is a filled
 * rose pill, which is the strongest signal available without adding a floating
 * action button on top of a bar.
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

/**
 * The one tab that is an action rather than a destination. Named here rather than
 * inlined at the call site so "which tab is special" has a single answer, and so
 * `TabItem` can stay presentational.
 */
const EMPHASISED: TabKey = "list";

const ICONS: Record<TabKey, IconName> = {
  discover: "compass",
  home: "home",
  list: "plus",
  profile: "user",
  rentals: "bag",
};

/**
 * The active twin of each icon. Outline alone says "here are five destinations";
 * a filled glyph says "you are here", which is the one piece of state the tab
 * bar has to communicate. It survives at 18px in a way that a bolder stroke does
 * not, and it does not lean on colour alone — `accessibilityState.selected`
 * still carries the same fact to assistive technology.
 *
 * `list` is the emphasised centre action rather than a destination, so it has no
 * filled twin and never changes.
 */
const ICONS_ACTIVE: Record<TabKey, IconName> = {
  discover: "compass-filled",
  home: "home-filled",
  list: "plus",
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

interface TabFrames {
  frames: Partial<Record<TabKey, TabFrame>>;
  onLayoutFor: Record<TabKey, (event: LayoutChangeEvent) => void>;
}

/**
 * Where every tab sits inside the bar.
 *
 * Measured, not computed. The five tabs are deliberately not equal width — the
 * centre action is a fixed 48px circle plus margins, and the other four share
 * whatever is left — so "tab index times width divided by five" is wrong for at
 * least one tab, and wrong in a way that only appears at one screen width or in
 * one language. Asking each item where it landed is the only version that stays
 * true.
 *
 * `onLayout` reports relative to the row, which is precisely the space the
 * indicator animates in, so no second measuring pass is needed.
 */
function useTabFrames(): TabFrames {
  const [frames, setFrames] = useState<Partial<Record<TabKey, TabFrame>>>({});

  const measure = useCallback((tab: TabKey, frame: TabFrame) => {
    setFrames((previous) => {
      const existing = previous[tab];
      // Layout fires on every parent re-render, rotation and keyboard show. Only a
      // real change is a state update, or the indicator would re-animate forever.
      if (existing?.width === frame.width && existing.x === frame.x) {
        return previous;
      }
      return { ...previous, [tab]: frame };
    });
  }, []);

  // One stable handler per tab, built once. A fresh `onLayout` identity each
  // render re-fires layout each render, and each firing is a potential update.
  const onLayoutFor = useMemo(
    () =>
      Object.fromEntries(
        TAB_KEYS.map((tab) => [
          tab,
          ({ nativeEvent }: LayoutChangeEvent) => {
            const { width, x } = nativeEvent.layout;
            measure(tab, { width, x });
          },
        ])
      ) as Record<TabKey, (event: LayoutChangeEvent) => void>,
    [measure]
  );

  return { frames, onLayoutFor };
}

/** Inset from the screen edges, and the gap between the pill and the bottom. */
const GUTTER = "px-4";
const LIFT = "pt-2 pb-3";

export function TabBar({ active, onSelect }: TabBarProps) {
  const { frames, onLayoutFor } = useTabFrames();

  return (
    <View className={`bg-background ${GUTTER} ${LIFT}`}>
      <View className="flex-row items-center gap-1 rounded-pill border border-border bg-card px-2 py-2 shadow-float">
        {/* First child, so the indicator paints behind every tab. */}
        <TabBarIndicator frame={frames[active]} />

        {TAB_KEYS.map((key) => (
          <TabItem
            active={active === key}
            activeIcon={ICONS_ACTIVE[key]}
            emphasised={key === EMPHASISED}
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
