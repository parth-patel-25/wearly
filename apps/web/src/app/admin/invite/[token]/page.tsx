import type { Metadata } from "next";
import { InviteLandingClient } from "@/features/admin/components/invite-landing-client";

export const metadata: Metadata = {
  title: "Admin invitation",
};

export default async function InviteLandingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InviteLandingClient token={token} />;
}
