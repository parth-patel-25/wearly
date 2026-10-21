import { useSession } from "@core/providers/session-provider";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import type { ProfileState } from "../profile-progress";
import { ProfileIdentity } from "./profile-identity";
import { ProfileProgressPanel } from "./profile-progress-panel";
import { ProfileStyle } from "./profile-style";

/**
 * The top of Profile.
 *
 * Identity first, then the progress that proves the account is worth having,
 * then the style answers, then the heading for the saved grid that the list
 * renders directly beneath this header. Order is deliberate: who you are, what
 * you have done, what you like, what you saved.
 */

export interface ProfileHeaderProps {
  onSignIn: () => void;
}

export function ProfileHeader({ onSignIn }: ProfileHeaderProps) {
  const { state } = useSession();

  const profileState: ProfileState = {
    isAuthenticated: state.isAuthenticated,
    stylingFor: state.stylingFor,
    wears: state.wears,
  };

  return (
    <View className="gap-8 pt-6 pb-2">
      <ProfileIdentity
        email={state.email}
        image={state.image}
        isAuthenticated={state.isAuthenticated}
        name={state.name}
        onSignIn={onSignIn}
      />

      <ProfileProgressPanel state={profileState} />

      {state.stylingFor === null && state.wears === null ? null : (
        <ProfileStyle stylingFor={state.stylingFor} wears={state.wears} />
      )}

      <View className="gap-1">
        <Text variant="headingSm">Saved pieces</Text>
        <Text tone="muted-foreground" variant="caption">
          Saved on this device. Favourites are not synced to your account yet.
        </Text>
      </View>
    </View>
  );
}
