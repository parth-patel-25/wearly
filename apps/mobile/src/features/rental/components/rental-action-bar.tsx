import type { RentalDetail } from "@wearly/shared/api/types";
import { Button } from "@wearly/ui-native/button";
import { View } from "react-native";

export interface RentalHandlers {
  accept: () => void;
  cancel: () => void;
  decline: () => void;
  dispute: () => void;
  noShow: () => void;
  retryPayment: () => void;
}

/**
 * The request-level actions.
 *
 * Meetup, handover and return have their own panels because they need context
 * (a place, a checklist, a due date). Everything else lives here, and every
 * button comes from a capability the API computed — the screen never decides
 * who may do what.
 */
export function RentalActionBar({
  handlers,
  isPending,
  rental,
}: {
  handlers: RentalHandlers;
  isPending: boolean;
  rental: RentalDetail;
}) {
  const { capabilities } = rental;
  const secondary = [
    capabilities.canDecline
      ? { label: "Decline request", onPress: handlers.decline }
      : null,
    capabilities.canCancel
      ? { label: "Cancel rental", onPress: handlers.cancel }
      : null,
    capabilities.canRetryPayment
      ? { label: "Retry payment", onPress: handlers.retryPayment }
      : null,
    capabilities.canReportNoShow
      ? { label: "Report a no-show", onPress: handlers.noShow }
      : null,
    capabilities.canOpenDispute
      ? { label: "Report a problem", onPress: handlers.dispute }
      : null,
  ].filter((item) => item !== null);

  if (!(capabilities.canAccept || secondary.length > 0)) {
    return null;
  }

  return (
    <View className="gap-2">
      {capabilities.canAccept ? (
        <Button disabled={isPending} onPress={handlers.accept} size="lg">
          {isPending ? "Accepting…" : "Accept request"}
        </Button>
      ) : null}
      {secondary.map((item) => (
        <Button
          disabled={isPending}
          key={item.label}
          onPress={item.onPress}
          size="sm"
          variant="ghost"
        >
          {item.label}
        </Button>
      ))}
    </View>
  );
}
