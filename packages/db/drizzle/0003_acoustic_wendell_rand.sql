CREATE TABLE "favourites" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "favourites_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favourites_user_id_idx" ON "favourites" USING btree ("user_id");
--> statement-breakpoint
-- Idempotent condition backfill: legacy stored values translate to the
-- canonical five (`brand_new_with_tags`, `brand_new_without_tags`,
-- `excellent`, `good`, `fair`). Nothing is deleted; unknown strings are
-- untouched and render as "Not stated" (see `normaliseCondition` in the
-- mobile app).
UPDATE listings SET condition = 'good' WHERE lower(condition) = 'good';--> statement-breakpoint
UPDATE listings SET condition = 'excellent' WHERE lower(condition) = 'excellent';--> statement-breakpoint
UPDATE listings SET condition = 'fair' WHERE lower(condition) = 'fair';--> statement-breakpoint
UPDATE listings SET condition = 'brand_new_with_tags' WHERE lower(condition) = 'brand new with tags';--> statement-breakpoint
UPDATE listings SET condition = 'brand_new_without_tags' WHERE lower(condition) = 'brand new without tags';