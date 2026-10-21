import { Avatar } from "@wearly/ui-native/avatar";
import { Button } from "@wearly/ui-native/button";
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
 */

export interface ProfileIdentityProps {
  /** Account email, when the session exposes it. */
  email: string | null;
  /** Profile photo from the provider, when there is one. */
  image: string | null;
  isAuthenticated: boolean;
  name: string | null;
  onSignIn: () => void;
}

export function ProfileIdentity({
  email,
  image,
  isAuthenticated,
  name,
  onSignIn,
}: ProfileIdentityProps) {
  if (!isAuthenticated) {
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
