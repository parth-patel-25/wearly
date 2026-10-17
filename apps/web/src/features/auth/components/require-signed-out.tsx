"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Keeps an already-signed-in visitor off the signed-out auth screens.
 *
 * The server gate on `/sign-in` only runs on a fresh request. After signing in,
 * the browser can restore the previous sign-in document from the back/forward
 * cache (or Next's client router cache) without re-running it, which let a
 * signed-in user reach sign-in again via the browser back button. `pageshow`
 * with `persisted` catches that restore; the initial check covers client-side
 * navigations.
 */
export function RequireSignedOut({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const check = () => {
      authClient.getSession().then(({ data }) => {
        if (active && data) {
          router.replace("/admin");
        }
      });
    };

    check();
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        check();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      active = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  return <>{children}</>;
}
