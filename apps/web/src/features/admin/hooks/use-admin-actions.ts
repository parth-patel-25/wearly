"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@wearly/shared/api/client-core";
import { toast } from "sonner";
import { browserApi } from "@/lib/api-browser";

function errorToast(error: Error, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback);
}

export function useAdminInvites(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => browserApi.admin.listInvites(),
    queryKey: ["admin", "invites"],
  });
}

function useInvalidate(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey });
}

/** Soft-delete / restore / hard-delete a user; refreshes the user list. */
export function useUserActions() {
  const invalidate = useInvalidate(["admin", "users"]);

  const onSuccess = (message: string) => {
    toast.success(message);
    invalidate();
  };

  const softDelete = useMutation({
    mutationFn: (id: string) => browserApi.admin.softDeleteUser(id),
    onError: (error) => errorToast(error, "Could not deactivate the account"),
    onSuccess: () => onSuccess("Account deactivated"),
  });

  const restore = useMutation({
    mutationFn: (id: string) => browserApi.admin.restoreUser(id),
    onError: (error) => errorToast(error, "Could not restore the account"),
    onSuccess: () => onSuccess("Account restored"),
  });

  const hardDelete = useMutation({
    mutationFn: (id: string) => browserApi.admin.removeUser(id),
    onError: (error) => errorToast(error, "Could not delete the account"),
    onSuccess: () => onSuccess("Account permanently deleted"),
  });

  return { hardDelete, restore, softDelete };
}

/** Create and revoke admin invites; refreshes the invite list. */
export function useInviteActions() {
  const invalidate = useInvalidate(["admin", "invites"]);

  const create = useMutation({
    mutationFn: (email: string) => browserApi.admin.createInvite({ email }),
    onError: (error) => errorToast(error, "Could not send the invite"),
    onSuccess: (invite) => {
      toast.success(`Invite sent to ${invite.email}`);
      invalidate();
    },
  });

  const revoke = useMutation({
    mutationFn: (id: string) => browserApi.admin.revokeInvite(id),
    onError: (error) => errorToast(error, "Could not revoke the invite"),
    onSuccess: () => {
      toast.success("Invite revoked");
      invalidate();
    },
  });

  return { create, revoke };
}

/** Accept an invite (used on the `/admin/invite/:token` landing page). */
export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => browserApi.admin.acceptInvite({ token }),
    onError: (error) => errorToast(error, "Could not accept the invite"),
    onSuccess: () => {
      toast.success("You are now an admin");
      queryClient.invalidateQueries();
    },
  });
}

export function useInviteByToken(token: string) {
  return useQuery({
    queryFn: () => browserApi.admin.getInvite(token),
    queryKey: ["admin", "invite", token],
    retry: false,
  });
}
