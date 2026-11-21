import type { Dispatch, ReactNode } from "react";
import { createContext, useContext, useMemo, useReducer } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Session state.
 *
 * One context, one reducer, three *local* facts: what is saved and the two
 * pre-auth personalise answers. Whether there is an account and whose it is
 * are not local facts — they come from the Better Auth session
 * (`authClient.useSession`, cookie in SecureStore), so `sessionStatus`,
 * `isAuthenticated`, `name`, `email` and `image` are derived on every read and
 * the reducer never carries them. A reload keeps you signed in now; favourites
 * stay local, because they belong to this device either way.
 *
 * Rentals are not here. They belong to the account and their state lives on
 * the server, so a rental that only this device remembered would be a lie.
 */

/** Device-local state the auth session knows nothing about. */
interface LocalState {
  favourites: readonly string[];
  /** Answers collected before anyone was asked to sign up. */
  stylingFor: string | null;
  wears: string | null;
}

/**
 * Whether there is an account, kept as three states rather than a boolean.
 *
 * A boolean cannot tell "still reading the cookie from SecureStore" apart from
 * "there is no session", so every guest screen flashed for a signed-in user on
 * a cold start. Screens that gate on the session read `sessionStatus`; the
 * derived `isAuthenticated` stays for the many places that only care whether
 * an account exists once the answer is known.
 */
export type SessionStatus = "pending" | "authenticated" | "unauthenticated";

export interface SessionState extends LocalState {
  /** The account's email, when the session exposes it. */
  email: string | null;
  /** Profile photo from the auth provider, when it exposes one. */
  image: string | null;
  isAuthenticated: boolean;
  /** The account's display name. Editable through Better Auth. */
  name: string | null;
  sessionStatus: SessionStatus;
}

export type SessionAction =
  | { pieceId: string; type: "toggle-favourite" }
  | { style: string; field: "stylingFor" | "wears"; type: "personalise" };

const INITIAL: LocalState = {
  favourites: [],
  stylingFor: null,
  wears: null,
};

function reducer(state: LocalState, action: SessionAction): LocalState {
  switch (action.type) {
    case "personalise":
      return { ...state, [action.field]: action.style };
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
  /**
   * Re-fetch the Better Auth session and resolve only once the shared session
   * store holds the fresh data. Auth success handlers await this before
   * navigating, so the destination screen never renders the guest state while
   * `/get-session` is still in flight (the source of the post-sign-in flash).
   */
  refreshSession: () => Promise<void>;
  state: SessionState;
}

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [local, dispatch] = useReducer(reducer, INITIAL);
  const { data, isPending, refetch } = authClient.useSession();

  const state = useMemo<SessionState>(() => {
    let sessionStatus: SessionStatus = "unauthenticated";
    if (isPending) {
      sessionStatus = "pending";
    } else if (data) {
      sessionStatus = "authenticated";
    }

    return {
      ...local,
      email: data?.user.email ?? null,
      image: data?.user.image ?? null,
      isAuthenticated: sessionStatus === "authenticated",
      name: data?.user.name ?? null,
      sessionStatus,
    };
  }, [data, isPending, local]);
  const api = useMemo<SessionApi>(
    () => ({ dispatch, refreshSession: refetch, state }),
    [refetch, state]
  );

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
