import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import type { Fulfillment } from "../validations/rental.schema";

/**
 * The rental being assembled.
 *
 * This is rental-flow state, not session state, so it lives with the rental
 * feature rather than in the global session — which is what keeps `core` free of
 * feature types.
 *
 * Deliberately not persisted. A draft that survives a reload and then silently
 * re-appears at checkout with stale dates is worse than starting over, and this
 * prototype has no storage to do it honestly.
 */

export interface RentalDraft {
  end: string | null;
  /** 1 = delivery, 2 = pickup. */
  method: Fulfillment | null;
  pieceId: string | null;
  /** Inclusive ISO days. */
  start: string | null;
}

const EMPTY: RentalDraft = {
  end: null,
  method: null,
  pieceId: null,
  start: null,
};

interface RentalDraftApi {
  clear: () => void;
  draft: RentalDraft;
  set: (patch: Partial<RentalDraft>) => void;
}

const RentalDraftContext = createContext<RentalDraftApi | null>(null);

export function RentalDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<RentalDraft>(EMPTY);

  const api = useMemo<RentalDraftApi>(
    () => ({
      clear: () => setDraft(EMPTY),
      draft,
      set: (patch) => setDraft((current) => ({ ...current, ...patch })),
    }),
    [draft]
  );

  return (
    <RentalDraftContext.Provider value={api}>
      {children}
    </RentalDraftContext.Provider>
  );
}

export function useRentalDraft(): RentalDraftApi {
  const api = useContext(RentalDraftContext);
  if (api === null) {
    throw new Error("useRentalDraft must be used inside <RentalDraftProvider>");
  }
  return api;
}
