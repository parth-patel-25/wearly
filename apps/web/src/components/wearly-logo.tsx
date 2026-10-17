import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";

type WearlyLogoSize = "sm" | "lg";

/** Mark heights; width follows the asset's fixed 2048×1162 aspect. */
const MARK_HEIGHT: Record<WearlyLogoSize, string> = {
  lg: "h-14",
  sm: "h-6",
};

interface WearlyLogoProps {
  className?: string;
  /** Renders a link when provided; a plain mark otherwise. */
  href?: ComponentProps<typeof Link>["href"];
  size?: WearlyLogoSize;
}

/**
 * The approved Wearly flow mark (`assets/brand/wearly-flow-mark.svg` on mobile,
 * copied to `/public/brand`). Light and dark are two files swapped by the
 * `.dark` class — no JS, so there is no hydration flash. The alt text carries
 * the brand name, so no separate wordmark is needed.
 */
export function WearlyLogo({ className, href, size = "sm" }: WearlyLogoProps) {
  const mark = (
    <>
      <Image
        alt="Wearly"
        className={cn("w-auto dark:hidden", MARK_HEIGHT[size])}
        height={1162}
        src="/brand/wearly-flow-mark.svg"
        unoptimized
        width={2048}
      />
      <Image
        alt=""
        aria-hidden="true"
        className={cn("hidden w-auto dark:block", MARK_HEIGHT[size])}
        height={1162}
        src="/brand/wearly-flow-mark-dark.svg"
        unoptimized
        width={2048}
      />
    </>
  );

  if (href) {
    return (
      <Link className={cn("inline-flex items-center", className)} href={href}>
        {mark}
      </Link>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>{mark}</span>
  );
}
