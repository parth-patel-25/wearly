import { AuthScreen } from "@features/auth/components/auth-screen";
import type { AuthTab } from "@features/auth/components/segmented-tabs";
import { useLocalSearchParams } from "expo-router";

/**
 * The auth route.
 *
 * Carries one param — which tab to open on — and hands it to the screen,
 * which owns the tab from there. A bad or missing param falls back to login
 * rather than blanking the screen.
 */
export default function AuthRoute() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab: AuthTab = tab === "signup" ? "signup" : "login";
  return <AuthScreen initialTab={initialTab} />;
}
