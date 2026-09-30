import type { ReactNode } from "react";
import type { TextInputProps } from "react-native";
import { Pressable, TextInput, View } from "react-native";

import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { Text } from "./text";

/**
 * Form fields.
 *
 * Built on the token layer rather than a component library, so the radius,
 * border and placeholder colour come from `--wearly-radius-input` and
 * `--wearly-muted-foreground` like everything else. Each field owns its label
 * and its error text, so a field cannot ship without a visible name or without
 * a way for the user to find out what went wrong.
 */

const FIELD_IDLE = "border-border";
const FIELD_INVALID = "border-destructive";
const FIELD =
  "min-h-12 w-full rounded-input border bg-card px-4 text-native-body-md text-foreground";

export interface FieldShellProps {
  children: ReactNode;
  error?: string;
  hint?: string;
  icon?: IconName;
  label: string;
}

/** Label, control, then the message. The label names the control. */
export function FieldShell({
  children,
  error,
  hint,
  icon,
  label,
}: FieldShellProps) {
  const message = error ?? hint;
  const isError = error !== undefined && error.length > 0;
  const messageTone = isError ? "destructive" : "muted-foreground";

  return (
    <View className="flex flex-col gap-2">
      <View className="flex-row items-center gap-2">
        {icon === undefined ? null : (
          <Icon name={icon} size="sm" tone="muted-foreground" />
        )}
        <Text variant="label">{label}</Text>
      </View>
      {children}
      {message === undefined ? null : (
        <Text
          accessibilityRole={isError ? "alert" : undefined}
          tone={messageTone}
          variant="caption"
        >
          {message}
        </Text>
      )}
    </View>
  );
}

export interface TextFieldProps
  extends Omit<TextInputProps, "className" | "style"> {
  error?: string;
  hint?: string;
  icon?: IconName;
  label: string;
}

export function TextField({
  error,
  hint,
  icon,
  label,
  ...rest
}: TextFieldProps) {
  return (
    <FieldShell error={error} hint={hint} icon={icon} label={label}>
      <TextInput
        accessibilityLabel={label}
        aria-invalid={Boolean(error)}
        className={`${FIELD} ${error ? FIELD_INVALID : FIELD_IDLE}`}
        placeholderTextColorClassName="text-muted-foreground"
        selectionColorClassName="text-primary"
        {...rest}
      />
    </FieldShell>
  );
}

export interface SearchFieldProps
  extends Omit<
    TextInputProps,
    "className" | "onChange" | "onChangeText" | "style"
  > {
  onChange: (value: string) => void;
  onSubmit?: () => void;
  value: string;
}

export function SearchField({
  onChange,
  onSubmit,
  value,
  ...rest
}: SearchFieldProps) {
  return (
    <View className="min-h-12 flex-row items-center gap-3 rounded-pill border border-border bg-card px-5">
      <Icon name="search" size="sm" tone="muted-foreground" />
      <TextInput
        accessibilityLabel="Search clothing"
        className="flex-1 text-foreground text-native-body-md"
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder="Try “linen dress”"
        placeholderTextColorClassName="text-muted-foreground"
        returnKeyType="search"
        selectionColorClassName="text-primary"
        value={value}
        {...rest}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          className="size-6 items-center justify-center"
          hitSlop={12}
          onPress={() => onChange("")}
        >
          <Icon name="close" size="sm" tone="muted-foreground" />
        </Pressable>
      ) : null}
    </View>
  );
}
