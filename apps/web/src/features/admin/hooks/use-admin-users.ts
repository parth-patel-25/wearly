"use client";

import { useQuery } from "@tanstack/react-query";
import { browserApi } from "@/lib/api-browser";

export interface ListUsersParams {
  includeDeleted: boolean;
  limit: number;
  offset: number;
  search: string;
}

/** Cached, paginated user list for the admin panel. */
export function useAdminUsers(params: ListUsersParams) {
  return useQuery({
    queryFn: () =>
      browserApi.admin.listUsers({
        includeDeleted: params.includeDeleted,
        limit: params.limit,
        offset: params.offset,
        search: params.search || undefined,
      }),
    queryKey: [
      "admin",
      "users",
      params.search,
      params.offset,
      params.includeDeleted,
    ],
  });
}
