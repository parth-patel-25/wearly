import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/auth-shell";

export const metadata: Metadata = {
  title: "Verify email",
};

interface VerifyEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstString(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function messageFor(params: Record<string, string | string[] | undefined>) {
  const error = firstString(params.error) ?? firstString(params.code);
  if (error) {
    return {
      subtitle:
        "This verification link is invalid or has expired. Sign in to request a new one.",
      title: "Verification failed",
    };
  }
  if (typeof params.email === "string") {
    return {
      subtitle: `We sent a verification link to ${params.email}. Click it to activate your account.`,
      title: "Check your inbox",
    };
  }
  return {
    subtitle: "Your email is verified. You can sign in and start renting now.",
    title: "Email verified",
  };
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const { subtitle, title } = messageFor(params);

  return (
    <AuthShell subtitle={subtitle} title={title}>
      <Link
        className="inline-flex h-11 items-center justify-center rounded-button bg-primary px-5 text-button text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
        href="/sign-in"
      >
        Go to sign in
      </Link>
    </AuthShell>
  );
}
