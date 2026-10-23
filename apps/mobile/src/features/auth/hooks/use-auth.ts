import { verifyEmailFor } from "@core/routing/routes";
import type {
  LoginInput,
  SignUpInput,
} from "@features/auth/validations/auth.schema";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";
import { useSession } from "@/core/providers/session-provider";
import { authClient } from "@/lib/auth-client";
import { useGoogleSignIn } from "./use-google-sign-in";

export type SocialProvider = "facebook" | "google";

const UNVERIFIED_EMAIL = /not verified|verify your email/i;

/**
 * Real auth actions for the forms and social buttons.
 *
 * Email sign-in resolves into the SecureStore-backed cookie and pops back to
 * whatever screen asked; a soft-deleted or unverified account comes back as a
 * server error message and toasts it. Sign-up pushes the code screen — with
 * `requireEmailVerification` the account exists but cannot sign in yet, and
 * the OTP is the proof instead of a link.
 *
 * Google uses the native idToken flow (`use-google-sign-in`): an ID token
 * from `expo-auth-session` is verified server-side against Google's JWKS, so
 * no browser round-trip and no client secret. Facebook still runs the system
 * browser through the Expo authorization proxy; the browser result is
 * consumed there rather than deep-linking the router, so a cancelled browser
 * must be told apart from a real session before navigating.
 */
export function useAuth() {
  const router = useRouter();
  const toast = useToast();
  const { refreshSession } = useSession();
  const { promptGoogleSignIn } = useGoogleSignIn();

  const signIn = async (
    values: Pick<LoginInput, "email" | "password" | "rememberMe">,
    greeting: string
  ) => {
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });
    if (error) {
      // `sendOnSignIn` has already emailed a fresh code for an unverified
      // account, so the useful next step is the code screen, not a toast that
      // leaves the user stuck on the password form.
      if (UNVERIFIED_EMAIL.test(error.message ?? "")) {
        toast.show("Verify your email first — we sent a fresh code.", "info");
        router.push(verifyEmailFor(values.email));
        return;
      }
      toast.show(error.message ?? "Could not sign in", "error");
      return;
    }
    // Hydrate the shared session store before navigating so the destination
    // does not flash guest state while /get-session is still in flight.
    await refreshSession();
    const name = data?.user.name;
    toast.show(name ? `${greeting}, ${name}` : greeting, "success");
    // dismissAll pops the whole auth stack (sign-in + auth) back to the tabs.
    // router.back() only pops one screen, which stranded the user on
    // /sign-in when they had gone Profile → Sign-in → Auth.
    router.dismissAll();
  };

  const signUp = async (values: SignUpInput) => {
    const { error } = await authClient.signUp.email({
      email: values.email,
      name: values.name,
      password: values.password,
    });
    if (error) {
      toast.show(error.message ?? "Could not create the account", "error");
      return;
    }
    toast.show(`We emailed a code to ${values.email}`, "success");
    router.push(verifyEmailFor(values.email));
  };

  const socialSignIn = async (provider: SocialProvider) => {
    if (provider === "google") {
      await promptGoogleSignIn();
      return;
    }
    const { error } = await authClient.signIn.social({
      callbackURL: "/",
      provider,
    });
    if (error) {
      toast.show(
        error.message ?? `Could not sign in with ${provider}`,
        "error"
      );
      return;
    }
    const { data: session } = await authClient.getSession();
    if (!session) {
      toast.show("Sign in was cancelled", "info");
      return;
    }
    // Hydrate the shared session store before navigating so the destination
    // does not flash guest state while /get-session is still in flight.
    await refreshSession();
    toast.show("Welcome to Wearly", "success");
    // dismissAll pops the whole auth stack (sign-in + auth) back to the tabs.
    router.dismissAll();
  };

  return { signIn, signUp, socialSignIn };
}
