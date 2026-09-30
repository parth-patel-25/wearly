import type { Href } from "expo-router";

/**
 * Routes.
 *
 * Every path lives here. Screens import the constant and never type a string, so
 * a rename is one edit and a typo is a compile error rather than a blank screen
 * someone discovers by tapping around.
 *
 * The return types on the dynamic helpers are template-literal types rather than
 * `string`, so expo-router's generated route types still check them. Dropping the
 * annotation to plain `string` silently disables that checking.
 */

export const ROUTES = {
  checkout: "/rent/checkout",
  confirmed: "/rent/confirmed",
  dates: "/rent/dates",
  discover: "/(tabs)/discover",
  home: "/(tabs)",
  list: "/(tabs)/list",
  product: (pieceId: string): `/product/${string}` => `/product/${pieceId}`,
  profile: "/(tabs)/profile",
  rentals: "/(tabs)/rentals",
  splash: "/splash",
  welcome: "/welcome",
} as const satisfies Record<string, Href | ((id: string) => Href)>;

/** Typed navigation target for the dates screen, which needs a query param. */
export const datesFor = (pieceId: string) =>
  ({ params: { pieceId }, pathname: ROUTES.dates }) as const;

/** The five bottom-navigation destinations, in order. */
export const TABS = [
  "index",
  "discover",
  "list",
  "rentals",
  "profile",
] as const;
export type TabName = (typeof TABS)[number];
