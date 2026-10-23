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
  auth: "/auth",
  checkout: "/rent/checkout",
  confirmed: "/rent/confirmed",
  dates: "/rent/dates",
  discover: "/(tabs)/discover",
  /**
   * Home is the magazine marketplace at the tab root: editorial hero,
   * categories, occasions, trending / new / looks rails, recommended grid.
   */
  home: "/(tabs)",
  list: "/(tabs)/list",
  product: (pieceId: string): `/product/${string}` => `/product/${pieceId}`,
  profile: "/(tabs)/profile",
  rentals: "/(tabs)/rentals",
  signIn: "/sign-in",
  splash: "/splash",
  verifyEmail: "/verify-email",
  welcome: "/welcome",
} as const satisfies Record<string, Href | ((id: string) => Href)>;

/** Typed navigation target for the dates screen, which needs a query param. */
export const datesFor = (pieceId: string) =>
  ({ params: { pieceId }, pathname: ROUTES.dates }) as const;

/** Typed navigation target for the auth screen, which opens on a given tab. */
export const authTab = (tab: "login" | "signup") =>
  ({ params: { tab }, pathname: ROUTES.auth }) as const;

/** Typed navigation target for the code screen, keyed to the address. */
export const verifyEmailFor = (email: string) =>
  ({ params: { email }, pathname: ROUTES.verifyEmail }) as const;

/** The four bottom-navigation destinations, in order. */
export const TABS = ["index", "discover", "list", "profile"] as const;
export type TabName = (typeof TABS)[number];
