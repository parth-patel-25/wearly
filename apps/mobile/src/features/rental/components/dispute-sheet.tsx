import type { DisputeInput } from "@wearly/shared/api/types";
import {
  DISPUTE_CATEGORY_VALUES,
  type DisputeCategory,
} from "@wearly/shared/enums";
import { Chip } from "@wearly/ui-native/badge";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { useEffect, useState } from "react";
import { View } from "react-native";

const CATEGORY_LABEL: Record<DisputeCategory, string> = {
  damaged: "Damaged",
  item_not_as_described: "Not as described",
  no_show: "The other person did not show",
  not_handed_over: "I never received it",
  other: "Something else",
};

interface DisputeSheetProps {
  confirmLabel: string;
  description: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: DisputeInput) => void;
  open: boolean;
  title: string;
}

/**
 * Reporting a problem is an entry point, not a resolution workflow. The sheet
 * promises a review and records facts; it never invents a refund.
 */
export function DisputeSheet({
  confirmLabel,
  description,
  isPending,
  onClose,
  onSubmit,
  open,
  title,
}: DisputeSheetProps) {
  const [category, setCategory] = useState<DisputeCategory>("not_handed_over");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  const submit = () => {
    const trimmed = details.trim();
    if (trimmed.length < 10) {
      setError("Describe what happened in a sentence or two");
      return;
    }
    setError("");
    onSubmit({ category, details: trimmed });
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
          Support will review the timeline. No refund or payout is promised
          automatically.
        </Text>
      </View>

      <View className="gap-2">
        <Text variant="label">What happened</Text>
        <View className="flex-row flex-wrap gap-2">
          {DISPUTE_CATEGORY_VALUES.map((value) => (
            <Chip
              key={value}
              onPress={() => setCategory(value)}
              selected={category === value}
            >
              {CATEGORY_LABEL[value]}
            </Chip>
          ))}
        </View>
      </View>

      <TextField
        error={error}
        label="Details"
        multiline
        onChangeText={(value) => {
          setDetails(value);
          setError("");
        }}
        placeholder="The piece was torn at the seam when I opened it."
        value={details}
      />
    </BottomSheet>
  );
}
