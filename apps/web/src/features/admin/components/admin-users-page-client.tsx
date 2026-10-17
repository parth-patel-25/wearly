"use client";

import { Input } from "@wearly/ui/components/ui/input";
import { Skeleton } from "@wearly/ui/components/ui/skeleton";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import { UsersTable } from "../components/users-table";
import { useAdminUsers } from "../hooks/use-admin-users";

const PAGE_SIZE = 20;

/**
 * Users list page. Owns search / pagination / include-deleted state; the
 * table is a pure renderer (Rule 1: narrow props, no feature object).
 *
 * The header and search box stay mounted across requests — only the table
 * region shows a loader (Rule 7: loading belongs to the operation that owns
 * it). `keepPreviousData` in the hook keeps the last rows visible while the
 * next search resolves, so the search box never flashes or loses focus.
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

  const { data, error, isFetching, isPending } = useAdminUsers({
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

  let table: ReactNode;
  if (isPending) {
    table = <Skeleton className="h-96" />;
  } else if (error) {
    table = (
      <p className="text-body-sm text-destructive" role="alert">
        Could not load users. {error.message}
      </p>
    );
  } else {
    table = (
      <UsersTable
        currentUserId={session?.user.id ?? ""}
        isLoading={isFetching}
        offset={offset}
        onOffsetChange={setOffset}
        total={data?.total ?? 0}
        users={data?.items ?? []}
      />
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

      {table}
    </div>
  );
}
