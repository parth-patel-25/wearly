import type { UserRole } from "@wearly/shared/api/types";
import { Badge } from "@wearly/ui/components/ui/badge";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  super_admin: "Super admin",
  user: "User",
};

const ROLE_VARIANT: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  super_admin: "secondary",
  user: "outline",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={ROLE_VARIANT[role] ?? "outline"}>
      {ROLE_LABEL[role] ?? role}
    </Badge>
  );
}
