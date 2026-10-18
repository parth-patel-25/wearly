import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

import { useAuthOnlineState } from "./use-auth-online-state";
import { useFocusRefetch } from "./use-focus-refetch";

/**
 * The app's single TanStack Query boundary.
 *
 * Defaults match `apps/web/src/app/providers.tsx` so the same screen reads the
 * same way on both platforms (README §Data fetching and refetch policy):
 * `refetchOnWindowFocus: true` means "refetch when this data comes back into
 * view". On the web the browser raises that event for free; here
 * `useFocusRefetch` raises it on route change and on `AppState` → `active`,
 * because native has no window to focus, and `useAuthOnlineState` keeps the
 * auth session's own refetch gate from reading the phone as permanently
 * offline.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  useAuthOnlineState();
  useFocusRefetch();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
