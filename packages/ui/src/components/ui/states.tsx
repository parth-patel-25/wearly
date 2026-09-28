import { cn } from "cn";
import { AlertCircle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { ComponentProps, ComponentType, ReactNode } from "react";

export type EmptyStateProps = ComponentProps<"div"> & {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
};

/**
 * Nothing here yet. An empty state should explain the situation and offer the
 * next step, rather than showing an illustration and leaving the user stuck.
 */
function EmptyState({
  className,
  icon: Icon = Inbox,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-border border-dashed bg-card px-6 py-12 text-center",
        className
      )}
      data-slot="empty-state"
      {...props}
    >
      <span className="flex size-12 items-center justify-center rounded-badge bg-accent text-accent-foreground">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <p className="text-heading-sm text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-balance text-body-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export type ErrorStateProps = Omit<ComponentProps<"div">, "title"> & {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * Something failed. Always pair it with a retry when the failure is likely
 * transient — a dead end with no way forward is worse than a slow screen.
 */
function ErrorState({
  className,
  title = "Something went wrong",
  description = "We couldn't load this just now. Please try again.",
  onRetry,
  retryLabel = "Try again",
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-destructive-background bg-destructive-background/40 px-6 py-12 text-center",
        className
      )}
      data-slot="error-state"
      role="alert"
      {...props}
    >
      <span className="flex size-12 items-center justify-center rounded-badge bg-destructive-background text-destructive-foreground">
        <AlertCircle aria-hidden="true" className="size-6" />
      </span>
      <p className="text-heading-sm text-foreground">{title}</p>
      <p className="max-w-sm text-balance text-body-sm text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <button
          className="mt-2 inline-flex h-9 items-center gap-2 rounded-button border border-border bg-card px-4 text-button-sm text-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export type LoadingStateProps = ComponentProps<"div"> & {
  label?: string;
};

/**
 * Shown while a whole region loads. Pass `aria-busy` on the region it fills so
 * assistive tech knows the content is still arriving.
 */
function LoadingState({
  className,
  label = "Loading",
  ...props
}: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-muted-foreground",
        className
      )}
      data-slot="loading-state"
      role="status"
      {...props}
    >
      <Loader2
        aria-hidden="true"
        className="size-6 animate-spin text-primary motion-reduce:animate-none"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { EmptyState, ErrorState, LoadingState };
