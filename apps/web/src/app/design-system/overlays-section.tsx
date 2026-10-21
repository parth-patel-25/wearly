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
  DialogTrigger,
} from "@wearly/ui/components/ui/dialog";
import { Input } from "@wearly/ui/components/ui/input";
import { Label } from "@wearly/ui/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@wearly/ui/components/ui/tabs";
import { toast } from "sonner";
import { Section } from "./section";

function showSuccess() {
  toast.success("Invite sent to priya@example.com");
}

function showError() {
  toast.error("Could not send the invite");
}

function showWarning() {
  toast.warning("This piece is only available through Sunday");
}

function showInfo() {
  toast.info("New listings near you appear here first");
}

function showLongError() {
  toast.error(
    "Could not update the listing — the photos are still uploading, so we saved your changes as a draft and will retry shortly"
  );
}

export function OverlaysSection() {
  return (
    <>
      <Section
        description="28px radius with generous padding, and a scrim soft enough that the dialog stays the focus. On mobile, prefer a bottom sheet."
        id="dialogs"
        title="Dialogs"
      >
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Rent this dress</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rent this dress</DialogTitle>
                <DialogDescription>
                  Satin slip dress · Zara · Size S · Indiranagar
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Label htmlFor="ds-dates">Rental dates</Label>
                <Input id="ds-dates" placeholder="12 Aug – 16 Aug" />
                <div className="flex flex-row items-center justify-between rounded-pill bg-muted px-4 py-3">
                  <span className="text-body-sm text-muted-foreground">
                    ₹299 × 4 days
                  </span>
                  <span className="font-medium text-body-md">₹1,196</span>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Confirm rental</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>

      <Section
        description="The active tab sits in a card-coloured pill inside a muted track, so the selection is clear without a heavy underline."
        id="tabs"
        title="Tabs"
      >
        <Tabs defaultValue="available">
          <TabsList>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="rented">Rented</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          <TabsContent
            className="rounded-card border border-border bg-card p-5 text-muted-foreground"
            value="available"
          >
            326 listings are available to rent right now.
          </TabsContent>
          <TabsContent
            className="rounded-card border border-border bg-card p-5 text-muted-foreground"
            value="rented"
          >
            91 listings are currently out with a renter.
          </TabsContent>
          <TabsContent
            className="rounded-card border border-border bg-card p-5 text-muted-foreground"
            value="requests"
          >
            14 owners are waiting for you to respond.
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        description="One pill above the page: card surface, hairline border, rose disc with a white glyph. Tone is carried by the icon, never by colour alone. Dismisses after 4s or on swipe."
        id="toasts"
        title="Toasts"
      >
        <div className="flex flex-wrap gap-3">
          <Button onClick={showSuccess} variant="soft">
            Success
          </Button>
          <Button onClick={showError} variant="destructive">
            Error
          </Button>
          <Button onClick={showWarning} variant="outline">
            Warning
          </Button>
          <Button onClick={showInfo} variant="outline">
            Info
          </Button>
          <Button onClick={showLongError} variant="outline">
            Long message
          </Button>
        </div>
      </Section>
    </>
  );
}
