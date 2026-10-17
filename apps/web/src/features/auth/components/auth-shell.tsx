import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  subtitle: string;
  title: string;
}

/** Centered card shell shared by the sign-in and sign-up screens. */
export function AuthShell({ children, subtitle, title }: AuthShellProps) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link
          className="mb-8 inline-block text-foreground text-heading-sm"
          href="/design-system"
        >
          Wearly
        </Link>
        <div className="rounded-card border border-border bg-card p-8 shadow-soft">
          <h1 className="text-foreground text-heading-sm">{title}</h1>
          <p className="mt-2 text-body-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
