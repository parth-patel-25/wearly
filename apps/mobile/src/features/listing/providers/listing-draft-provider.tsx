import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export interface ListingPhoto {
  id: string;
  uri: string;
  cover?: boolean;
}

export interface ListingDraft {
  availability: string[];
  brand: string;
  category: string;
  color: string;
  condition: string;
  description: string;
  material: string;
  measurements: Record<string, string>;
  photos: ListingPhoto[];
  pricePerDay: string;
  size: string;
  subcategory: string;
  title: string;
}

const EMPTY: ListingDraft = {
  availability: [],
  brand: "",
  category: "",
  color: "",
  condition: "",
  description: "",
  material: "",
  measurements: {},
  photos: [],
  pricePerDay: "",
  size: "",
  subcategory: "",
  title: "",
};

interface ListingDraftApi {
  clear: () => void;
  draft: ListingDraft;
  set: (patch: Partial<ListingDraft>) => void;
}

const Ctx = createContext<ListingDraftApi | null>(null);

export function ListingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ListingDraft>(EMPTY);
  const api = useMemo<ListingDraftApi>(
    () => ({
      clear: () => setDraft(EMPTY),
      draft,
      set: (patch) => setDraft((c) => ({ ...c, ...patch })),
    }),
    [draft]
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useListingDraft(): ListingDraftApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("useListingDraft must be inside provider");
  return api;
}
