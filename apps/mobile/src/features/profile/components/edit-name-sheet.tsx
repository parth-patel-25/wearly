import {
  type DisplayNameInput,
  DisplayNameSchema,
} from "@features/profile/validations/profile.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useEffect } from "react";
import type { FieldErrors } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { useUpdateName } from "../hooks/use-update-name";

/**
 * Edit the display name.
 *
 * The sheet owns its draft, validation, pending state and errors; Profile only
 * decides that the sheet is open. Saving goes through Better Auth's
 * `updateUser`, so the change is persisted to the account rather than to a
 * local copy. Cancelling discards the draft, and nothing is written until Save.
 */

export interface EditNameSheetProps {
  currentName: string;
  onClose: () => void;
  open: boolean;
}

export function EditNameSheet({
  currentName,
  onClose,
  open,
}: EditNameSheetProps) {
  const { isSaving, updateName } = useUpdateName();
  const toast = useToast();
  const { control, handleSubmit, reset } = useForm<DisplayNameInput>({
    defaultValues: { name: currentName },
    mode: "onBlur",
    resolver: zodResolver(DisplayNameSchema),
  });

  // Every open starts from the name the account actually has. Reopening after
  // a cancel must not resurrect the discarded draft.
  useEffect(() => {
    if (open) {
      reset({ name: currentName });
    }
  }, [currentName, open, reset]);

  const submit = handleSubmit(
    async (values) => {
      const saved = await updateName(values.name);
      if (saved) {
        onClose();
      }
    },
    (errors: FieldErrors<DisplayNameInput>) => {
      toast.show(
        errors.name?.message ?? "Check the highlighted field",
        "error"
      );
    }
  );

  return (
    <BottomSheet
      footer={
        <View className="gap-3">
          <Button loading={isSaving} onPress={submit} size="lg">
            Save name
          </Button>
          <Button
            disabled={isSaving}
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
      title="Edit profile"
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value }, fieldState }) => (
          <TextField
            autoCapitalize="words"
            autoComplete="name"
            error={fieldState.error?.message}
            label="Display name"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="How should we call you?"
            returnKeyType="done"
            value={value}
          />
        )}
      />
      <Text tone="muted-foreground" variant="caption">
        This is the name lenders and renters see. Your email stays private.
      </Text>
    </BottomSheet>
  );
}
