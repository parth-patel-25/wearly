import { useSession } from "@core/providers/session-provider";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";

/**
 * Flip the prototype session from an email, greet, and return.
 *
 * Shared by both auth forms: there is no real API to call, so a valid submit
 * dispatches the session and pops back to whatever screen asked. The display
 * name comes from the email's local part — a separate name field would be one
 * more thing to validate for a backend that does not exist.
 */
export function useSignIn() {
  const router = useRouter();
  const { dispatch } = useSession();
  const toast = useToast();

  return (email: string, greeting: string) => {
    const local = email.split("@")[0] ?? "friend";
    const name = local.charAt(0).toUpperCase() + local.slice(1);
    dispatch({ name, type: "sign-in" });
    toast.show(`${greeting}, ${name}`, "success");
    router.back();
  };
}
