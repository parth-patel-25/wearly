"use client";

import type { AdminInvite, AdminInviteStatus } from "@wearly/shared/api/types";
import { INVITE_STATUS } from "@wearly/shared/enums";
import { Badge } from "@wearly/ui/components/ui/badge";
import { Button } from "@wearly/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wearly/ui/components/ui/table";
import { useCallback } from "react";

const STATUS_VARIANT: Record<
  AdminInviteStatus,
  "info" | "success" | "destructive" | "warning"
> = {
  [INVITE_STATUS.ACCEPTED]: "success",
  [INVITE_STATUS.EXPIRED]: "warning",
  [INVITE_STATUS.PENDING]: "info",
  [INVITE_STATUS.REVOKED]: "destructive",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TableHeaderRow({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Email</TableHead>
        <TableHead>Invited by</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Expires</TableHead>
        {isSuperAdmin ? <TableHead className="w-0">Actions</TableHead> : null}
      </TableRow>
    </TableHeader>
  );
}

interface InviteRowProps {
  invite: AdminInvite;
  isSuperAdmin: boolean;
  onRevoke: (id: string, email: string) => void;
  revokePending: boolean;
}

function InviteRow({
  invite,
  isSuperAdmin,
  onRevoke,
  revokePending,
}: InviteRowProps) {
  const handleRevoke = useCallback(() => {
    onRevoke(invite.id, invite.email);
  }, [invite.id, invite.email, onRevoke]);

  return (
    <TableRow>
      <TableCell>{invite.email}</TableCell>
      <TableCell className="text-muted-foreground">
        {invite.invitedByEmail ?? "—"}
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[invite.status]}>{invite.status}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(invite.expiresAt)}
      </TableCell>
      {isSuperAdmin ? (
        <TableCell>
          {invite.status === INVITE_STATUS.PENDING ? (
            <Button
              disabled={revokePending}
              onClick={handleRevoke}
              size="sm"
              type="button"
              variant="outline"
            >
              Revoke
            </Button>
          ) : null}
        </TableCell>
      ) : null}
    </TableRow>
  );
}

interface InvitesTableProps {
  invites: AdminInvite[];
  isSuperAdmin: boolean;
  onRevoke: (id: string, email: string) => void;
  revokePending: boolean;
}

export function InvitesTable({
  invites,
  isSuperAdmin,
  onRevoke,
  revokePending,
}: InvitesTableProps) {
  return (
    <Table>
      <TableHeaderRow isSuperAdmin={isSuperAdmin} />
      <TableBody>
        {invites.length === 0 ? (
          <TableRow>
            <TableCell
              className="h-24 text-center text-muted-foreground"
              colSpan={5}
            >
              No invites yet.
            </TableCell>
          </TableRow>
        ) : (
          invites.map((invite) => (
            <InviteRow
              invite={invite}
              isSuperAdmin={isSuperAdmin}
              key={invite.id}
              onRevoke={onRevoke}
              revokePending={revokePending}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
