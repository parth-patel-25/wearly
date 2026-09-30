import type { Dispatch, ReactNode } from "react";
import { createContext, useContext, useMemo, useReducer } from "react";

/**
 * Session state.
 *
 * One context, one reducer, four facts: whether there is an account, who it
 * belongs to, what is saved, and what is currently being rented. That is the
 * whole cross-screen state of the prototype.
 *
 * Deliberately a `useReducer` in context rather than a store library: this is one
 * small, synchronous surface with no async and no persistence, and a global store
 * would be infrastructure with nothing to do. It is also the seam where a real
 * store would go once the API exists — the reducer's actions already read like
 * API calls.
 *
 * In-memory only. A reload signs you out, which is honest for a prototype and
 * nothing is pretending otherwise.
 */

export interface ConfirmedRental {
  end: string;
  method: "delivery" | "pickup" | null;
  pieceId: string;
  start: string;
}

export interface SessionState {
  favourites: readonly string[];
  isAuthenticated: boolean;
  /** The most recent rental, kept so My Rentals has something real to show. */
  lastRental: ConfirmedRental | null;
  name: string | null;
  /** Answers collected before anyone was asked to sign up. */
  stylingFor: string | null;
  wears: string | null;
}

export type SessionAction =
  | { rental: ConfirmedRental; type: "rent-confirmed" }
  | { type: "sign-in"; name: string }
  | { type: "sign-out" }
  | { pieceId: string; type: "toggle-favourite" }
  | { style: string; field: "stylingFor" | "wears"; type: "personalise" };

const INITIAL: SessionState = {
  favourites: [],
  isAuthenticated: false,
  lastRental: null,
  name: null,
  stylingFor: null,
  wears: null,
};

function reducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "personalise":
      return { ...state, [action.field]: action.style };
    case "rent-confirmed":
      return { ...state, lastRental: action.rental };
    case "sign-in":
      return { ...state, isAuthenticated: true, name: action.name };
    case "sign-out":
      return { ...state, isAuthenticated: false, name: null };
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
  const [state, dispatch] = useReducer(reducer, INITIAL);
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
