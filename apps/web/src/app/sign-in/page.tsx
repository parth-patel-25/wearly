import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RequireSignedOut } from "@/features/auth/components/require-signed-out";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { hasSessionCookie } from "@/lib/session-cookie";

export const metadata: Metadata = {
  title: "Sign in",
};

function SignInCard() {
  return (
    <AuthShell
      subtitle="Sign in to manage users, invites and the Wearly marketplace."
      title="Welcome back"
    >
      <SignInForm />
    </AuthShell>
  );
}

export default async function SignInPage() {
  // A signed-in user must never land back on the sign-in form.
  if (await hasSessionCookie()) {
    redirect("/admin");
  }

  return (
    // useSearchParams must live under a Suspense boundary in Next.js.
    <Suspense>
      <RequireSignedOut>
        <SignInCard />
      </RequireSignedOut>
    </Suspense>
  );
}
