"use client";

import type { AdminUser } from "@wearly/shared/api/types";
import { Button } from "@wearly/ui/components/ui/button";
import { useCallback, useState } from "react";
import { useUserActions } from "../hooks/use-admin-actions";
import {
  type ConfirmAction,
  ConfirmActionDialog,
} from "./confirm-action-dialog";

interface UserRowActionsProps {
  currentUserId: string;
  user: AdminUser;
}

/**
 * Row-level actions. Soft delete / restore / hard delete each open a
 * confirmation dialog (Rule 5: the dialog owns its own workflow state). The
 * server re-checks policy — this only shapes what the buttons offer: no
 * actions on yourself, none on super-admin accounts.
 */
export function UserRowActions({ currentUserId, user }: UserRowActionsProps) {
  const { hardDelete, restore, softDelete } = useUserActions();
  const [action, setAction] = useState<ConfirmAction | null>(null);
  const [open, setOpen] = useState(false);

  const askSoftDelete = useCallback(() => {
    setAction({
      description: `${user.email} will be signed out and blocked from signing in. You can restore the account later.`,
      label: "Deactivate",
      onConfirm: () => softDelete.mutate(user.id),
      title: "Deactivate account?",
      variant: "destructive",
    });
    setOpen(true);
  }, [softDelete, user.email, user.id]);

  const askRestore = useCallback(() => {
    setAction({
      description: `${user.email} will be able to sign in again.`,
      label: "Restore",
      onConfirm: () => restore.mutate(user.id),
      title: "Restore account?",
    });
    setOpen(true);
  }, [restore, user.email, user.id]);

  const askHardDelete = useCallback(() => {
    setAction({
      description: `This permanently removes ${user.email} and all their data. This cannot be undone.`,
      label: "Delete forever",
      onConfirm: () => hardDelete.mutate(user.id),
      title: "Permanently delete account?",
      variant: "destructive",
    });
    setOpen(true);
  }, [hardDelete, user.email, user.id]);

  const locked = user.id === currentUserId || user.role === "super_admin";

  if (locked) {
    return <span className="text-body-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {user.deletedAt ? (
        <Button
          disabled={restore.isPending}
          onClick={askRestore}
          size="sm"
          type="button"
          variant="soft"
        >
          Restore
        </Button>
      ) : (
        <Button
          disabled={softDelete.isPending}
          onClick={askSoftDelete}
          size="sm"
          type="button"
          variant="outline"
        >
          Deactivate
        </Button>
      )}
      <Button
        disabled={hardDelete.isPending}
        onClick={askHardDelete}
        size="sm"
        type="button"
        variant="destructive"
      >
        Delete
      </Button>
      <ConfirmActionDialog action={action} onOpenChange={setOpen} open={open} />
    </div>
  );
}
