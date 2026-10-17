import { FontAwesome6 } from "@expo/vector-icons";
import { AuthField, PasswordField } from "@features/auth/components/auth-field";
import { SwipeToConfirm } from "@features/auth/components/swipe-to-confirm";
import { useAuth } from "@features/auth/hooks/use-auth";
import {
  type SignUpInput,
  SignUpSchema,
} from "@features/auth/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@wearly/ui-native/toast";
import { useToneColor } from "@wearly/ui-native/tone";
import type { FieldErrors } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

/**
 * Sign-up form.
 *
 * Owns the name field Better Auth requires on `signUpEmail`, the password
 * strength rules, and the confirm match. A valid submit creates the account
 * and does *not* navigate: `requireEmailVerification` means nobody can sign
 * in yet, so the success toast telling the user to check their email is the
 * hand-off. Swipe-as-submit and the toast-plus-inline-errors contract are
 * the login form's, unchanged.
 */

export function SignUpForm() {
  const { signUp } = useAuth();
  const toast = useToast();
  const muted = useToneColor("muted-foreground");
  const { control, handleSubmit } = useForm<SignUpInput>({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    mode: "onBlur",
    resolver: zodResolver(SignUpSchema),
  });

  const submit = handleSubmit(
    (values) => signUp(values),
    (errors: FieldErrors<SignUpInput>) => {
      toast.show(
        errors.name?.message ??
          errors.email?.message ??
          errors.password?.message ??
          errors.confirmPassword?.message ??
          "Check the highlighted fields",
        "error"
      );
    }
  );

  return (
    <View className="gap-5">
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value }, fieldState }) => (
          <AuthField
            autoCapitalize="words"
            autoComplete="name"
            error={fieldState.error?.message}
            label="Name"
            leading={<FontAwesome6 color={muted} name="user" size={16} />}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="What should we call you?"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value }, fieldState }) => (
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            error={fieldState.error?.message}
            keyboardType="email-address"
            label="Email"
            leading={<FontAwesome6 color={muted} name="envelope" size={16} />}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Enter your email"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value }, fieldState }) => (
          <PasswordField
            autoComplete="new-password"
            error={fieldState.error?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Enter your password"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onBlur, onChange, value }, fieldState }) => (
          <PasswordField
            error={fieldState.error?.message}
            label="Confirm password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Confirm your password"
            value={value}
          />
        )}
      />

      <SwipeToConfirm label="Swipe to Sign up" onComplete={submit} />
    </View>
  );
}
