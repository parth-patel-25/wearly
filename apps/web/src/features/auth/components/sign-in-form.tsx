"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@wearly/ui/components/ui/button";
import { Input } from "@wearly/ui/components/ui/input";
import { Label } from "@wearly/ui/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { type SignInInput, SignInSchema } from "../validations/auth.schema";

function firstError(errors: FieldErrors<SignInInput>): string {
  const [first] = Object.values(errors);
  return first?.message ?? "Please fix the highlighted fields";
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Admin is invite-only: hide self sign-up when the user arrived from an
  // admin route. Invitees without an account sign up via the invite landing.
  const showSignUp = !(next?.startsWith("/admin") ?? false);

  const { register, handleSubmit, formState } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (values: SignInInput) => {
    setIsSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.error(error.message ?? "Could not sign in");
        return;
      }
      // Full replace straight to the destination (skip `/`, which would just
      // 307 to `/admin`): the sign-in entry leaves the history stack, so a
      // signed-in user cannot Back into sign-in, and a fresh sign-in leaves
      // only the dashboard entry.
      window.location.replace(next?.startsWith("/") ? next : "/admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: FieldErrors<SignInInput>) => {
    toast.error(firstError(errors));
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <div className="flex flex-col gap-4">
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
            autoComplete="current-password"
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

        <Button aria-busy={isSubmitting} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </div>

      {showSignUp ? (
        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          No account yet?{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href={`/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          >
            Create one
          </Link>
        </p>
      ) : null}
    </form>
  );
}
