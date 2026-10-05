import { useSession } from "@core/providers/session-provider";
import { View } from "react-native";
import { HomeHeader } from "./home-header";

/**
 * Greeting band — the top of the home header.
 *
 * Full-bleed white on the grey page: no side gaps. Owns the session read so
 * the screen stays a pure composition. The greeting scrolls away; the search
 * strip below it stays pinned — the two read as one white card at rest, so
 * this band stays square and the pinned strip carries the bottom rounding.
 * `HomeHeader` carries no inset of its own — this band owns the padding.
 */

interface HomeIntroCardProps {
  onNotifications: () => void;
  onProfile: () => void;
}

export function HomeIntroCard({
  onNotifications,
  onProfile,
}: HomeIntroCardProps) {
  const { state } = useSession();

  return (
    <View className="bg-card px-gutter pt-3">
      <HomeHeader
        name={state.name ?? "Romina"}
        onNotifications={onNotifications}
        onProfile={onProfile}
      />
    </View>
  );
}
