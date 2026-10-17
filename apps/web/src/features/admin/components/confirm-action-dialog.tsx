"use client";

import { Button } from "@wearly/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@wearly/ui/components/ui/dialog";
import { useCallback, useState } from "react";

export interface ConfirmAction {
  description: string;
  label: string;
  onConfirm: () => void;
  title: string;
  variant?: "default" | "destructive";
}

/**
 * Owned confirmation dialog: the parent only says *what* to confirm; this
 * component owns open state, busy state and the confirm press.
 */
export function ConfirmActionDialog({
  action,
  onOpenChange,
  open,
}: {
  action: ConfirmAction | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [isBusy, setIsBusy] = useState(false);

  const handleConfirm = useCallback(() => {
    if (!action) {
      return;
    }
    setIsBusy(true);
    try {
      action.onConfirm();
    } finally {
      setIsBusy(false);
      onOpenChange(false);
    }
  }, [action, onOpenChange]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action?.title ?? "Are you sure?"}</DialogTitle>
          <DialogDescription>
            {action?.description ?? "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button
            aria-busy={isBusy}
            disabled={isBusy}
            onClick={handleConfirm}
            type="button"
            variant={
              action?.variant === "destructive" ? "destructive" : "default"
            }
          >
            {action?.label ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
