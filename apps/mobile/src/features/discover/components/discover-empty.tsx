import { Button } from "@wearly/ui-native/button";
import { EmptyState } from "@wearly/ui-native/display";
import { Spinner } from "@wearly/ui-native/spinner";
import { View } from "react-native";
import type { NearbyLocation } from "../hooks/use-nearby-location";
import { NearbyActive, NearbyExplainer } from "./nearby-explainer";

/** Which location surface the header shows: a fix, nothing, or the opt-in. */
export function LocationSlot({ nearby }: { nearby: NearbyLocation }) {
  if (nearby.coords) {
    return <NearbyActive onClear={nearby.clear} />;
  }
  if (nearby.dismissed) {
    return null;
  }
  return (
    <NearbyExplainer
      onDismiss={nearby.dismiss}
      onRequest={nearby.request}
      status={nearby.status}
    />
  );
}

export function headingFor(query: string, hasCoords: boolean): string {
  if (query.trim().length > 0) {
    return `Results for “${query.trim()}”`;
  }
  return hasCoords ? "Closest to you" : "Everything";
}

interface DiscoverEmptyProps {
  error: unknown;
  hasNarrowing: boolean;
  isPending: boolean;
  onRetry: () => void;
}

/** Loading, failure and two different kinds of "nothing" are not one state. */
export function DiscoverEmpty({
  error,
  hasNarrowing,
  isPending,
  onRetry,
}: DiscoverEmptyProps) {
  if (isPending) {
    return (
      <View className="items-center py-16">
        <Spinner />
      </View>
    );
  }

  if (error) {
    return (
      <EmptyState
        action={
          <Button onPress={onRetry} size="sm" variant="outline">
            Try again
          </Button>
        }
        body={
          error instanceof Error
            ? error.message
            : "Check your connection and try again."
        }
        icon="search"
        title="We could not load pieces"
      />
    );
  }

  return (
    <EmptyState
      body={
        hasNarrowing
          ? "Try removing a filter, widening the area, or searching for something broader."
          : "Be the first to share — list a piece from your wardrobe and start earning."
      }
      icon={hasNarrowing ? "search" : "plus"}
      title={hasNarrowing ? "Nothing matches yet" : "Nothing listed yet"}
    />
  );
}
