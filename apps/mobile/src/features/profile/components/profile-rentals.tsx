import { Card } from "@wearly/ui-native/card";

import { ProfileRow } from "./profile-row";

/**
 * The permanent door to the rental list.
 *
 * A single row, in the same contract as every other Profile row: icon, label,
 * supporting line, chevron. It sits in the header rather than the footer so it
 * stays visible before the saved grid, which can be long. An account is the
 * only thing that can own rentals, so it renders only when there is one.
 */

export interface ProfileRentalsProps {
  onPress: () => void;
}

export function ProfileRentals({ onPress }: ProfileRentalsProps) {
  return (
    <Card className="overflow-hidden p-0">
      <ProfileRow
        detail="Requests, meetups, handovers and returns"
        icon="bag"
        label="Your rentals"
        onPress={onPress}
      />
    </Card>
  );
}
