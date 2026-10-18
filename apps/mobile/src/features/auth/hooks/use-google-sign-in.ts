import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { useSession } from "@/core/providers/session-provider";
import { authClient } from "@/lib/auth-client";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("GoogleSignIn");
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * `webClientId` is what mints the ID token (its `aud` claim) — Google's
 * native SDK does not accept an Android client id here. It must equal the
 * API's `GOOGLE_CLIENT_ID` or Better Auth rejects the token.
 */
if (GOOGLE_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID });
}

/**
 * Native Google sign-in (Google Identity Services SDK).
 *
 * No browser and no OAuth redirect: Play Services shows the account picker
 * and returns an **ID token** directly, so this flow is immune to Google's
 * custom-URI-scheme redirect policy (the `Error 400: invalid_request` /
 * "Access blocked" wall that blocks browser flows on new Android OAuth
 * clients since Oct 2023). The token is verified server-side against
 * Google's JWKS (`issuer` + `audience = GOOGLE_CLIENT_ID`) — no client
 * secret involved. The verified token becomes a session cookie stored in
 * SecureStore by the `expoClient` plugin.
 *
 * Console prerequisites: an **Android** OAuth client (package
 * `com.parthpatel25.wearly` + the debug **SHA-1** — Play Services refuses
 * sign-in without it) and `webClientId` preferably a **Web** client ID.
 * If the API answers "Invalid id token", create a Web client and point
 * both `EXPO_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` at it.
 */
function describeError(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as { code?: unknown; message?: unknown };
    const parts: string[] = [];
    if (typeof e.code === "string" || typeof e.code === "number") {
      parts.push(`code ${e.code}`);
    }
    if (typeof e.message === "string" && e.message) {
      parts.push(e.message);
    }
    if (parts.length > 0) {
      return parts.join(" — ");
    }
  }
  return String(err);
}

export function useGoogleSignIn() {
  const router = useRouter();
  const toast = useToast();
  const { refreshSession } = useSession();

  const promptGoogleSignIn = async () => {
    if (Platform.OS !== "android") {
      toast.show(
        "Google sign-in is not available on this platform yet",
        "error"
      );
      return;
    }
    if (!GOOGLE_CLIENT_ID) {
      toast.show("Google sign-in is not configured", "error");
      return;
    }
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Clear the cached Google session so the SDK always shows the account
      // chooser instead of silently reusing the last-selected account.
      await GoogleSignin.signOut().catch(() => {
        /* no prior session to clear */
      });
      const result = await GoogleSignin.signIn();
      if (result.type === "cancelled") {
        return;
      }
      const { idToken } = result.data;
      if (!idToken) {
        logger.warn("signIn succeeded but idToken is null");
        toast.show(
          "Could not sign in with google (no ID token — check webClientId)",
          "error"
        );
        return;
      }
      const { error } = await authClient.signIn.social({
        idToken: { token: idToken },
        provider: "google",
      });
      if (error) {
        toast.show(error.message ?? "Could not sign in with google", "error");
        return;
      }
      // The session cookie is written asynchronously by the expo plugin and
      // Better Auth schedules its own /get-session refetch. Navigate only once
      // the shared session store is hydrated, so the destination screen never
      // flashes the guest state before flipping to authenticated.
      await refreshSession();
      toast.show("Welcome to Wearly", "success");
      // dismissAll pops the whole auth stack (sign-in + auth) back to the
      // tabs. router.back() only pops one screen, which stranded the user on
      // /sign-in when they had gone Profile → Sign-in → Auth.
      router.dismissAll();
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      logger.error("Google sign-in failed", err);
      toast.show(
        `Could not sign in with google (${describeError(err)})`,
        "error"
      );
    }
  };

  return { promptGoogleSignIn };
}
