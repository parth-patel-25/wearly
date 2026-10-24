import { authTab } from "@core/routing/routes";
import { VerifyCodeForm } from "@features/auth/components/verify-code-form";
import { Button } from "@wearly/ui-native/button";
import { Screen } from "@wearly/ui-native/screen";
import { Text } from "@wearly/ui-native/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

/**
 * Email verification.
 *
 * Sign-up pushes this screen with the address, so the six-digit code form is
 * the normal path. Without an address it is the landing for an old
 * `wearly://verify-email` link, where success is the bare deep link and
 * failure arrives as Better Auth's `?error=` code.
 */

const ERROR_COPY: Record<string, string> = {
  INVALID_TOKEN: "That verification link is not valid.",
  TOKEN_EXPIRED: "That verification link has expired.",
  USER_NOT_FOUND: "That link does not match any account.",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{
    email?: string | string[];
    error?: string | string[];
  }>();
  const router = useRouter();
  const email = firstValue(params.email);
  const error = firstValue(params.error);

  if (email) {
    return (
      <Screen
        className="flex-1 bg-background"
        contentClassName="flex grow flex-col px-gutter py-6"
        scrollable={false}
      >
        <VerifyCodeForm email={email} />
      </Screen>
    );
  }

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
