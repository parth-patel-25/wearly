import { useSession } from "@core/providers/session-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@wearly/ui-native/toast";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { FAVOURITES_COPY, showFavouriteToast } from "../lib/favourites-copy";
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
 * - Signed in: the account (`GET /api/favourites`), optimistic ids, and the
 *   merge of local ids on the sign-in transition.
 * - Guest: AsyncStorage, written immediately on every toggle.
 *
 * The query data is always `Listing[]`; the optimistic toggle only moves the
 * id list, and every successful write invalidates the query so the Saved grid
 * refetches the real listings. Ids are never written into the listings cache —
 * that is what produced `undefined` piece ids.
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
  const [accountIds, setAccountIds] = useState<readonly string[]>([]);

  const { data: accountFavourites } = useQuery({
    enabled: state.isAuthenticated,
    queryFn: getAccountFavourites,
    queryKey: FAVOURITES_KEY,
  });

  // Mirror the server list into the id state. The query data itself is never
  // replaced by ids, so every listing keeps a real `id`.
  useEffect(() => {
    if (state.isAuthenticated && accountFavourites) {
      setAccountIds(accountFavourites.map((listing) => listing.id));
    }
  }, [accountFavourites, state.isAuthenticated]);

  // Guest hydration: one JSON blob in AsyncStorage; corrupt or stale reads are empty.
  useEffect(() => {
    let cancelled = false;
    readFavourites().then((storedIds) => {
      if (!cancelled) {
        setLocalIds(storedIds);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sign-out: drop the in-memory copy too. `use-sign-out` clears the device
  // blob; without this a failed merge could leak the previous guest's ids into
  // the next account on a shared phone.
  const wasAuthenticated = useRef(state.isAuthenticated);
  useEffect(() => {
    if (wasAuthenticated.current && !state.isAuthenticated) {
      setLocalIds([]);
      setAccountIds([]);
    }
    wasAuthenticated.current = state.isAuthenticated;
  }, [state.isAuthenticated]);

  // Sign-in merge: local ids become account saves, then the device copy is
  // dropped and the saved list refetches. A failed merge keeps the local ids
  // and retries on app-active.
  useEffect(() => {
    if (!state.isAuthenticated || localIds === null || localIds.length === 0) {
      return;
    }
    let cancelled = false;
    const retry = () => {
      mergeFavourites([...localIds])
        .then(() => clearFavourites())
        .then(() => {
          if (cancelled) {
            return;
          }
          setLocalIds([]);
          return queryClient.invalidateQueries({ queryKey: FAVOURITES_KEY });
        })
        .catch(() => {
          // Keep the local ids; the next app-active event retries.
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
  }, [state.isAuthenticated, localIds, queryClient]);

  const toggle = useCallback(
    (id: string) => {
      if (state.isAuthenticated) {
        const previous = accountIds;
        // The pre-tap state decides which call to make; the post-tap state is
        // what the confirmation reports. Passing `saved` here would announce a
        // save as a removal.
        const saved = previous.includes(id);
        setAccountIds(toggleId(previous, id));
        const call = saved ? removeFavourite(id) : saveFavourite(id);
        call
          .then(() => {
            showFavouriteToast(toast.show, !saved, "account");
            return queryClient.invalidateQueries({ queryKey: FAVOURITES_KEY });
          })
          .catch(() => {
            setAccountIds(previous);
            toast.show(FAVOURITES_COPY.failed, "error");
          });
        return;
      }
      const previous = localIds ?? [];
      const next = toggleId(previous, id);
      setLocalIds(next);
      writeFavourites(next)
        .then(() => showFavouriteToast(toast.show, next.includes(id), "device"))
        .catch(() => {
          setLocalIds(previous);
          toast.show(FAVOURITES_COPY.failed, "error");
        });
    },
    [accountIds, localIds, queryClient, state.isAuthenticated, toast]
  );

  const ids = state.isAuthenticated ? accountIds : (localIds ?? []);
  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);

  const api = useMemo<FavouritesApi>(
    () => ({ ids, isSaved, toggle }),
    [ids, isSaved, toggle]
  );

  return (
    <FavouritesContext.Provider value={api}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites(): FavouritesApi {
  const api = useContext(FavouritesContext);
  if (!api) {
    throw new Error("useFavourites must be used inside <FavouritesProvider>");
  }
  return api;
}
