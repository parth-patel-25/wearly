import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { useEffect, useState } from "react";
import { View } from "react-native";

interface ReasonSheetProps {
  confirmLabel: string;
  description: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  open: boolean;
  placeholder: string;
  title: string;
}

/** Cancel, decline and no-show all need a reason, and none may guess one. */
export function ReasonSheet({
  confirmLabel,
  description,
  isPending,
  onClose,
  onSubmit,
  open,
  placeholder,
  title,
}: ReasonSheetProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  const submit = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError("Add a short reason so the other person understands");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  const pendingLabel = isPending ? "Sending…" : confirmLabel;

  return (
    <BottomSheet
      footer={
        <Button
          disabled={isPending}
          onPress={submit}
          size="lg"
          variant="destructive"
        >
          {pendingLabel}
        </Button>
      }
      onClose={onClose}
      open={open}
      title={title}
    >
      <View className="gap-2">
        <Text tone="muted-foreground" variant="bodyMd">
          {description}
        </Text>
        <Text tone="muted-foreground" variant="caption">
          Be specific and factual. This note is kept with the rental.
        </Text>
      </View>

      <TextField
        error={error}
        label="Reason"
        multiline
        onChangeText={(value) => {
          setReason(value);
          setError("");
        }}
        placeholder={placeholder}
        value={reason}
      />
    </BottomSheet>
  );
}
