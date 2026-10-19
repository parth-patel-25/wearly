import { useSession } from "@core/providers/session-provider";
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
      toast.show("Signed out", "success");
      return true;
    } catch {
      toast.show("Could not sign out", "error");
      return false;
    } finally {
      setIsSigningOut(false);
    }
  }, [refreshSession, toast]);

  return { isSigningOut, signOut };
}
