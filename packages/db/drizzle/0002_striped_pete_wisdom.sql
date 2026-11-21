CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rental_id" uuid NOT NULL,
	"opened_by_id" text NOT NULL,
	"category" text NOT NULL,
	"details" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolution_notes" text,
	"resolved_by_id" text,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "meetup_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rental_id" uuid NOT NULL,
	"proposed_by_id" text NOT NULL,
	"place_name" text NOT NULL,
	"area_label" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"note" text,
	"status" text DEFAULT 'proposed' NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rental_id" uuid NOT NULL,
	"actor_id" text,
	"type" text NOT NULL,
	"from_status" text,
	"to_status" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rentals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"renter_id" text NOT NULL,
	"lender_id" text NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"fulfillment_method" text DEFAULT 'in_person' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer NOT NULL,
	"price_per_day_rupees" integer NOT NULL,
	"rental_amount_rupees" integer NOT NULL,
	"cleaning_fee_rupees" integer DEFAULT 0 NOT NULL,
	"deposit_rupees" integer DEFAULT 0 NOT NULL,
	"total_rupees" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"payment_status" text DEFAULT 'not_started' NOT NULL,
	"payment_provider" text,
	"payment_reference" text,
	"authorized_at" timestamp with time zone,
	"captured_at" timestamp with time zone,
	"voided_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"respond_by_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"declined_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" text,
	"cancel_reason" text,
	"activated_at" timestamp with time zone,
	"return_due_at" timestamp with time zone,
	"returned_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"handover_acknowledged_at" timestamp with time zone,
	"no_show_reported_by" text,
	"no_show_reported_at" timestamp with time zone,
	"requested_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "area_label" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "fulfillment_methods" text[] DEFAULT '{"in_person"}' NOT NULL;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_rental_id_rentals_id_fk" FOREIGN KEY ("rental_id") REFERENCES "public"."rentals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_opened_by_id_user_id_fk" FOREIGN KEY ("opened_by_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_id_user_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetup_proposals" ADD CONSTRAINT "meetup_proposals_rental_id_rentals_id_fk" FOREIGN KEY ("rental_id") REFERENCES "public"."rentals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetup_proposals" ADD CONSTRAINT "meetup_proposals_proposed_by_id_user_id_fk" FOREIGN KEY ("proposed_by_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_events" ADD CONSTRAINT "rental_events_rental_id_rentals_id_fk" FOREIGN KEY ("rental_id") REFERENCES "public"."rentals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental_events" ADD CONSTRAINT "rental_events_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_renter_id_user_id_fk" FOREIGN KEY ("renter_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_lender_id_user_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "disputes_rental_idx" ON "disputes" USING btree ("rental_id","status");--> statement-breakpoint
CREATE INDEX "meetup_proposals_rental_status_idx" ON "meetup_proposals" USING btree ("rental_id","status");--> statement-breakpoint
CREATE INDEX "rental_events_rental_idx" ON "rental_events" USING btree ("rental_id","created_at");--> statement-breakpoint
CREATE INDEX "rentals_renter_status_idx" ON "rentals" USING btree ("renter_id","status");--> statement-breakpoint
CREATE INDEX "rentals_lender_status_idx" ON "rentals" USING btree ("lender_id","status");--> statement-breakpoint
CREATE INDEX "rentals_listing_window_idx" ON "rentals" USING btree ("listing_id","status","start_date","end_date");--> statement-breakpoint
CREATE INDEX "rentals_respond_by_idx" ON "rentals" USING btree ("respond_by_at");--> statement-breakpoint
CREATE INDEX "listings_status_location_idx" ON "listings" USING btree ("status","latitude","longitude");