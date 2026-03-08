"use client";

import type { RankedPlace } from "@/lib/types";

type Props = {
  place?: RankedPlace;
  onClose: () => void;
};

export function PlaceModal({ place, onClose }: Props) {
  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 md:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold">{place.name}</h3>
        <p className="mt-1 text-sm text-foreground/70">{place.address}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>Distance: {place.distanceKm?.toFixed(1)} km</div>
          <div>Status: {place.openNow ? "Open" : "Closed/Unknown"}</div>
          <div>Rating: {place.rating?.toFixed(1) ?? "N/A"}</div>
          <div>Score: {place.score.toFixed(2)}</div>
        </div>

        <p className="mt-3 text-sm">{place.why}</p>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {place.phone ? <a href={`tel:${place.phone}`} className="underline">Call</a> : null}
          {place.website ? (
            <a href={place.website} target="_blank" rel="noreferrer" className="underline">
              Website
            </a>
          ) : null}
          {place.mapsUrl ? (
            <a href={place.mapsUrl} target="_blank" rel="noreferrer" className="underline">
              Directions
            </a>
          ) : null}
        </div>

        <button type="button" className="mt-5 rounded-full border px-4 py-2 text-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
