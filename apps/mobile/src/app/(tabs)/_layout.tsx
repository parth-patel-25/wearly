import { ROUTES } from "@core/routing/routes";
import type { TabKey } from "@wearly/ui-native/tab-bar";
import { TabBar } from "@wearly/ui-native/tab-bar";
import { Tabs, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo } from "react";

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
  index: "home",
  list: "list",
  profile: "profile",
  rentals: "rentals",
};

const NAVIGATE: Record<TabKey, string> = {
  discover: ROUTES.discover,
  home: ROUTES.home,
  list: ROUTES.list,
  profile: ROUTES.profile,
  rentals: ROUTES.rentals,
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
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBarRenderer {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="list" />
      <Tabs.Screen name="rentals" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
