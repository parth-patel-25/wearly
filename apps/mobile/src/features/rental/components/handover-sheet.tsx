import { Chip } from "@wearly/ui-native/badge";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useState } from "react";
import { View } from "react-native";

interface HandoverSheetProps {
  days: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReportIssue: () => void;
  open: boolean;
}

/**
 * The renter's decision, and the only path to an active rental.
 *
 * Both statements are explicit taps. Neither is pre-checked, because "you
 * agreed" has to mean you agreed.
 */
export function HandoverSheet({
  days,
  isPending,
  onClose,
  onConfirm,
  onReportIssue,
  open,
}: HandoverSheetProps) {
  const [received, setReceived] = useState(false);
  const [inspected, setInspected] = useState(false);
  const ready = received && inspected;

  return (
    <BottomSheet
      footer={
        <>
          <Button disabled={!ready || isPending} onPress={onConfirm} size="lg">
            {isPending ? "Confirming…" : "Confirm receipt"}
          </Button>
          <Button onPress={onReportIssue} size="sm" variant="ghost">
            Something is wrong with the piece
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      title="Did you get the piece?"
    >
      <Text tone="muted-foreground" variant="bodyMd">
        {`Confirming starts a ${days} ${days === 1 ? "day" : "days"} rental. The return date is counted from today, not from the dates you asked for.`}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        <Chip
          icon="check"
          onPress={() => setReceived((value) => !value)}
          selected={received}
        >
          I received the piece
        </Chip>
        <Chip
          icon="check"
          onPress={() => setInspected((value) => !value)}
          selected={inspected}
        >
          I inspected it and accept its condition
        </Chip>
      </View>

      <View className="rounded-card bg-muted p-4">
        <Text tone="muted-foreground" variant="bodySm">
          Payment protection is not connected in this build, so confirming does
          not charge you. With a provider, the authorized amount would be
          captured at this point.
        </Text>
      </View>
    </BottomSheet>
  );
}
