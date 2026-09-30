import { Pressable, View } from "react-native";

import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { AnimatedPressable, usePressScale } from "./motion";
import { Text } from "./text";

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

/** Inset from the screen edges, and the gap between the pill and the bottom. */
const GUTTER = "px-4";
const LIFT = "pt-2 pb-3";

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <View className={`bg-background ${GUTTER} ${LIFT}`}>
      <View className="flex-row items-center gap-1 rounded-pill border border-border bg-card px-2 py-2 shadow-float">
        {TAB_KEYS.map((key) => (
          <TabItem
            active={active === key}
            key={key}
            onPress={() => onSelect(key)}
            tab={key}
          />
        ))}
      </View>
    </View>
  );
}

interface TabItemProps {
  active: boolean;
  onPress: () => void;
  tab: TabKey;
}

function TabItem({ active, onPress, tab }: TabItemProps) {
  const emphasised = tab === "list";
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.9);

  if (emphasised) {
    return (
      <AnimatedPressable
        accessibilityLabel={LABELS[tab]}
        accessibilityRole="button"
        className="mx-1 size-12 items-center justify-center self-center rounded-pill bg-primary"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={animatedStyle}
      >
        <Icon name={ICONS[tab]} size="md" tone="primary-foreground" />
      </AnimatedPressable>
    );
  }

  return (
    <Pressable
      accessibilityLabel={LABELS[tab]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className="flex-1 items-center gap-1 py-1"
      onPress={onPress}
    >
      <Icon
        name={active ? ICONS_ACTIVE[tab] : ICONS[tab]}
        size="sm"
        tone={active ? "primary" : "muted-foreground"}
      />
      <Text tone={active ? "primary" : "muted-foreground"} variant="caption">
        {LABELS[tab]}
      </Text>
    </Pressable>
  );
}
