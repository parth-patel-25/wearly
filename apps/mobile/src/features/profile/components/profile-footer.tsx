import { View } from "react-native";

import { LendCta } from "./lend-cta";
import { ProfileAbout } from "./profile-about";
import { ProfileAccount } from "./profile-account";

/**
 * The bottom of Profile, rendered once the saved grid has finished.
 *
 * Keeping it as the grid's footer rather than inside its header is what gives
 * the screen its intended order — identity, progress, saved pieces, then the
 * account and information groups — while staying on a single scrolling surface.
 */

export interface ProfileFooterProps {
  /** Whether the account already has a photo — drives the photo row's supporting line. */
  hasPhoto: boolean;
  isAuthenticated: boolean;
  onEditName: () => void;
  onEditPhoto: () => void;
  onSignOut: () => void;
}

export function ProfileFooter({
  hasPhoto,
  isAuthenticated,
  onEditName,
  onEditPhoto,
  onSignOut,
}: ProfileFooterProps) {
  return (
    <View className="gap-8 pt-8">
      <LendCta />
      {isAuthenticated ? (
        <ProfileAccount
          hasPhoto={hasPhoto}
          onEditName={onEditName}
          onEditPhoto={onEditPhoto}
          onSignOut={onSignOut}
        />
      ) : null}
      <ProfileAbout />
    </View>
  );
}
