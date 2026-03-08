import { haversineDistanceKm } from "@/lib/geo";
import type { Place, RankedPlace, RankingInput } from "@/lib/types";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function textRelevance(intent: string, place: Place): number {
  const haystack = `${place.name} ${place.types?.join(" ") ?? ""}`.toLowerCase();
  const tokens = intent.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0.4;

  const matches = tokens.filter((token) => haystack.includes(token)).length;
  return clamp(matches / tokens.length);
}

function uniqueByNameAndAddress(places: Place[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = `${place.name.toLowerCase()}|${place.address.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function rankPlaces({ intent, userLocation, places }: RankingInput): RankedPlace[] {
  const deduped = uniqueByNameAndAddress(places);

  return deduped
    .map((place) => {
      const distanceKm = haversineDistanceKm(userLocation, place.coordinates);
      const normalizedDistance = clamp(1 - distanceKm / 20);
      const rating = place.rating ?? 0;
      const normalizedRating = clamp(rating / 5);
      const openBoost = place.openNow === true ? 1 : 0;
      const relevance = textRelevance(intent, place);

      const score =
        normalizedDistance * 0.35 +
        normalizedRating * 0.3 +
        openBoost * 0.2 +
        relevance * 0.15;

      const badges: string[] = [];
      if (place.openNow) badges.push("Open now");
      if (distanceKm <= 2) badges.push("Very close");
      if ((place.rating ?? 0) >= 4.6) badges.push("Top rated");

      let why = `~${distanceKm.toFixed(1)} km away`;
      if (place.openNow && (place.rating ?? 0) >= 4.5) {
        why = "Strong balance of high rating and currently open status.";
      } else if (distanceKm <= 2) {
        why = "Best for quick arrival based on distance.";
      } else if ((place.rating ?? 0) >= 4.6) {
        why = "Excellent customer ratings nearby.";
      }

      return {
        ...place,
        distanceKm,
        score,
        badges,
        why
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function summaryFromRanking(places: RankedPlace[]): string {
  if (!places.length) {
    return "No strong matches found nearby. Try widening your search radius or intent.";
  }

  const best = places[0];
  const open = places.find((p) => p.openNow);
  const topRated = [...places].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];

  return [
    `Best overall right now: ${best.name}.`,
    open ? `Closest open option: ${open.name}.` : "No currently open options were confirmed.",
    topRated ? `Highest rated nearby: ${topRated.name}${topRated.rating ? ` (${topRated.rating.toFixed(1)})` : ""}.` : ""
  ]
    .filter(Boolean)
    .join(" ");
}
