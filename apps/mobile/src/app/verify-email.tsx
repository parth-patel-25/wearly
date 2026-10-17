import { authTab } from "@core/routing/routes";
import { Button } from "@wearly/ui-native/button";
import { Screen } from "@wearly/ui-native/screen";
import { Text } from "@wearly/ui-native/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

/**
 * Email verification landing (`wearly://verify-email`).
 *
 * The token is checked by the API *before* this route exists — success is the
 * bare deep link, failure arrives as Better Auth's `?error=` code. The
 * session cookie set during verification landed in the browser that followed
 * the email link, not in SecureStore, so the honest hand-off is an explicit
 * sign-in rather than a pretend auto-login.
 */

const ERROR_COPY: Record<string, string> = {
  INVALID_TOKEN: "That verification link is not valid.",
  TOKEN_EXPIRED: "That verification link has expired.",
  USER_NOT_FOUND: "That link does not match any account.",
};

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ error?: string | string[] }>();
  const router = useRouter();
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const failed = Boolean(error);
  const message = failed
    ? `${ERROR_COPY[error ?? ""] ?? "We could not verify that email."} Go to sign in and we'll get you sorted.`
    : "Your email is verified. Sign in to start renting designer looks.";

  return (
    <Screen
      className="flex-1 bg-background"
      contentClassName="flex grow flex-col"
      scrollable={false}
    >
      <View className="flex-1 items-center justify-center gap-5 px-gutter">
        <Text className="text-center" variant="headingSm">
          {failed ? "Verification failed" : "Email verified"}
        </Text>
        <Text className="text-center" tone="muted-foreground" variant="bodyLg">
          {message}
        </Text>
        <Button onPress={() => router.replace(authTab("login"))} size="lg">
          Go to sign in
        </Button>
      </View>
    </Screen>
  );
}
