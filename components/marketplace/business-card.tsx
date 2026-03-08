"use client";

import { motion } from "framer-motion";
import { MapPinned, Phone, Star } from "lucide-react";
import type { RankedPlace } from "@/lib/types";

type Props = {
  place: RankedPlace;
  selected: boolean;
  onHover: (id?: string) => void;
  onClick: () => void;
};

export function BusinessCard({ place, selected, onHover, onClick }: Props) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(undefined)}
      onClick={onClick}
      className={`w-full rounded-2xl border bg-card p-4 text-left transition ${selected ? "ring-2 ring-accent" : "hover:border-accent/60"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{place.name}</h3>
          <p className="mt-1 text-sm text-foreground/70">{place.address}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{place.score.toFixed(2)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {place.badges.map((badge) => (
          <span key={badge} className="rounded-full bg-accent/10 px-2 py-1 text-accent">
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="inline-flex items-center gap-1">
          <MapPinned size={14} /> {place.distanceKm?.toFixed(1)} km
        </div>
        <div className="inline-flex items-center gap-1">
          <Star size={14} /> {place.rating?.toFixed(1) ?? "N/A"}
        </div>
      </div>

      <p className="mt-2 text-sm text-foreground/80">{place.why}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {place.phone ? (
          <a className="inline-flex items-center gap-1 underline" href={`tel:${place.phone}`}>
            <Phone size={12} /> Call
          </a>
        ) : null}
        {place.website ? (
          <a className="underline" href={place.website} target="_blank" rel="noreferrer">
            Website
          </a>
        ) : null}
        {place.mapsUrl ? (
          <a className="underline" href={place.mapsUrl} target="_blank" rel="noreferrer">
            Directions
          </a>
        ) : null}
      </div>
    </motion.button>
  );
}
