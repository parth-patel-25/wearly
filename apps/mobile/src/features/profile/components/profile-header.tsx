import { useSession } from "@core/providers/session-provider";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import type { ProfileState } from "../profile-progress";
import { ProfileIdentity } from "./profile-identity";
import { ProfileProgressPanel } from "./profile-progress-panel";
import { ProfileRentals } from "./profile-rentals";
import { ProfileStyle } from "./profile-style";

/**
 * The top of Profile.
 *
 * Identity first, then the permanent door to rentals, then the progress that
 * proves the account is worth having, then the style answers, then the heading
 * for the saved grid that the list renders directly beneath this header. Order
 * is deliberate: who you are, what you are renting, what you have done, what
 * you like, what you saved. Rentals sits high because the saved grid below it
 * can be long, and a place you visit deliberately should never be buried.
 */

export interface ProfileHeaderProps {
  onOpenRentals: () => void;
  onSignIn: () => void;
}

export function ProfileHeader({ onOpenRentals, onSignIn }: ProfileHeaderProps) {
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
        name={state.name}
        onSignIn={onSignIn}
        sessionStatus={state.sessionStatus}
      />

      {state.sessionStatus === "unauthenticated" ? null : (
        <ProfileRentals onPress={onOpenRentals} />
      )}

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
