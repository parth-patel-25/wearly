import { useSession } from "@core/providers/session-provider";
import { useQuery } from "@tanstack/react-query";
import type { RentalDetail } from "@wearly/shared/api/types";
import { rentalApi } from "../services/rental-api";

export type RentalRole = "renter" | "lender";

/** `role=all` is the API's both-sides view, used by Home and Activity. */
export type RentalScope = RentalRole | "all";

export const rentalKeys = {
  all: ["rentals"] as const,
  detail: (id: string) => ["rentals", "detail", id] as const,
  list: (scope: RentalScope) => ["rentals", "list", scope] as const,
};

/**
 * Both sides of the marketplace have a list, and the API decides what each
 * rental looks like for the viewer (role, capabilities, counterparty).
 */
export function useRentals(role: RentalRole) {
  const { state } = useSession();

  return useQuery({
    enabled: state.isAuthenticated,
    queryFn: () => rentalApi.list({ limit: 50, offset: 0, role }),
    queryKey: rentalKeys.list(role),
  });
}

/**
 * Both sides of the user's rentals in one request.
 *
 * Home needs the single most urgent item and Activity needs the whole attention
 * list, so asking for one role at a time would double the round trips and still
 * miss the other side. `role=all` is already supported by the list endpoint;
 * this adds a hook, not a data layer.
 */
export function useAllRentals() {
  const { state } = useSession();

  return useQuery({
    enabled: state.isAuthenticated,
    queryFn: () => rentalApi.list({ limit: 50, offset: 0, role: "all" }),
    queryKey: rentalKeys.list("all"),
  });
}

export function useRental(id: string) {
  const { state } = useSession();

  return useQuery<RentalDetail>({
    enabled: state.isAuthenticated && id.length > 0,
    queryFn: () => rentalApi.detail(id),
    queryKey: rentalKeys.detail(id),
  });
}
