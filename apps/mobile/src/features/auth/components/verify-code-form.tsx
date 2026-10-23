import { authTab } from "@core/routing/routes";
import { FontAwesome6 } from "@expo/vector-icons";
import { AuthField } from "@features/auth/components/auth-field";
import {
  type VerifyCodeInput,
  VerifyCodeSchema,
} from "@features/auth/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useToneColor } from "@wearly/ui-native/tone";
import { useRouter } from "expo-router";
import { useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { authClient } from "@/lib/auth-client";

interface VerifyCodeFormProps {
  email: string;
}

/**
 * Six-digit email verification.
 *
 * The code is the whole flow: the API emails it on sign-up, this form verifies
 * it, and the user then signs in with the password they chose. A code instead
 * of a link keeps the email free of a `localhost` URL (which Gmail filters)
 * and works without `adb reverse`.
 */
export function VerifyCodeForm({ email }: VerifyCodeFormProps) {
  const router = useRouter();
  const toast = useToast();
  const muted = useToneColor("muted-foreground");
  const [isResending, setIsResending] = useState(false);
  const { control, formState, handleSubmit } = useForm<VerifyCodeInput>({
    defaultValues: { otp: "" },
    mode: "onBlur",
    resolver: zodResolver(VerifyCodeSchema),
  });

  const submit = handleSubmit(
    async ({ otp }) => {
      const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
      if (error) {
        toast.show(error.message ?? "That code did not work", "error");
        return;
      }
      toast.show("Email verified. Sign in to continue.", "success");
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.push(authTab("login"));
    },
    (errors: FieldErrors<VerifyCodeInput>) => {
      toast.show(
        errors.otp?.message ?? "Enter the 6-digit code from your email",
        "error"
      );
    }
  );

  const resend = async () => {
    setIsResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        toast.show(error.message ?? "Could not send another code", "error");
        return;
      }
      toast.show(`A new code is on its way to ${email}`, "success");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text variant="headingSm">Enter your code</Text>
        <Text tone="muted-foreground" variant="bodySm">
          We sent a 6-digit code to {email}.
        </Text>
      </View>

      <Controller
        control={control}
        name="otp"
        render={({ field: { onBlur, onChange, value }, fieldState }) => (
          <AuthField
            autoCapitalize="none"
            autoComplete="one-time-code"
            error={fieldState.error?.message}
            keyboardType="number-pad"
            label="Verification code"
            leading={
              <FontAwesome6 color={muted} name="shield-halved" size={16} />
            }
            maxLength={6}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="123456"
            textContentType="oneTimeCode"
            value={value}
          />
        )}
      />

      <Button
        disabled={formState.isSubmitting}
        loading={formState.isSubmitting}
        onPress={submit}
        size="lg"
      >
        {formState.isSubmitting ? "Verifying…" : "Verify email"}
      </Button>

      <Pressable
        accessibilityRole="button"
        disabled={isResending}
        hitSlop={8}
        onPress={resend}
      >
        <Text className="text-center" tone="primary" variant="bodySm">
          {isResending ? "Sending a new code…" : "Resend code"}
        </Text>
      </Pressable>
    </View>
  );
}
