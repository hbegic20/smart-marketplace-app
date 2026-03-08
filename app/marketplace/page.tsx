"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { AskAgentPanel } from "@/components/marketplace/ask-agent-panel";
import { BusinessCard } from "@/components/marketplace/business-card";
import { MapView } from "@/components/marketplace/map-view";
import { PlaceModal } from "@/components/marketplace/place-modal";
import { SearchControls } from "@/components/marketplace/search-controls";
import type { Coordinates, RankedPlace } from "@/lib/types";

const fallbackCenter: Coordinates = { lat: 30.2672, lng: -97.7431 };

export default function MarketplacePage() {
  const [intent, setIntent] = useState("car mechanic");
  const [locationQuery, setLocationQuery] = useState("Bugojno");
  const [radiusMeters, setRadiusMeters] = useState(7000);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [center, setCenter] = useState<Coordinates>(fallbackCenter);
  const [places, setPlaces] = useState<RankedPlace[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [modalPlace, setModalPlace] = useState<RankedPlace>();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const filtered = useMemo(
    () => (openNowOnly ? places.filter((p) => p.openNow) : places),
    [places, openNowOnly]
  );

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCenter(next);
        setError("");
      },
      () => setError("Unable to read your GPS location. You can still search manually."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const search = async () => {
    setBusy(true);
    setError("");

    const payload = {
      city: locationQuery,
      service: intent
    } as const;

    try {
      const res = await fetch("/agent/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      // Support both transformed response and raw backend response.
      if (Array.isArray(data.rankedPlaces)) {
        setCenter(data.center ?? fallbackCenter);
        setSummary(data.summary ?? "");
        setPlaces(data.rankedPlaces ?? []);
      } else if (Array.isArray(data.results)) {
        const mapped: RankedPlace[] = data.results.map(
          (
            place: { name: string; lat?: number; lng?: number; distance?: number; distanceKm?: number; source?: string },
            index: number
          ) => ({
            id: `${place.name}-${index}`.replace(/\s+/g, "-"),
            name: place.name,
            address: place.name,
            coordinates: {
              lat: place.lat ?? center.lat,
              lng: place.lng ?? center.lng
            },
            distanceKm: place.distanceKm ?? place.distance ?? 0,
            score: Math.max(0, 100 - index * 5),
            badges: place.source ? [place.source] : [],
            why: "Returned by agent search"
          })
        );
        setPlaces(mapped);
        setCenter(mapped[0]?.coordinates ?? center);
        setSummary(`Found ${mapped.length} providers near ${locationQuery}`);
      } else {
        throw new Error("Invalid response from proxy");
      }

      setRecentSearches((prev) => [intent, ...prev.filter((i) => i !== intent)].slice(0, 5));
      const first = (data.rankedPlaces?.[0]?.id as string | undefined) ?? undefined;
      if (first) {
        setSelectedId(first);
      } else if (Array.isArray(data.results) && data.results[0]) {
        setSelectedId(`${data.results[0].name}-0`.replace(/\s+/g, "-"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error while searching");
      setPlaces([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI Local Services Marketplace</h1>
          <p className="text-sm text-foreground/70">Search nearby providers and get agent-ranked recommendations.</p>
        </div>
        <ThemeToggle />
      </header>

      <SearchControls
        intent={intent}
        setIntent={setIntent}
        locationQuery={locationQuery}
        setLocationQuery={setLocationQuery}
        radiusMeters={radiusMeters}
        setRadiusMeters={setRadiusMeters}
        openNowOnly={openNowOnly}
        setOpenNowOnly={setOpenNowOnly}
        onUseMyLocation={useMyLocation}
        onSearch={search}
        busy={busy}
      />

      {recentSearches.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {recentSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setIntent(item)}
              className="rounded-full border bg-card px-3 py-1"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {summary ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border bg-card px-4 py-3 text-sm"
        >
          {summary}
        </motion.p>
      ) : null}

      {error ? <p className="mt-3 rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <MapView
            center={center}
            places={filtered}
            selectedId={selectedId}
            onPinClick={(place) => {
              setSelectedId(place.id);
              setModalPlace(place);
            }}
          />

          <div className="grid gap-3">
            {filtered.map((place) => (
              <BusinessCard
                key={place.id}
                place={place}
                selected={selectedId === place.id}
                onHover={setSelectedId}
                onClick={() => setModalPlace(place)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AskAgentPanel intent={intent} userLocation={center} rankedPlaces={filtered} />
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="text-lg font-semibold">Featured Listings (Mock)</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Monetization hook for promoted providers. Keep transparent labeling in production.
            </p>
            <div className="mt-3 rounded-xl border border-dashed p-3 text-sm">
              Featured placement slot API can be injected here without altering ranking fairness logic.
            </div>
          </section>
        </div>
      </section>

      <PlaceModal place={modalPlace} onClose={() => setModalPlace(undefined)} />
    </main>
  );
}
