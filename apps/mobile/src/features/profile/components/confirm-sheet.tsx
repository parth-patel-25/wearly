import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/**
 * A confirmation step for a destructive, hard-to-undo action.
 *
 * The sheet owns the copy and the two choices; the caller owns the operation
 * and its pending state. The confirm button is the only destructive control, and
 * Cancel is always present so the sheet is never a one-way door.
 */

export interface ConfirmSheetProps {
  body: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  pending?: boolean;
  title: string;
}

export function ConfirmSheet({
  body,
  confirmLabel,
  onClose,
  onConfirm,
  open,
  pending = false,
  title,
}: ConfirmSheetProps) {
  return (
    <BottomSheet
      footer={
        <View className="gap-3">
          <Button
            loading={pending}
            onPress={onConfirm}
            size="lg"
            variant="destructive"
          >
            {confirmLabel}
          </Button>
          <Button
            disabled={pending}
            onPress={onClose}
            size="sm"
            variant="ghost"
          >
            Cancel
          </Button>
        </View>
      }
      onClose={onClose}
      open={open}
      title={title}
    >
      <Text tone="muted-foreground" variant="bodyMd">
        {body}
      </Text>
    </BottomSheet>
  );
}
