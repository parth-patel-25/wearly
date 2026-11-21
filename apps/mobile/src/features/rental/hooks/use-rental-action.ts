import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RentalDetail } from "@wearly/shared/api/types";
import { useCallback, useState } from "react";
import { rentalKeys } from "./use-rentals";

/**
 * One mutation surface for every rental action.
 *
 * Screens pass the API call they mean; this hook does the two things every
 * action needs — write the fresh detail into the cache and refresh the lists —
 * so no screen has to remember to invalidate, and a failed action never wipes
 * the rental it was acting on.
 */
export function useRentalAction() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (action: () => Promise<RentalDetail>) => action(),
    onError: (cause) => {
      setError(
        cause instanceof Error ? cause.message : "That did not work. Try again."
      );
    },
    onSuccess: (rental) => {
      setError(null);
      queryClient.setQueryData(rentalKeys.detail(rental.id), rental);
      queryClient.invalidateQueries({ queryKey: rentalKeys.all });
    },
  });

  const { mutate } = mutation;

  const run = useCallback(
    (action: () => Promise<RentalDetail>) => {
      setError(null);
      mutate(action);
    },
    [mutate]
  );

  return {
    clearError: () => setError(null),
    error,
    isPending: mutation.isPending,
    run,
  };
}
