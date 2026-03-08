"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon, LatLngExpression } from "leaflet";
import type { Coordinates, RankedPlace } from "@/lib/types";

type Props = {
  center: Coordinates;
  places: RankedPlace[];
  selectedId?: string;
  onPinClick: (place: RankedPlace) => void;
};

function ViewportSync({ center, selectedPlace }: { center: Coordinates; selectedPlace?: RankedPlace }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace) {
      map.flyTo([selectedPlace.coordinates.lat, selectedPlace.coordinates.lng], 14, { duration: 0.7 });
      return;
    }
    map.flyTo([center.lat, center.lng], 12, { duration: 0.7 });
  }, [map, center.lat, center.lng, selectedPlace]);

  return null;
}

function pinIcon(selected: boolean) {
  return divIcon({
    className: "map-pin-wrapper",
    html: `<span class="map-pin ${selected ? "map-pin--selected" : ""}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

export function MapView({ center, places, selectedId, onPinClick }: Props) {
  const mapCenter = useMemo<LatLngExpression>(() => [center.lat, center.lng], [center.lat, center.lng]);
  const selectedPlace = places.find((p) => p.id === selectedId);

  return (
    <div className="h-[360px] overflow-hidden rounded-2xl border md:h-[520px]">
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <ViewportSync center={center} selectedPlace={selectedPlace} />

        <Marker position={[center.lat, center.lng]} icon={pinIcon(false)}>
          <Popup>You are here</Popup>
        </Marker>

        {places.map((place) => {
          const selected = selectedId === place.id;

          return (
            <Marker
              key={place.id}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={pinIcon(selected)}
              eventHandlers={{
                click: () => onPinClick(place)
              }}
            >
              <Popup>
                <div>
                  <strong>{place.name}</strong>
                  <br />
                  {place.distanceKm?.toFixed(1)} km
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
