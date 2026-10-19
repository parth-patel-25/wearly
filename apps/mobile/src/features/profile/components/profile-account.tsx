import { Card } from "@wearly/ui-native/card";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import { ProfileRow } from "./profile-row";

/**
 * Account and settings.
 *
 * A short group, not a settings hierarchy: the only account actions this build
 * supports are editing the display name and signing out. Sign-out is a
 * destructive row, so it is visually distinct and confirms before acting.
 */

export interface ProfileAccountProps {
  onEditName: () => void;
  onSignOut: () => void;
}

export function ProfileAccount({ onEditName, onSignOut }: ProfileAccountProps) {
  return (
    <View className="gap-3">
      <Text variant="headingSm">Account</Text>
      <Card className="overflow-hidden p-0">
        <ProfileRow
          detail="Change your display name"
          icon="user"
          label="Edit profile"
          onPress={onEditName}
        />
        <ProfileRow
          icon="lock"
          label="Sign out"
          onPress={onSignOut}
          tone="destructive"
        />
      </Card>
    </View>
  );
}
