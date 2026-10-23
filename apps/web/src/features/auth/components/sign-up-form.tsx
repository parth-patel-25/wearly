"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@wearly/ui/components/ui/button";
import { Input } from "@wearly/ui/components/ui/input";
import { Label } from "@wearly/ui/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { type SignUpInput, SignUpSchema } from "../validations/auth.schema";

function firstError(errors: FieldErrors<SignUpInput>): string {
  const [first] = Object.values(errors);
  return first?.message ?? "Please fix the highlighted fields";
}

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (values: SignUpInput) => {
    setIsSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      if (error) {
        toast.error(error.message ?? "Could not create your account");
        return;
      }
      // requireEmailVerification is on — send the user to the code screen
      // with the email pre-filled so they know what to check.
      const params = new URLSearchParams({ email: values.email });
      if (next) {
        params.set("next", next);
      }
      router.push(`/verify-email?${params.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: FieldErrors<SignUpInput>) => {
    toast.error(firstError(errors));
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            autoComplete="name"
            id="name"
            placeholder="Your name"
            type="text"
            {...register("name")}
          />
          {formState.errors.name ? (
            <p className="text-body-sm text-destructive" role="alert">
              {formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            autoComplete="email"
            id="email"
            placeholder="you@example.com"
            type="email"
            {...register("email")}
          />
          {formState.errors.email ? (
            <p className="text-body-sm text-destructive" role="alert">
              {formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="new-password"
            id="password"
            type="password"
            {...register("password")}
          />
          {formState.errors.password ? (
            <p className="text-body-sm text-destructive" role="alert">
              {formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            autoComplete="new-password"
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
          />
          {formState.errors.confirmPassword ? (
            <p className="text-body-sm text-destructive" role="alert">
              {formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button aria-busy={isSubmitting} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </div>

      <p className="mt-6 text-center text-body-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href={`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
