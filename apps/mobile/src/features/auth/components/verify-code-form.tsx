import { authTab } from "@core/routing/routes";
import { useResendTimer } from "@features/auth/hooks/use-resend-timer";
import {
  type VerifyCodeInput,
  VerifyCodeSchema,
} from "@features/auth/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, IconButton } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { Pressable, TextInput, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { OtpSlots } from "./otp-slots";

interface VerifyCodeFormProps {
  email: string;
}

export function VerifyCodeForm({ email }: VerifyCodeFormProps) {
  const router = useRouter();
  const toast = useToast();
  const timer = useResendTimer();
  const inputRef = useRef<TextInput>(null);
  const [isResending, setIsResending] = useState(false);
  const { control, formState, handleSubmit } = useForm<VerifyCodeInput>({
    defaultValues: { otp: "" },
    mode: "onBlur",
    resolver: zodResolver(VerifyCodeSchema),
  });

  const submit = handleSubmit(
    async ({ otp: code }) => {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      });
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
      timer.restart();
      toast.show(`A new code is on its way to ${email}`, "success");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View className="flex-1 gap-6">
      <View className="flex-row items-center">
        <IconButton
          accessibilityLabel="Go back"
          icon="arrow-left"
          onPress={() => {
            if (router.canDismiss()) {
              router.back();
            } else {
              router.replace(authTab("login"));
            }
          }}
          variant="outline"
        />
      </View>

      <View className="gap-2">
        <Text variant="headingMd">Verification code</Text>
        <Text tone="muted-foreground" variant="bodySm">
          We sent to the e-mail{" "}
          <Text className="font-medium text-foreground" variant="bodySm">
            {email}
          </Text>
        </Text>
      </View>

      <View className="gap-4">
        <Pressable onPress={() => inputRef.current?.focus()}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { value } }) => (
              <OtpSlots invalid={Boolean(formState.errors.otp)} value={value} />
            )}
          />
        </Pressable>
        <Controller
          control={control}
          name="otp"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInput
              accessibilityLabel="Verification code"
              autoCapitalize="none"
              autoComplete="one-time-code"
              className="h-1 w-full opacity-0"
              keyboardType="number-pad"
              maxLength={6}
              onBlur={onBlur}
              onChangeText={onChange}
              ref={inputRef}
              textContentType="oneTimeCode"
              value={value}
            />
          )}
        />
        {formState.errors.otp?.message ? (
          <Text tone="destructive" variant="caption">
            {formState.errors.otp.message}
          </Text>
        ) : null}
      </View>

      <View className="flex-row items-center justify-center gap-2">
        {timer.canResend ? (
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
        ) : (
          <Text tone="muted-foreground" variant="bodySm">
            Resend code in {timer.formatted}
          </Text>
        )}
      </View>

      <Button
        disabled={formState.isSubmitting}
        loading={formState.isSubmitting}
        onPress={submit}
        size="lg"
      >
        {formState.isSubmitting ? "Verifying…" : "Verify"}
      </Button>
    </View>
  );
}
