import { cn } from "cn";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import type { ComponentProps } from "react";
import { Badge } from "./ui/badge";

export interface ProductCardImage {
  alt: string;
  src: string;
}

type Availability = "available" | "rented" | null;
type Condition = "new" | "popular" | null;

export interface ProductCardProps
  extends Omit<ComponentProps<"article">, "children"> {
  availability?: Availability;
  brand?: string;
  condition?: Condition;
  favorited?: boolean;
  /** Link the card. When absent the card renders as a plain article. */
  href?: string;
  /** Photography is the point of this card, so the image is required. */
  image: ProductCardImage;
  location?: string;
  onFavoriteChange?: () => void;
  /** Price per day in the seller's currency, already formatted. */
  pricePerDay: string;
  /** Out of 5. Omit rather than showing a placeholder. */
  rating?: number;
  reviewCount?: number;
  size?: string;
  title: string;
}

const conditionLabels: Record<Exclude<Condition, null>, string> = {
  new: "New",
  popular: "Popular",
};

const availabilityLabels: Record<Exclude<Availability, null>, string> = {
  available: "Available",
  rented: "Rented",
};

/** Status pills. Absent values are omitted rather than rendered empty. */
function ProductCardStatus({
  availability,
  condition,
}: {
  availability?: Availability;
  condition?: Condition;
}) {
  if (!(condition || availability)) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      {condition ? (
        <Badge className="bg-card/90 backdrop-blur-sm" variant="secondary">
          {conditionLabels[condition]}
        </Badge>
      ) : null}
      {availability ? (
        <Badge
          className="backdrop-blur-sm"
          variant={availability === "available" ? "success" : "secondary"}
        >
          {availabilityLabels[availability]}
        </Badge>
      ) : null}
    </div>
  );
}

/**
 * Wishlist toggle.
 *
 * Sits in the media block's padding rather than floating over the photo, so it
 * never covers the garment and stays a reliable 44px touch target. The filled
 * state uses `primary` rather than the decorative `brand` tone, because
 * `aria-pressed` makes this a control with text-equivalent state, not
 * decoration.
 */
function ProductCardFavorite({
  favorited,
  onFavoriteChange,
  title,
}: {
  favorited?: boolean;
  onFavoriteChange?: (() => void) | undefined;
  title: string;
}) {
  if (!onFavoriteChange) {
    return null;
  }

  return (
    <button
      aria-label={
        favorited
          ? `Remove ${title} from wishlist`
          : `Save ${title} to wishlist`
      }
      aria-pressed={favorited}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-badge",
        "bg-card/90 text-foreground shadow-soft backdrop-blur-sm",
        "transition-colors duration-150 ease-out",
        "hover:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30",
        "active:scale-95 motion-reduce:active:scale-100"
      )}
      onClick={onFavoriteChange}
      type="button"
    >
      <Heart
        aria-hidden="true"
        className={cn(
          "size-5 transition-colors duration-150 ease-out",
          favorited && "fill-primary text-primary"
        )}
      />
    </button>
  );
}

/** 4:5 image block — the largest element on the card. */
function ProductCardMedia({
  availability,
  condition,
  favorited,
  image,
  onFavoriteChange,
  title,
}: Pick<
  ProductCardProps,
  | "availability"
  | "condition"
  | "favorited"
  | "image"
  | "onFavoriteChange"
  | "title"
>) {
  return (
    <div className="relative aspect-4/5 w-full overflow-hidden rounded-media bg-muted">
      <Image
        alt={image.alt}
        className="object-cover"
        fill
        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
        src={image.src}
      />
      <div className="flex flex-row items-start justify-between gap-2 p-3">
        <ProductCardStatus availability={availability} condition={condition} />
        <ProductCardFavorite
          favorited={favorited}
          onFavoriteChange={onFavoriteChange}
          title={title}
        />
      </div>
    </div>
  );
}

/** Rating and location. The star is decorative; the number carries the value. */
function ProductCardDetail({
  location,
  rating,
  reviewCount,
}: Pick<ProductCardProps, "location" | "rating" | "reviewCount">) {
  if (rating === undefined && !location) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-3 text-caption text-muted-foreground">
      {rating === undefined ? null : (
        <span className="flex flex-row items-center gap-1">
          <Star
            aria-hidden="true"
            className="size-3.5 fill-warning text-warning"
          />
          <span className="font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
          {reviewCount === undefined ? null : <span>({reviewCount})</span>}
        </span>
      )}
      {location ? <span className="truncate">{location}</span> : null}
    </div>
  );
}

/**
 * Metadata, deliberately capped at three facts.
 *
 * Product name and price lead. Upload timestamps and similar low-value details
 * are omitted rather than shrunk, because a card that shows everything
 * communicates nothing.
 */
function ProductCardMeta({
  brand,
  location,
  pricePerDay,
  rating,
  reviewCount,
  size,
  title,
}: Pick<
  ProductCardProps,
  | "brand"
  | "location"
  | "pricePerDay"
  | "rating"
  | "reviewCount"
  | "size"
  | "title"
>) {
  return (
    <div className="flex flex-col gap-1.5 p-4">
      {brand ? (
        <p className="text-caption text-muted-foreground uppercase">{brand}</p>
      ) : null}
      <h3 className="line-clamp-1 font-medium text-body-md text-card-foreground">
        {title}
      </h3>
      <div className="flex flex-row items-baseline justify-between gap-2">
        <p className="font-medium text-body-md text-foreground">
          {pricePerDay}
          <span className="font-normal text-muted-foreground"> /day</span>
        </p>
        {size ? (
          <p className="text-caption text-muted-foreground">Size {size}</p>
        ) : null}
      </div>
      <ProductCardDetail
        location={location}
        rating={rating}
        reviewCount={reviewCount}
      />
    </div>
  );
}

/**
 * The marketplace's primary unit of content.
 *
 * Imagery dominates and metadata stays short. Everything resolves through shared
 * tokens, so re-theming the card is a change in `packages/design-tokens`.
 */
function ProductCard({
  className,
  image,
  title,
  pricePerDay,
  brand,
  size,
  rating,
  reviewCount,
  location,
  availability = "available",
  condition = null,
  favorited = false,
  href,
  onFavoriteChange,
  ...props
}: ProductCardProps) {
  const media = (
    <ProductCardMedia
      availability={availability}
      condition={condition}
      favorited={favorited}
      image={image}
      onFavoriteChange={onFavoriteChange}
      title={title}
    />
  );

  const meta = (
    <ProductCardMeta
      brand={brand}
      location={location}
      pricePerDay={pricePerDay}
      rating={rating}
      reviewCount={reviewCount}
      size={size}
      title={title}
    />
  );

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border border-border bg-card",
        "shadow-soft transition-shadow duration-200 ease-out",
        "hover:shadow-raised",
        className
      )}
      data-slot="product-card"
      {...props}
    >
      {href ? (
        <a
          className="flex flex-col focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:ring-inset"
          href={href}
        >
          {media}
          {meta}
        </a>
      ) : (
        <>
          {media}
          {meta}
        </>
      )}
    </article>
  );
}

export { ProductCard };
