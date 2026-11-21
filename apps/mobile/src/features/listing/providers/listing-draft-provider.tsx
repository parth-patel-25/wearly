import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export interface ListingPhoto {
  cover?: boolean;
  id: string;
  uri: string;
}

export interface ListingDraft {
  /** Public neighbourhood, e.g. "Bandra West". Never an address. */
  areaLabel: string;
  availability: string[];
  brand: string;
  category: string;
  color: string;
  condition: string;
  description: string;
  /** Private, used only for nearby ranking. Never returned publicly. */
  latitude: number | null;
  longitude: number | null;
  material: string;
  measurements: Record<string, string>;
  photos: ListingPhoto[];
  pricePerDay: string;
  size: string;
  subcategory: string;
  title: string;
}

const EMPTY: ListingDraft = {
  areaLabel: "",
  availability: [],
  brand: "",
  category: "",
  color: "",
  condition: "",
  description: "",
  latitude: null,
  longitude: null,
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
  if (!api) {
    throw new Error("useListingDraft must be inside provider");
  }
  return api;
}
