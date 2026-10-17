"use client";

import { Button } from "@wearly/ui/components/ui/button";
import { Skeleton } from "@wearly/ui/components/ui/skeleton";
import {
  ExternalLink,
  LogOut,
  Mail,
  Palette,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { WearlyLogo } from "@/components/wearly-logo";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/invites", icon: Mail, label: "Invites" },
  {
    href: "/design-system",
    icon: Palette,
    label: "Design system",
    newTab: true,
  },
] as const;

/**
 * Admin shell: a soft sidebar on `background` (not a dark slab) with a rose
 * accent on the active item — DESIGN_SYSTEM §11. Also the role gate: no
 * session → redirect to sign-in; session but not admin → 403 screen. The API
 * re-checks role on every call regardless.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const { data, error, isPending, refetch } = authClient.useSession();
  const role = data?.user?.role;
  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // A Back press that lands on the same dashboard URL is a stale or duplicated
  // history entry (re-login lands on the same route as the pre-sign-out one),
  // which the browser renders as a "refresh". Cancel those so Back is a no-op
  // on the dashboard; a different URL (an internal page) is allowed through.
  useEffect(() => {
    let cancelNext = false;
    const handlePopState = () => {
      if (cancelNext) {
        cancelNext = false;
        return;
      }
      if (window.location.pathname === pathnameRef.current) {
        cancelNext = true;
        window.history.forward();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSignOut = useCallback(() => {
    // Full replace so the signed-in admin entry is not left in history, and a
    // stale client/RSC cache cannot bounce the user back into the shell before
    // the cleared cookie is seen.
    authClient.signOut().then(() => {
      window.location.replace("/sign-in");
    });
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!(isPending || data)) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [data, isPending, pathname, router]);

  if (isPending) {
    return (
      <div className="flex min-h-full flex-1 gap-8 p-8">
        <Skeleton className="h-[calc(100vh-4rem)] w-48" />
        <Skeleton className="flex-1" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <h1 className="text-foreground text-heading-sm">Not authorized</h1>
          <p className="mt-2 text-body-sm text-muted-foreground">
            You need an admin account to view this page.
          </p>
          <Link
            className="mt-6 inline-block text-primary underline-offset-4 hover:underline"
            href="/design-system"
          >
            Back to Wearly
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-full flex-1">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-border border-r p-4">
        <div className="flex items-center gap-2 px-3 pb-4">
          <WearlyLogo href="/admin/users" size="sm" />
          <span className="text-label text-muted-foreground uppercase">
            Admin panel
          </span>
        </div>
        {NAV_ITEMS.map((item) => {
          // Design system lives outside /admin — never mark it active from an
          // admin pathname, or the user would be stranded with no back link.
          const isActive =
            item.href === "/design-system"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const opensInNewTab = "newTab" in item && item.newTab;
          return (
            <Link
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-body-sm transition-colors duration-150 ${
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
              href={item.href}
              key={item.href}
              rel={opensInNewTab ? "noopener noreferrer" : undefined}
              target={opensInNewTab ? "_blank" : undefined}
            >
              <Icon
                aria-hidden="true"
                className={isActive ? "size-4 text-primary" : "size-4"}
              />
              <span>{item.label}</span>
              {opensInNewTab ? (
                <ExternalLink
                  aria-hidden="true"
                  className="ml-auto size-3.5 opacity-60"
                />
              ) : null}
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col gap-2 border-border border-t pt-4">
          <p className="truncate px-3 text-body-sm text-muted-foreground">
            {data.user.email}
          </p>
          <Button
            className="justify-start"
            onClick={handleSignOut}
            size="sm"
            type="button"
            variant="ghost"
          >
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
          {error ? (
            <Button
              className="justify-start"
              onClick={handleRetry}
              size="sm"
              type="button"
              variant="outline"
            >
              <RefreshCw aria-hidden="true" />
              Retry session
            </Button>
          ) : null}
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
