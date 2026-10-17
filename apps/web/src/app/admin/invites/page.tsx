import type { Metadata } from "next";
import { AdminInvitesPageClient } from "@/features/admin/components/admin-invites-page-client";

export const metadata: Metadata = {
  title: "Invites · Admin",
};

export default function AdminInvitesPage() {
  return <AdminInvitesPageClient />;
}
