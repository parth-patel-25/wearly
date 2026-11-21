import { useSession } from "@core/providers/session-provider";
import { rentalKeys } from "@features/rental/hooks/use-rentals";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@wearly/ui-native/toast";
import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Sign out.
 *
 * Calls Better Auth's `signOut` so the server session is revoked as well as the
 * local cookie being cleared — clearing local state alone would leave the
 * session alive on the server. The shared session is then re-fetched so the UI
 * reflects the guest state immediately.
 *
 * Device-local favourites are deliberately left alone: they belong to the
 * device, not the account, and wiping them on sign-out would lose data the user
 * never asked to discard.
 */
export function useSignOut() {
  const toast = useToast();
  const { refreshSession } = useSession();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async (): Promise<boolean> => {
    setIsSigningOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.show(error.message ?? "Could not sign out", "error");
        return false;
      }
      await refreshSession();
      // Rentals are account data, not device data. Dropping the cache on the
      // way out means the next account never sees a frame of the previous
      // account's Home card or list while the first fetch is in flight.
      queryClient.removeQueries({ queryKey: rentalKeys.all });
      toast.show("Signed out", "success");
      return true;
    } catch {
      toast.show("Could not sign out", "error");
      return false;
    } finally {
      setIsSigningOut(false);
    }
  }, [queryClient, refreshSession, toast]);

  return { isSigningOut, signOut };
}
