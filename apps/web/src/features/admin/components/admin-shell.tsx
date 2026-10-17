"use client";

import { Button } from "@wearly/ui/components/ui/button";
import { Skeleton } from "@wearly/ui/components/ui/skeleton";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/invites", label: "Invites" },
  { href: "/design-system", label: "Design system" },
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
  const { data, error, isPending, refetch } = authClient.useSession();
  const role = data?.user?.role;
  const isAdmin = role === "admin" || role === "super_admin";

  const handleSignOut = useCallback(() => {
    authClient.signOut().then(() => {
      router.push("/sign-in");
      router.refresh();
    });
  }, [router]);

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
        <p className="px-3 pb-4 text-label text-muted-foreground uppercase">
          Admin
        </p>
        {NAV_ITEMS.map((item) => {
          // Design system lives outside /admin — never mark it active from an
          // admin pathname, or the user would be stranded with no back link.
          const isActive =
            item.href === "/design-system"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              className={`rounded-md px-3 py-2 text-body-sm transition-colors duration-150 ${
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col gap-2 border-border border-t pt-4">
          <p className="truncate px-3 text-body-sm text-muted-foreground">
            {data.user.email}
          </p>
          <Button
            onClick={handleSignOut}
            size="sm"
            type="button"
            variant="ghost"
          >
            Sign out
          </Button>
          {error ? (
            <Button
              onClick={handleRetry}
              size="sm"
              type="button"
              variant="outline"
            >
              Retry session
            </Button>
          ) : null}
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
