import type { Coordinates, Place } from "@/lib/types";

const GOOGLE_BASE = "https://maps.googleapis.com/maps/api";
const MAPBOX_SEARCH = "https://api.mapbox.com/search/searchbox/v1";

type SearchParams = {
  intent: string;
  userLocation?: Coordinates;
  locationQuery?: string;
  radiusMeters?: number;
};

async function geocodeWithGoogle(locationQuery: string, apiKey: string): Promise<Coordinates | null> {
  const url = `${GOOGLE_BASE}/geocode/json?address=${encodeURIComponent(locationQuery)}&key=${apiKey}`;
  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) return null;
  const data = await response.json();
  const item = data.results?.[0]?.geometry?.location;
  if (!item) return null;
  return { lat: item.lat, lng: item.lng };
}

async function nearbyGooglePlaces(intent: string, center: Coordinates, radiusMeters: number, apiKey: string): Promise<Place[]> {
  const searchUrl = `${GOOGLE_BASE}/place/nearbysearch/json?location=${center.lat},${center.lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(intent)}&key=${apiKey}`;
  const searchRes = await fetch(searchUrl, { next: { revalidate: 0 } });
  if (!searchRes.ok) {
    throw new Error(`Places search failed: ${searchRes.status}`);
  }

  const searchData = await searchRes.json();
  const results = searchData.results ?? [];

  return results.map((item: any) => ({
    id: item.place_id,
    name: item.name,
    address: item.vicinity ?? item.formatted_address ?? "Address unavailable",
    coordinates: {
      lat: item.geometry?.location?.lat,
      lng: item.geometry?.location?.lng
    },
    rating: item.rating,
    userRatingsTotal: item.user_ratings_total,
    openNow: item.opening_hours?.open_now,
    mapsUrl: `https://www.google.com/maps/place/?q=place_id:${item.place_id}`,
    businessStatus: item.business_status,
    types: item.types ?? []
  }));
}

async function geocodeWithMapbox(locationQuery: string, token: string): Promise<Coordinates | null> {
  const url = `${MAPBOX_SEARCH}/forward?access_token=${token}&q=${encodeURIComponent(locationQuery)}&limit=1&types=place,locality,address`;
  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) return null;
  const data = await response.json();
  const first = data.features?.[0];
  if (!first?.geometry?.coordinates) return null;
  return { lat: first.geometry.coordinates[1], lng: first.geometry.coordinates[0] };
}

async function nearbyMapboxPlaces(intent: string, center: Coordinates, token: string): Promise<Place[]> {
  const proximity = `${center.lng},${center.lat}`;
  const url = `${MAPBOX_SEARCH}/forward?access_token=${token}&q=${encodeURIComponent(intent)}&proximity=${proximity}&limit=20&types=poi`;
  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) {
    throw new Error(`Mapbox search failed: ${response.status}`);
  }

  const data = await response.json();
  return (data.features ?? []).map((feature: any) => ({
    id: feature.properties?.mapbox_id ?? feature.id,
    name: feature.properties?.name ?? feature.text ?? "Unknown",
    address: feature.properties?.full_address ?? feature.place_name ?? "Address unavailable",
    coordinates: {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0]
    },
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`,
    types: feature.properties?.poi_category ?? []
  }));
}

export async function searchNearbyPlaces(
  params: SearchParams,
  cfg: {
    provider: "google" | "mapbox";
    googleApiKey?: string;
    mapboxToken?: string;
  }
): Promise<{ center: Coordinates; places: Place[] }> {
  const radius = params.radiusMeters ?? 7000;

  if (cfg.provider === "google") {
    if (!cfg.googleApiKey) throw new Error("GOOGLE_MAPS_API_KEY is required for Google provider");

    const center =
      params.userLocation ??
      (params.locationQuery ? await geocodeWithGoogle(params.locationQuery, cfg.googleApiKey) : null);

    if (!center) throw new Error("A valid location is required to search nearby places.");

    const places = await nearbyGooglePlaces(params.intent, center, radius, cfg.googleApiKey);
    return { center, places };
  }

  if (!cfg.mapboxToken) throw new Error("MAPBOX_ACCESS_TOKEN is required for Mapbox provider");

  const center =
    params.userLocation ??
    (params.locationQuery ? await geocodeWithMapbox(params.locationQuery, cfg.mapboxToken) : null);

  if (!center) throw new Error("A valid location is required to search nearby places.");

  const places = await nearbyMapboxPlaces(params.intent, center, cfg.mapboxToken);
  return { center, places };
}
