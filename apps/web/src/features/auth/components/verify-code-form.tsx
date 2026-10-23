"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@wearly/ui/components/ui/button";
import { Input } from "@wearly/ui/components/ui/input";
import { Label } from "@wearly/ui/components/ui/label";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  type VerifyCodeInput,
  VerifyCodeSchema,
} from "../validations/auth.schema";

interface VerifyCodeFormProps {
  email: string;
  next?: string | null;
}

function firstError(errors: FieldErrors<VerifyCodeInput>): string {
  const [first] = Object.values(errors);
  return first?.message ?? "Please fix the highlighted fields";
}

/**
 * Six-digit email verification.
 *
 * The code is emailed on sign-up. Verifying proves the address without a
 * `localhost` link (which Gmail filters as spam), then the user signs in with
 * the password they chose.
 */
export function VerifyCodeForm({ email, next }: VerifyCodeFormProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const { register, handleSubmit, formState } = useForm<VerifyCodeInput>({
    resolver: zodResolver(VerifyCodeSchema),
  });

  const onSubmit = async ({ otp }: VerifyCodeInput) => {
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
    if (error) {
      toast.error(error.message ?? "That code did not work");
      return;
    }
    toast.success("Email verified");
    const search = next ? `?next=${encodeURIComponent(next)}` : "";
    router.push(`/sign-in${search}`);
  };

  const onInvalid = (errors: FieldErrors<VerifyCodeInput>) => {
    toast.error(firstError(errors));
  };

  const resend = useCallback(async () => {
    setIsResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) {
        toast.error(error.message ?? "Could not send another code");
        return;
      }
      toast.success(`A new code is on its way to ${email}`);
    } finally {
      setIsResending(false);
    }
  }, [email]);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-muted-foreground">
          We sent a 6-digit code to {email}.
        </p>

        <div className="grid gap-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            autoComplete="one-time-code"
            id="otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            {...register("otp")}
          />
          {formState.errors.otp ? (
            <p className="text-body-sm text-destructive" role="alert">
              {formState.errors.otp.message}
            </p>
          ) : null}
        </div>

        <Button
          aria-busy={formState.isSubmitting}
          disabled={formState.isSubmitting}
          type="submit"
        >
          {formState.isSubmitting ? "Verifying…" : "Verify email"}
        </Button>

        <Button
          disabled={isResending}
          onClick={resend}
          type="button"
          variant="ghost"
        >
          {isResending ? "Sending a new code…" : "Resend code"}
        </Button>
      </div>
    </form>
  );
}
