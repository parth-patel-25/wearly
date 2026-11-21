import type { SessionStatus } from "@core/providers/session-provider";
import { Avatar } from "@wearly/ui-native/avatar";
import { Button } from "@wearly/ui-native/button";
import { Skeleton } from "@wearly/ui-native/skeleton";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/**
 * Profile identity.
 *
 * The first thing on the screen and the only place a person sees themselves.
 * A photograph when the provider gave one, a monogram when it did not, the
 * display name, and the account email. There is deliberately no "account
 * created" badge: having signed in says nothing about whether the marketplace
 * profile is complete, and implying otherwise is exactly the fake progress the
 * progress bar exists to replace.
 *
 * The session has three states. While the cookie is still being read, the
 * screen shows a neutral placeholder rather than the guest prompt: an account
 * that has not answered yet is not the same thing as no account, and telling a
 * signed-in person to sign in on every cold start is the bug this avoids.
 */

export interface ProfileIdentityProps {
  /** Account email, when the session exposes it. */
  email: string | null;
  /** Profile photo from the provider, when there is one. */
  image: string | null;
  name: string | null;
  onSignIn: () => void;
  sessionStatus: SessionStatus;
}

export function ProfileIdentity({
  email,
  image,
  name,
  onSignIn,
  sessionStatus,
}: ProfileIdentityProps) {
  if (sessionStatus === "pending") {
    return (
      <View className="flex-row items-center gap-4">
        <Avatar size="xl" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-44" />
        </View>
      </View>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <View className="flex-row items-center gap-4">
        <Avatar size="xl" />
        <View className="flex-1 gap-2">
          <Text variant="headingLg">Your Wearly profile</Text>
          <Text tone="muted-foreground" variant="bodySm">
            You are browsing without an account. Sign in to rent, to list, and
            to keep your details with you.
          </Text>
          <View className="w-32">
            <Button onPress={onSignIn} size="sm" variant="outline">
              Sign in
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-4">
      <Avatar name={name ?? undefined} size="xl" src={image ?? undefined} />
      <View className="flex-1 gap-1">
        <Text numberOfLines={1} variant="headingLg">
          {name ?? "Your Wearly profile"}
        </Text>
        {email ? (
          <Text numberOfLines={1} tone="muted-foreground" variant="bodySm">
            {email}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
