import type { UserRole } from "@wearly/shared/api/types";
import { ROLES } from "@wearly/shared/enums";
import { Badge } from "@wearly/ui/components/ui/badge";

const ROLE_LABEL: Record<UserRole, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.SUPER_ADMIN]: "Super admin",
  [ROLES.USER]: "User",
};

const ROLE_VARIANT: Record<UserRole, "default" | "secondary" | "outline"> = {
  [ROLES.ADMIN]: "default",
  [ROLES.SUPER_ADMIN]: "secondary",
  [ROLES.USER]: "outline",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={ROLE_VARIANT[role] ?? "outline"}>
      {ROLE_LABEL[role] ?? role}
    </Badge>
  );
}
