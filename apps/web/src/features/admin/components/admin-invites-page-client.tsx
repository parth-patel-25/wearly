"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@wearly/ui/components/ui/button";
import { Input } from "@wearly/ui/components/ui/input";
import { Label } from "@wearly/ui/components/ui/label";
import { Skeleton } from "@wearly/ui/components/ui/skeleton";
import { type ReactNode, useCallback, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import {
  type ConfirmAction,
  ConfirmActionDialog,
} from "../components/confirm-action-dialog";
import { InvitesTable } from "../components/invites-table";
import { useAdminInvites, useInviteActions } from "../hooks/use-admin-actions";

const InviteEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Enter an email")
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.email("That does not look like an email")),
});

type InviteEmailInput = z.infer<typeof InviteEmailSchema>;

/**
 * Invites page. The invite form and revoke button only render for a
 * super-admin (server enforces regardless); admins see the list read-only.
 */
export function AdminInvitesPageClient() {
  const { data: session } = authClient.useSession();
  const isSuperAdmin = session?.user.role === "super_admin";
  const { data, isPending, error } = useAdminInvites(true);
  const { create, revoke } = useInviteActions();
  const [revokeTarget, setRevokeTarget] = useState<ConfirmAction | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);

  const { register, handleSubmit, reset, formState } =
    useForm<InviteEmailInput>({
      resolver: zodResolver(InviteEmailSchema),
    });

  const onSubmit = (values: InviteEmailInput) => {
    create.mutate(values.email, { onSuccess: () => reset() });
  };

  const onInvalid = (errors: FieldErrors<InviteEmailInput>) => {
    toast.error(
      Object.values(errors)[0]?.message ?? "Please fix the highlighted fields"
    );
  };

  const askRevoke = useCallback(
    (id: string, email: string) => {
      setRevokeTarget({
        description: `${email} will no longer be able to accept this invitation.`,
        label: "Revoke",
        onConfirm: () => revoke.mutate(id),
        title: "Revoke invite?",
        variant: "destructive",
      });
      setRevokeOpen(true);
    },
    [revoke]
  );

  let list: ReactNode = (
    <InvitesTable
      invites={data?.items ?? []}
      isSuperAdmin={isSuperAdmin}
      onRevoke={askRevoke}
      revokePending={revoke.isPending}
    />
  );
  if (isPending) {
    list = <Skeleton className="h-64" />;
  } else if (error) {
    list = (
      <p className="text-body-sm text-destructive" role="alert">
        Could not load invites. {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-foreground text-heading-sm">Admin invites</h1>

      {isSuperAdmin ? (
        <form
          className="flex max-w-md flex-col gap-4 rounded-card border border-border bg-card p-6"
          noValidate
          onSubmit={handleSubmit(onSubmit, onInvalid)}
        >
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Invite by email</Label>
            <Input
              id="invite-email"
              placeholder="colleague@example.com"
              type="email"
              {...register("email")}
            />
            {formState.errors.email ? (
              <p className="text-body-sm text-destructive" role="alert">
                {formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <Button
            aria-busy={create.isPending}
            disabled={create.isPending}
            type="submit"
          >
            {create.isPending ? "Sending…" : "Send invite"}
          </Button>
        </form>
      ) : (
        <p className="text-body-sm text-muted-foreground">
          Only a super-admin can send or revoke invites.
        </p>
      )}

      {list}

      <ConfirmActionDialog
        action={revokeTarget}
        onOpenChange={setRevokeOpen}
        open={revokeOpen}
      />
    </div>
  );
}
