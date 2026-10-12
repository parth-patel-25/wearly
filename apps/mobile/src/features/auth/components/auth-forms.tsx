import { FontAwesome6 } from "@expo/vector-icons";
import { AuthField, PasswordField } from "@features/auth/components/auth-field";
import { RememberMe } from "@features/auth/components/remember-me";
import { SwipeToConfirm } from "@features/auth/components/swipe-to-confirm";
import { useSignIn } from "@features/auth/hooks/use-signin";
import type {
  LoginInput,
  SignUpInput,
} from "@features/auth/validations/auth.schema";
import {
  LoginSchema,
  SignUpSchema,
} from "@features/auth/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useToneColor } from "@wearly/ui-native/tone";
import type { FieldErrors } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";

/**
 * The two auth forms.
 *
 * Each tab owns its own form, validation and submit path — swapping tabs
 * swaps schemas, so a signup password rule never leaks into login. The swipe
 * control *is* the submit button: releasing past the threshold runs the full
 * zod check, and a failure toasts the first message while the inline field
 * errors show exactly where. A valid submit flips the session and returns via
 * `useSignIn`.
 */

export function LoginForm() {
  const signIn = useSignIn();
  const toast = useToast();
  const muted = useToneColor("muted-foreground");
  const { control, handleSubmit } = useForm<LoginInput>({
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onBlur",
    resolver: zodResolver(LoginSchema),
  });

  const submit = handleSubmit(
    (values) => signIn(values.email, "Welcome back"),
    (errors: FieldErrors<LoginInput>) => {
      toast.show(
        errors.email?.message ??
          errors.password?.message ??
          "Check the highlighted fields",
        "error"
      );
    }
  );

  return (
    <View className="gap-5">
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
            error={fieldState.error?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Enter your password"
            value={value}
          />
        )}
      />

      <View className="flex-row items-center justify-between">
        <Controller
          control={control}
          name="rememberMe"
          render={({ field: { onChange, value } }) => (
            <RememberMe checked={value} onToggle={() => onChange(!value)} />
          )}
        />
        <Pressable
          hitSlop={8}
          onPress={() =>
            toast.show(
              "Password reset is not part of this prototype yet",
              "info"
            )
          }
        >
          <Text tone="primary" variant="label">
            Forgot Password?
          </Text>
        </Pressable>
      </View>

      <SwipeToConfirm label="Swipe to Login" onComplete={submit} />
    </View>
  );
}

export function SignUpForm() {
  const signIn = useSignIn();
  const toast = useToast();
  const muted = useToneColor("muted-foreground");
  const { control, handleSubmit } = useForm<SignUpInput>({
    defaultValues: { confirmPassword: "", email: "", password: "" },
    mode: "onBlur",
    resolver: zodResolver(SignUpSchema),
  });

  const submit = handleSubmit(
    (values) => signIn(values.email, "Welcome"),
    (errors: FieldErrors<SignUpInput>) => {
      toast.show(
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
