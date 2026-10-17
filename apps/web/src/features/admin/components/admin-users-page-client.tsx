"use client";

import { Input } from "@wearly/ui/components/ui/input";
import { Skeleton } from "@wearly/ui/components/ui/skeleton";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { UsersTable } from "../components/users-table";
import { useAdminUsers } from "../hooks/use-admin-users";

const PAGE_SIZE = 20;

/**
 * Users list page. Owns search / pagination / include-deleted state; the
 * table is a pure renderer (Rule 1: narrow props, no feature object).
 */
export function AdminUsersPageClient() {
  const { data: session } = authClient.useSession();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Debounce the search so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isPending, error } = useAdminUsers({
    includeDeleted,
    limit: PAGE_SIZE,
    offset,
    search: debouncedSearch,
  });

  const handleIncludeDeletedChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIncludeDeleted(event.target.checked);
      setOffset(0);
    },
    []
  );

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    []
  );

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-11 w-full max-w-sm" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-body-sm text-destructive" role="alert">
        Could not load users. {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-foreground text-heading-sm">Users</h1>
        <label className="flex items-center gap-2 text-body-sm text-muted-foreground">
          <input
            checked={includeDeleted}
            className="size-4 accent-primary"
            onChange={handleIncludeDeletedChange}
            type="checkbox"
          />
          Show deleted
        </label>
      </div>

      <Input
        aria-label="Search users"
        onChange={handleSearchChange}
        placeholder="Search by name or email…"
        type="search"
        value={search}
      />

      <UsersTable
        currentUserId={session?.user.id ?? ""}
        offset={offset}
        onOffsetChange={setOffset}
        total={data?.total ?? 0}
        users={data?.items ?? []}
      />
    </div>
  );
}
