import type { SignInInput } from "@features/rental/validations/rental.schema";
import { SignInSchema } from "@features/rental/validations/rental.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import type { Control, Path } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

/**
 * The authentication gate.
 *
 * Wearly never opens on a login screen, and never throws the user at one either.
 * When an action genuinely needs an account, this sheet appears with the
 *reason* written at the top — "you are about to pay for a rental" — and only
 * then the fields. An unexplained form is a demand; an explained one is a
 * reasonable step.
 *
 * It is also dismissible. If someone is not ready, they back out and keep
 * browsing; nothing is lost, because there is no session to lose yet.
 *
 * The schema lives beside the rental validations because this is the only form
 * in the prototype. When a real auth feature lands it moves to
 * `features/auth/validations` with its siblings.
 */

export interface AuthSheetProps {
  onClose: () => void;
  onSignedIn: (name: string) => void;
  open: boolean;
  reason: string;
}

export function AuthSheet({
  onClose,
  onSignedIn,
  open,
  reason,
}: AuthSheetProps) {
  const toast = useToast();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<SignInInput>({
    defaultValues: { email: "", name: "" },
    mode: "onBlur",
    resolver: zodResolver(SignInSchema),
  });

  const submit = handleSubmit(
    (values) => {
      onSignedIn(values.name);
      toast.show(`Welcome, ${values.name.split(" ")[0] ?? "there"}`, "success");
    },
    () => {
      toast.show(
        errors.email?.message ??
          errors.name?.message ??
          "Check the highlighted fields",
        "error"
      );
    }
  );

  return (
    <BottomSheet
      footer={
        <View className="gap-3">
          <Button loading={isSubmitting} onPress={submit} size="lg">
            Create my account
          </Button>
          <Button onPress={onClose} size="sm" variant="ghost">
            Not now
          </Button>
        </View>
      }
      onClose={onClose}
      open={open}
      title="One last step"
    >
      <View className="flex-row items-start gap-3 rounded-card bg-accent p-5">
        <Icon name="lock" size="sm" tone="accent-foreground" />
        <View className="flex-1 gap-1">
          <Text tone="accent-foreground" variant="bodySm">
            {reason}
          </Text>
          <Text tone="accent-foreground" variant="caption">
            Browsing never needs an account. This is the first thing we ask you
            for.
          </Text>
        </View>
      </View>

      <View className="gap-5">
        <ControlledField
          control={control}
          error={errors.name?.message}
          label="What should we call you?"
          name="name"
          placeholder="Ananya"
        />
        <ControlledField
          autoCapitalize="none"
          autoComplete="email"
          control={control}
          error={errors.email?.message}
          keyboardType="email-address"
          label="Email"
          name="email"
          placeholder="you@example.com"
        />
      </View>

      <Text tone="muted-foreground" variant="caption">
        There is no password here. This prototype has no real authentication,
        and pretending otherwise would be a promise it cannot keep.
      </Text>
    </BottomSheet>
  );
}

interface ControlledFieldProps {
  autoCapitalize?: "none" | "sentences" | "words";
  autoComplete?: "email" | "name" | "off";
  control: Control<SignInInput>;
  error?: string;
  keyboardType?: "default" | "email-address";
  label: string;
  name: Path<SignInInput>;
  placeholder: string;
}

function ControlledField({
  autoCapitalize = "words",
  autoComplete = "off",
  control,
  error,
  keyboardType = "default",
  label,
  name,
  placeholder,
}: ControlledFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value } }) => (
        <TextField
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          error={error}
          keyboardType={keyboardType}
          label={label}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={placeholder}
          value={value}
        />
      )}
    />
  );
}
