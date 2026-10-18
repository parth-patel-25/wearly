"use client";

import { INVITE_STATUS, ROLES } from "@wearly/shared/enums";
import { Button } from "@wearly/ui/components/ui/button";
import { Skeleton } from "@wearly/ui/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useAcceptInvite, useInviteByToken } from "../hooks/use-admin-actions";

/**
 * Invite landing (`/admin/invite/:token`). Reads the token from the emailed
 * link; the invitee must be signed in as the invited email before accepting.
 */
export function InviteLandingClient({ token }: { token: string }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: invite, isPending, error } = useInviteByToken(token);
  const { mutate: acceptInvite, isPending: accepting } = useAcceptInvite();

  const handleAccept = useCallback(() => {
    acceptInvite(token, {
      onSuccess: () => {
        router.push("/admin/users");
        router.refresh();
      },
    });
  }, [acceptInvite, router, token]);

  const handleSignIn = useCallback(() => {
    router.push(
      `/sign-in?next=${encodeURIComponent(`/admin/invite/${token}`)}`
    );
  }, [router, token]);

  if (isPending || sessionPending) {
    return <Skeleton className="h-64 max-w-md" />;
  }

  if (error || !invite) {
    return (
      <div className="max-w-md">
        <h1 className="text-foreground text-heading-sm">Invite not found</h1>
        <p className="mt-2 text-body-sm text-muted-foreground">
          This invitation link is invalid or has expired.
        </p>
        <Link
          className="mt-6 inline-block text-primary underline-offset-4 hover:underline"
          href="/design-system"
        >
          Back to Wearly
        </Link>
      </div>
    );
  }

  let action: ReactNode;
  if (session) {
    if (session.user.email?.toLowerCase() === invite.email.toLowerCase()) {
      if (invite.status === INVITE_STATUS.PENDING) {
        action = (
          <Button
            aria-busy={accepting}
            className="mt-6 w-full"
            disabled={accepting}
            onClick={handleAccept}
            type="button"
          >
            {accepting ? "Accepting…" : "Accept invitation"}
          </Button>
        );
      } else {
        action = (
          <p className="mt-4 text-body-sm text-muted-foreground">
            This invitation is {invite.status} and can no longer be accepted.
          </p>
        );
      }
    } else {
      action = (
        <p className="mt-4 text-body-sm text-destructive" role="alert">
          You are signed in as {session.user.email}, but this invitation was
          issued to {invite.email}. Sign in with that address to accept.
        </p>
      );
    }
  } else {
    action = (
      <>
        <p className="mt-4 text-body-sm text-muted-foreground">
          Sign in as {invite.email} to accept this invitation.
        </p>
        <Button className="mt-6 w-full" onClick={handleSignIn} type="button">
          Sign in to accept
        </Button>
        <p className="mt-4 text-center text-body-sm text-muted-foreground">
          No account yet?{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href={`/sign-up?next=${encodeURIComponent(`/admin/invite/${token}`)}`}
          >
            Create one
          </Link>
        </p>
      </>
    );
  }

  return (
    <div className="max-w-md rounded-card border border-border bg-card p-8 shadow-soft">
      <h1 className="text-foreground text-heading-sm">You're invited</h1>
      <p className="mt-2 text-body-sm text-muted-foreground">
        {invite.email} has been invited to join the Wearly admin team as{" "}
        <strong>
          {invite.role === ROLES.ADMIN ? "an admin" : invite.role}
        </strong>
        .
      </p>
      {action}
    </div>
  );
}
