import type { Metadata } from "next";
import { AdminUsersPageClient } from "@/features/admin/components/admin-users-page-client";

export const metadata: Metadata = {
  title: "Users · Admin",
};

export default function AdminUsersPage() {
  return <AdminUsersPageClient />;
}
