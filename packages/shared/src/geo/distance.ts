/**
 * Distance, display rounding and the progressive search bands.
 *
 * The bands are labels, not filters. A caller may group results under them, but
 * ranking is continuous, so a strong match at 1.2 km can still beat a weak one
 * at 72 m.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DistanceBand {
  label: string;
  /** Exclusive upper bound in metres; the last band is inclusive. */
  maxMeters: number;
  /** Inclusive lower bound in metres. */
  minMeters: number;
}

const EARTH_RADIUS_METERS = 6_371_000;
const METRES_PER_DEGREE = Math.PI / 180;

export const MAX_DISCOVERY_RADIUS_METERS = 5000;

export const DISTANCE_BANDS: readonly DistanceBand[] = [
  { label: "Within 20 m", maxMeters: 20, minMeters: 0 },
  { label: "20–50 m", maxMeters: 50, minMeters: 20 },
  { label: "50–100 m", maxMeters: 100, minMeters: 50 },
  { label: "100–150 m", maxMeters: 150, minMeters: 100 },
  { label: "150–200 m", maxMeters: 200, minMeters: 150 },
  { label: "200–500 m", maxMeters: 500, minMeters: 200 },
  { label: "500 m–1 km", maxMeters: 1000, minMeters: 500 },
  { label: "1–2 km", maxMeters: 2000, minMeters: 1000 },
  { label: "2–5 km", maxMeters: MAX_DISCOVERY_RADIUS_METERS, minMeters: 2000 },
] as const;

export function isValidCoordinates(value: Coordinates): boolean {
  return (
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}

/** Great-circle distance in metres. */
export function distanceMeters(from: Coordinates, to: Coordinates): number {
  const lat1 = from.latitude * METRES_PER_DEGREE;
  const lat2 = to.latitude * METRES_PER_DEGREE;
  const deltaLat = (to.latitude - from.latitude) * METRES_PER_DEGREE;
  const deltaLng = (to.longitude - from.longitude) * METRES_PER_DEGREE;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * What the renter is allowed to see. Coarse enough that repeated queries cannot
 * pin a home address, precise enough to be useful at walking distance.
 */
export function roundDistanceForDisplay(meters: number): number {
  if (!Number.isFinite(meters) || meters < 0) {
    return 0;
  }
  if (meters >= 1000) {
    return Math.round(meters / 100) * 100;
  }
  return Math.round(meters / 10) * 10;
}

/** "48 m" / "1.2 km" — the value only, no "away" suffix. */
export function formatDistance(meters: number): string {
  const rounded = roundDistanceForDisplay(meters);
  if (rounded < 1000) {
    return `${rounded} m`;
  }
  const kilometres = rounded / 1000;
  return `${kilometres.toFixed(kilometres < 10 ? 1 : 0)} km`;
}

export function distanceBandFor(meters: number): DistanceBand | null {
  const rounded = roundDistanceForDisplay(meters);
  return (
    DISTANCE_BANDS.find(
      (band) =>
        rounded >= band.minMeters &&
        (rounded < band.maxMeters ||
          (band.maxMeters === MAX_DISCOVERY_RADIUS_METERS &&
            rounded <= band.maxMeters))
    ) ?? null
  );
}
