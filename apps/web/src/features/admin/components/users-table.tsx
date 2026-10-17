"use client";

import type { AdminUser } from "@wearly/shared/api/types";
import { Button } from "@wearly/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wearly/ui/components/ui/table";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { AccountStatusBadge } from "./account-status-badge";
import { RoleBadge } from "./role-badge";
import { UserRowActions } from "./user-row-actions";

const PAGE_SIZE = 20;

interface UsersTableProps {
  currentUserId: string;
  isLoading?: boolean;
  offset: number;
  onOffsetChange: (offset: number) => void;
  total: number;
  users: AdminUser[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable({
  currentUserId,
  isLoading = false,
  onOffsetChange,
  offset,
  total,
  users,
}: UsersTableProps) {
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handlePrevious = useCallback(() => {
    onOffsetChange(Math.max(0, offset - PAGE_SIZE));
  }, [offset, onOffsetChange]);

  const handleNext = useCallback(() => {
    onOffsetChange(offset + PAGE_SIZE);
  }, [offset, onOffsetChange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-0">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={5}
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {user.name}
                      </span>
                      <span className="text-body-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <AccountStatusBadge user={user} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <UserRowActions currentUserId={currentUserId} user={user} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {isLoading ? (
          <div
            className="absolute inset-0 flex items-start justify-center bg-background/60 pt-24"
            role="status"
          >
            <Loader2
              aria-hidden="true"
              className="size-5 animate-spin text-primary motion-reduce:animate-none"
            />
            <span className="sr-only">Loading users</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-body-sm text-muted-foreground">
          {total} {total === 1 ? "user" : "users"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={offset === 0}
            onClick={handlePrevious}
            size="sm"
            type="button"
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-body-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button
            disabled={offset + PAGE_SIZE >= total}
            onClick={handleNext}
            size="sm"
            type="button"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
