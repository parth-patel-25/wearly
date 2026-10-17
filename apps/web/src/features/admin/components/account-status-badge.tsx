import type { AdminUser } from "@wearly/shared/api/types";
import { Badge } from "@wearly/ui/components/ui/badge";

/** Active / deleted / banned — derived, never stored on the client. */
export function AccountStatusBadge({ user }: { user: AdminUser }) {
  if (user.deletedAt) {
    return <Badge variant="destructive">Deleted</Badge>;
  }
  if (user.banned) {
    return <Badge variant="warning">Banned</Badge>;
  }
  return <Badge variant="success">Active</Badge>;
}
