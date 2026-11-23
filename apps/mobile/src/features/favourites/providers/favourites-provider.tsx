import { useSession } from "@core/providers/session-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@wearly/ui-native/toast";
import {
  clearFavourites,
  readFavourites,
  writeFavourites,
} from "../lib/favourites-storage";
import {
  getAccountFavourites,
  mergeFavourites,
  removeFavourite,
  saveFavourite,
} from "../services/favourites-api";

/**
 * The favourites context: ids plus the toggle every grid and the product page
 * use. Two sources, one API:
 *
 * - Signed in: the account (`GET /api/favourites`), optimistic writes, and the
 *   merge of local ids on the sign-in transition.
 * - Guest: AsyncStorage, written immediately on every toggle.
 *
 * The provider owns transitions: sign-in merges device ids into the account;
 * sign-out clears the device copy.
 */
export interface FavouritesApi {
  /** Saved piece ids: the account's while signed in, the device's for guests. */
  ids: readonly string[];
  /** Saved on the account? Drives the heart fill and the account paths. */
  isSaved: (id: string) => boolean;
  /** Toggle one piece — see the file-level contract above. */
  toggle: (id: string) => void;
}

const FAVOURITES_KEY = ["favourites"] as const;

function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id];
}

export const FavouritesContext = createContext<FavouritesApi | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { state } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [localIds, setLocalIds] = useState<readonly string[] | null>(null);

  const { data: accountFavourites } = useQuery({
    enabled: state.isAuthenticated,
    queryKey: FAVOURITES_KEY,
    queryFn: getAccountFavourites,
  });
  const accountIds = useMemo(
    () => accountFavourites?.map((listing) => listing.id) ?? [],
    [accountFavourites],
  );

  // Guest hydration: one JSON blob in AsyncStorage; corrupt or stale reads are empty.
  useEffect(() => {
    let cancelled = false;
    readFavourites().then((ids) => {
      if (!cancelled) {
        setLocalIds(ids);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sign-in merge: local ids become account saves, then the device copy is
  // dropped. A failed merge keeps the local ids and retries on app-active.
  useEffect(() => {
    if (!state.isAuthenticated || localIds === null || localIds.length === 0) {
      return;
    }
    let cancelled = false;
    const retry = () => {
      mergeFavourites([...localIds])
        .then(() => clearFavourites())
        .then(() => {
          if (!cancelled) {
            setLocalIds([]);
          }
        })
        .catch(() => {
          // Keep the local ids; the account list is the source of truth
          // afterwards, so nothing is lost until a retry lands.
        });
    };
    retry();
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active" && !cancelled) {
        retry();
      }
    });
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [state.isAuthenticated, localIds]);

  const toggle = useCallback(
    (id: string) => {
      if (state.isAuthenticated) {
        const previous = queryClient.getQueryData(FAVOURITES_KEY);
        const next = toggleId(accountIds, id);
        queryClient.setQueryData(FAVOURITES_KEY, next);
        const call = accountIds.includes(id)
          ? removeFavourite(id)
          : saveFavourite(id);
        call.catch(() => {
          queryClient.setQueryData(FAVOURITES_KEY, previous);
          toast.show("Could not update saved pieces", "error");
        });
        return;
      }
      const next = toggleId(localIds ?? [], id);
      setLocalIds(next);
      writeFavourites(next).catch(() => {
        /* the in-memory set still drives the UI */
      });
    },
    [accountIds, localIds, queryClient, state.isAuthenticated, toast],
  );

  const ids = state.isAuthenticated ? accountIds : localIds ?? [];
  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const api = useMemo<FavouritesApi>(
    () => ({ ids, isSaved, toggle }),
    [ids, isSaved, toggle],
  );

  return (
    <FavouritesContext.Provider value={api}>{children}</FavouritesContext.Provider>
  );
}

export function useFavourites(): FavouritesApi {
  const api = useContext(FavouritesContext);
  if (!api) {
    throw new Error("useFavourites must be used inside <FavouritesProvider>");
  }
  return api;
}
