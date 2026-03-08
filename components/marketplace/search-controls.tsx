"use client";

import { LocateFixed, Search } from "lucide-react";

type Props = {
  intent: string;
  setIntent: (value: string) => void;
  locationQuery: string;
  setLocationQuery: (value: string) => void;
  radiusMeters: number;
  setRadiusMeters: (value: number) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (value: boolean) => void;
  onUseMyLocation: () => void;
  onSearch: () => void;
  busy?: boolean;
};

export function SearchControls({
  intent,
  setIntent,
  locationQuery,
  setLocationQuery,
  radiusMeters,
  setRadiusMeters,
  openNowOnly,
  setOpenNowOnly,
  onUseMyLocation,
  onSearch,
  busy
}: Props) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm text-foreground/70">Service intent</span>
          <input
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2"
            placeholder="car mechanic, plumber, electrician..."
          />
        </label>
        <label>
          <span className="mb-1 block text-sm text-foreground/70">Location (manual)</span>
          <input
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2"
            placeholder="Bugojno"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label>
          <span className="mb-1 block text-sm text-foreground/70">Radius: {(radiusMeters / 1000).toFixed(0)} km</span>
          <input
            type="range"
            min={2000}
            max={30000}
            step={1000}
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm md:mt-6">
          <input type="checkbox" checked={openNowOnly} onChange={(e) => setOpenNowOnly(e.target.checked)} />
          Open now only
        </label>

        <div className="flex flex-wrap items-end gap-2 md:justify-end">
          <button
            type="button"
            onClick={onUseMyLocation}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
          >
            <LocateFixed size={14} /> Use GPS
          </button>
          <button
            type="button"
            onClick={onSearch}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            <Search size={14} /> {busy ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
    </section>
  );
}
