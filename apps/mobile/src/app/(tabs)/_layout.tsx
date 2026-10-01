import { ROUTES } from "@core/routing/routes";
import type { TabKey } from "@wearly/ui-native/tab-bar";
import { TabBar } from "@wearly/ui-native/tab-bar";
import { Tabs, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { View } from "react-native";

/**
 * The tab shell.
 *
 * `expo-router` owns the navigator — history, deep links, state restoration —
 * and `TabBar` owns the pixels. Splitting it this way makes the navigation bar a
 * design-system component like any other, rather than a pile of platform-specific
 * configuration.
 *
 * Headers are off everywhere. Every screen draws its own, because Wearly's
 * screens lead with large image-led headers that a platform title bar fights.
 *
 * The `tabBar` prop's type is derived from `Tabs` rather than imported from
 * `@react-navigation/bottom-tabs`, so this file does not need to depend on a
 * package it does not declare.
 */

type TabBarProps = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;

const TAB_ROUTE: Record<string, TabKey> = {
  discover: "discover",
  /**
   * The editorial Home variant shares the Home tab. Mapping it here is what
   * keeps the tab highlighted while `home-v2` is open, instead of falling back
   * to the first tab and implying the user had navigated away.
   */
  "home-v2": "home",
  index: "home",
  list: "list",
  profile: "profile",
};

const NAVIGATE: Record<TabKey, string> = {
  discover: ROUTES.discover,
  home: ROUTES.home,
  list: ROUTES.list,
  profile: ROUTES.profile,
};

/**
 * Rendered by expo-router as the tab bar. Named in PascalCase so it is
 * unambiguously a component — that is what lets the router hook below be called
 * legally.
 */
function TabBarRenderer({ state }: Parameters<TabBarProps>[0]) {
  const router = useRouter();
  const current = useMemo(() => {
    const name = state.routes[state.index]?.name ?? "index";
    return TAB_ROUTE[name] ?? "home";
  }, [state.index, state.routes]);

  return (
    <TabBar
      active={current}
      onSelect={(tab) => {
        router.navigate(NAVIGATE[tab] as never);
      }}
    />
  );
}

export default function TabsLayout() {
  return (
    // The one place the tab screens get their top safe-area inset, rather than
    // each of the five guessing a `pt-*` number that is wrong on a notched phone.
    // `pt-safe` is the raw inset, so a screen's own `pt-6` becomes the *gap*
    // between the status bar and its header instead of doubling as the inset.
    //
    // `bg-background` on the strip matters: without it the inset area would be
    // whatever the navigator defaults to, and the top of the app would change
    // colour between themes.
    <View className="flex-1 bg-background pt-safe">
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBarRenderer {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="home-v2" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="list" />
        {/* Rentals is registered but not in the bar. It stays routable and
            deep-linkable; it is reached from Home or a product card instead. See
            `docs/DESIGN_SYSTEM.md` §10. */}
        <Tabs.Screen name="rentals" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
