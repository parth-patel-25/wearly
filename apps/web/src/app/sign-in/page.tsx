import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

function SignInCard() {
  return (
    <AuthShell
      subtitle="Sign in to keep renting the looks you love."
      title="Welcome back"
    >
      <SignInForm />
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    // useSearchParams must live under a Suspense boundary in Next.js.
    <Suspense>
      <SignInCard />
    </Suspense>
  );
}
