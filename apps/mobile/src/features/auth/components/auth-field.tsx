import { FontAwesome6 } from "@expo/vector-icons";
import { FieldShell } from "@wearly/ui-native/fields";
import { useToneColor } from "@wearly/ui-native/tone";
import type { ReactNode } from "react";
import { useState } from "react";
import type { TextInputProps } from "react-native";
import { Pressable, TextInput, View } from "react-native";

/**
 * Auth fields.
 *
 * Label above, control, message below — the same FieldShell contract the rest
 * of the app uses, with leading brand glyphs and a password reveal toggle that
 * the shared TextField has no slot for. The reveal lives inside the field so
 * the tap target stays where the eye is drawn.
 */

const SHELL_IDLE = "border-border";
const SHELL_INVALID = "border-destructive";
const SHELL =
  "min-h-12 w-full flex-row items-center gap-3 rounded-input border bg-card px-4";
const INPUT = "flex-1 py-3 text-native-body-md text-foreground";

export interface AuthFieldProps
  extends Omit<TextInputProps, "className" | "style"> {
  error?: string;
  label: string;
  leading: ReactNode;
  trailing?: ReactNode;
}

export function AuthField({
  error,
  label,
  leading,
  trailing,
  ...rest
}: AuthFieldProps) {
  return (
    <FieldShell error={error} label={label}>
      <View className={`${SHELL} ${error ? SHELL_INVALID : SHELL_IDLE}`}>
        {leading}
        <TextInput
          accessibilityLabel={label}
          aria-invalid={Boolean(error)}
          className={INPUT}
          placeholderTextColorClassName="accent-muted-foreground"
          selectionColorClassName="accent-primary"
          {...rest}
        />
        {trailing}
      </View>
    </FieldShell>
  );
}

export interface PasswordFieldProps
  extends Omit<TextInputProps, "className" | "secureTextEntry" | "style"> {
  error?: string;
  label: string;
  placeholder: string;
}

export function PasswordField({
  error,
  label,
  placeholder,
  ...rest
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const muted = useToneColor("muted-foreground");

  return (
    <AuthField
      autoCapitalize="none"
      autoComplete="password"
      error={error}
      label={label}
      leading={<FontAwesome6 color={muted} name="lock" size={16} />}
      placeholder={placeholder}
      secureTextEntry={!visible}
      trailing={
        <Pressable
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          accessibilityRole="button"
          className="size-8 items-center justify-center"
          hitSlop={8}
          onPress={() => setVisible((shown) => !shown)}
        >
          <FontAwesome6
            color={muted}
            name={visible ? "eye" : "eye-slash"}
            size={16}
          />
        </Pressable>
      }
      {...rest}
    />
  );
}
