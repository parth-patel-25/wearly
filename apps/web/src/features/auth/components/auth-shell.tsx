import type { ReactNode } from "react";
import { WearlyLogo } from "@/components/wearly-logo";

interface AuthShellProps {
  children: ReactNode;
  subtitle: string;
  title: string;
}

/** Centered card shell shared by the sign-in and sign-up screens. */
export function AuthShell({ children, subtitle, title }: AuthShellProps) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="flex items-center gap-1.5">
          <WearlyLogo size="lg" />
          {/* The mark is the W, so the visible text is "early" — together they
              read "Wearly". The logo's alt text already announces the brand, so
              the text is hidden from assistive tech to avoid "Wearly early". */}
          <span aria-hidden="true" className="text-display text-foreground">
            early
          </span>
        </div>
        <div className="mt-10 w-full rounded-card border border-border bg-card p-8 shadow-soft">
          <h1 className="text-center text-foreground text-heading-lg">
            {title}
          </h1>
          <p className="mt-2 text-center text-body-sm text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
