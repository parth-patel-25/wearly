import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
};

function SignUpCard() {
  return (
    <AuthShell
      subtitle="Create an account to rent designer pieces near you."
      title="Join Wearly"
    >
      <SignUpForm />
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpCard />
    </Suspense>
  );
}
