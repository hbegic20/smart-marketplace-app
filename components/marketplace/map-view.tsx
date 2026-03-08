"use client";

import { motion } from "framer-motion";
import Map, { Marker, Popup } from "react-map-gl";
import type { Coordinates, RankedPlace } from "@/lib/types";

type Props = {
  center: Coordinates;
  places: RankedPlace[];
  selectedId?: string;
  onPinClick: (place: RankedPlace) => void;
};

export function MapView({ center, places, selectedId, onPinClick }: Props) {
  return (
    <div className="h-[360px] overflow-hidden rounded-2xl border md:h-[520px]">
      <Map
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 12
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        <Popup longitude={center.lng} latitude={center.lat} closeButton={false} closeOnClick={false}>
          You are here
        </Popup>

        {places.map((place, idx) => {
          const isSelected = selectedId === place.id;
          return (
            <Marker
              key={place.id}
              longitude={place.coordinates.lng}
              latitude={place.coordinates.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onPinClick(place);
              }}
            >
              <motion.button
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                className={`h-7 w-7 rounded-full border-2 border-white ${isSelected ? "bg-accent" : "bg-primary"} shadow-glow`}
                aria-label={place.name}
              />
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
