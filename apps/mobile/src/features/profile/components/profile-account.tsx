import { Card } from "@wearly/ui-native/card";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import { ProfileRow } from "./profile-row";

/**
 * Account and settings.
 *
 * A short group, not a settings hierarchy: the only account actions this build
 * supports are the profile photo, editing the display name and signing out.
 * Sign-out is a destructive row, so it is visually distinct and confirms
 * before acting.
 */

export interface ProfileAccountProps {
  /** Whether the account already has a photo — drives the row's supporting line. */
  hasPhoto: boolean;
  onEditName: () => void;
  onEditPhoto: () => void;
  onSignOut: () => void;
}

export function ProfileAccount({
  hasPhoto,
  onEditName,
  onEditPhoto,
  onSignOut,
}: ProfileAccountProps) {
  return (
    <View className="gap-3">
      <Text variant="headingSm">Account</Text>
      <Card className="overflow-hidden p-0">
        <ProfileRow
          detail={
            hasPhoto
              ? "Change or remove your photo"
              : "Add a photo so others recognise you"
          }
          icon="camera"
          label="Profile photo"
          onPress={onEditPhoto}
        />
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
