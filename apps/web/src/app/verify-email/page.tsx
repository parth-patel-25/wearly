import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { VerifyCodeForm } from "@/features/auth/components/verify-code-form";

export const metadata: Metadata = {
  title: "Verify email",
};

interface VerifyEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = firstString(params.email);
  const next = firstString(params.next);
  const error = firstString(params.error) ?? firstString(params.code);

  if (email) {
    return (
      <AuthShell
        subtitle={`We sent a 6-digit code to ${email}. It expires in 10 minutes.`}
        title="Verify your email"
      >
        <VerifyCodeForm email={email} next={next} />
      </AuthShell>
    );
  }

  if (error) {
    return (
      <AuthShell
        subtitle="This verification code is invalid or has expired. Sign in to request a new one."
        title="Verification failed"
      >
        <Link
          className="inline-flex h-11 items-center justify-center rounded-button bg-primary px-5 text-button text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
          href="/sign-in"
        >
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      subtitle="Your email is verified. You can sign in and start renting now."
      title="Email verified"
    >
      <Link
        className="inline-flex h-11 items-center justify-center rounded-button bg-primary px-5 text-button text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
        href="/sign-in"
      >
        Go to sign in
      </Link>
    </AuthShell>
  );
}
