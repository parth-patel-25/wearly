import type { Dispatch, ReactNode } from "react";
import { createContext, useContext, useMemo, useReducer } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Session state.
 *
 * One context, one reducer, four *local* facts: what is saved, what is
 * currently being rented, and the two pre-auth personalise answers. Whether
 * there is an account and whose it is are not local facts — they come from
 * the Better Auth session (`authClient.useSession`, cookie in SecureStore),
 * so `isAuthenticated` and `name` are derived on every read and the reducer
 * never carries them. A reload keeps you signed in now; favourites and the
 * last rental stay local, because they belong to this device either way.
 */

export interface ConfirmedRental {
  end: string;
  method: "delivery" | "pickup" | null;
  pieceId: string;
  start: string;
}

/** Device-local state the auth session knows nothing about. */
interface LocalState {
  favourites: readonly string[];
  /** The most recent rental, kept so My Rentals has something real to show. */
  lastRental: ConfirmedRental | null;
  /** Answers collected before anyone was asked to sign up. */
  stylingFor: string | null;
  wears: string | null;
}

export interface SessionState extends LocalState {
  isAuthenticated: boolean;
  name: string | null;
}

export type SessionAction =
  | { rental: ConfirmedRental; type: "rent-confirmed" }
  | { pieceId: string; type: "toggle-favourite" }
  | { style: string; field: "stylingFor" | "wears"; type: "personalise" };

const INITIAL: LocalState = {
  favourites: [],
  lastRental: null,
  stylingFor: null,
  wears: null,
};

function reducer(state: LocalState, action: SessionAction): LocalState {
  switch (action.type) {
    case "personalise":
      return { ...state, [action.field]: action.style };
    case "rent-confirmed":
      return { ...state, lastRental: action.rental };
    case "toggle-favourite":
      return {
        ...state,
        favourites: state.favourites.includes(action.pieceId)
          ? state.favourites.filter((id) => id !== action.pieceId)
          : [...state.favourites, action.pieceId],
      };
    default:
      return state;
  }
}

interface SessionApi {
  dispatch: Dispatch<SessionAction>;
  state: SessionState;
}

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [local, dispatch] = useReducer(reducer, INITIAL);
  const { data } = authClient.useSession();

  const state = useMemo<SessionState>(
    () => ({
      ...local,
      isAuthenticated: Boolean(data),
      name: data?.user.name ?? null,
    }),
    [data, local]
  );
  const api = useMemo<SessionApi>(() => ({ dispatch, state }), [state]);

  return (
    <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionApi {
  const api = useContext(SessionContext);
  if (api === null) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return api;
}
