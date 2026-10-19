import { useSession } from "@core/providers/session-provider";
import { useToast } from "@wearly/ui-native/toast";
import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Rename the signed-in account.
 *
 * Uses Better Auth's own `updateUser`, so the change is written to the account
 * record rather than to a copy of it in React state. After the server confirms,
 * the shared session is re-fetched so every screen reads the new name from one
 * source. The session object itself is never mutated directly.
 */
export function useUpdateName() {
  const toast = useToast();
  const { refreshSession } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const updateName = useCallback(
    async (name: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        const { error } = await authClient.updateUser({ name });
        if (error) {
          toast.show(error.message ?? "Could not update your name", "error");
          return false;
        }
        await refreshSession();
        toast.show("Name updated", "success");
        return true;
      } catch {
        toast.show("Could not update your name", "error");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshSession, toast]
  );

  return { isSaving, updateName };
}
