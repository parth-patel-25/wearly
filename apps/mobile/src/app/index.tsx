import { ROUTES } from "@core/routing/routes";
import { Redirect } from "expo-router";

/**
 * Boot gate.
 *
 * The first route is not a screen — it decides which screen is the first screen.
 * On a real app that decision comes from an onboarding flag and a session; here
 * it always leads to the splash, which then routes onwards. Keeping the decision
 * in one place means the rest of the app never has to ask "is this a new user?".
 */
export default function Index() {
  return <Redirect href={ROUTES.splash} />;
}
