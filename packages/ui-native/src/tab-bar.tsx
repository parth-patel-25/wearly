import { Pressable, View } from "react-native";

import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { AnimatedPressable, usePressScale } from "./motion";
import { Text } from "./text";

/**
 * The bottom navigation.
 *
 * Rounded, comfortable, minimal, slightly elevated — and the same on every
 * screen. The centre action is emphasised because publishing clothing is a
 * first-class thing you can do on Wearly, not a hidden menu item; the
 * emphasis is a filled rose pill, which is the strongest signal available
 * without adding a floating action button on top of a bar.
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

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <View className="flex-row items-center gap-1 border-border border-t bg-card px-3 pt-2 pb-3">
      {TAB_KEYS.map((key) => (
        <TabItem
          active={active === key}
          key={key}
          onPress={() => onSelect(key)}
          tab={key}
        />
      ))}
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
        name={ICONS[tab]}
        size="sm"
        tone={active ? "primary" : "muted-foreground"}
      />
      <Text tone={active ? "primary" : "muted-foreground"} variant="caption">
        {LABELS[tab]}
      </Text>
    </Pressable>
  );
}
