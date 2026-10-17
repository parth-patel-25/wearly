import type {
  LoginInput,
  SignUpInput,
} from "@features/auth/validations/auth.schema";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useGoogleSignIn } from "./use-google-sign-in";

export type SocialProvider = "facebook" | "google";

/**
 * Real auth actions for the forms and social buttons.
 *
 * Email sign-in resolves into the SecureStore-backed cookie and pops back to
 * whatever screen asked; a soft-deleted or unverified account comes back as a
 * server error message and toasts it. Sign-up does *not* navigate — with
 * `requireEmailVerification` the account exists but cannot sign in yet, so
 * the success toast is the instruction to check email.
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
      toast.show(error.message ?? "Could not sign in", "error");
      return;
    }
    const name = data?.user.name;
    toast.show(name ? `${greeting}, ${name}` : greeting, "success");
    router.back();
  };

  const signUp = async (values: SignUpInput) => {
    const { error } = await authClient.signUp.email({
      callbackURL: "wearly://verify-email",
      email: values.email,
      name: values.name,
      password: values.password,
    });
    if (error) {
      toast.show(error.message ?? "Could not create the account", "error");
      return;
    }
    toast.show(`Check your email to verify ${values.email}`, "success");
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
    toast.show("Welcome to Wearly", "success");
    router.back();
  };

  return { signIn, signUp, socialSignIn };
}
