"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MapContainer } from "@/components/maps/map-container";
import { LocateFixed } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { demoEquipment, type Equipment } from "@/data/sampleData";
import type { Coordinates } from "@/lib/geo";

const userIcon = L.divIcon({
  className: "agrishare-user-marker",
  html: '<span style="display:block;width:18px;height:18px;border:3px solid #fff;border-radius:50%;background:#2E6FB0;box-shadow:0 0 0 8px rgba(46,111,176,.18)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const equipmentIcon = L.divIcon({
  className: "agrishare-equipment-marker",
  html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#1D7F5E;border:3px solid #fff;box-shadow:0 0 0 6px rgba(29,127,94,.14)"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function calculateDistanceKm(start: [number, number], end: [number, number]) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRad(end[0] - start[0]);
  const deltaLng = toRad(end[1] - start[1]);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRad(start[0])) * Math.cos(toRad(end[0])) * Math.sin(deltaLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

function LocateControl({ onMessage, onLocated }: { onMessage: (message: string) => void; onLocated: (point: Coordinates) => void }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);

  // Keep clicks on this button from also counting as a map click.
  useEffect(() => {
    if (controlRef.current) L.DomEvent.disableClickPropagation(controlRef.current);
  }, []);

  function locate() {
    if (!navigator.geolocation) {
      onMessage("Location is not available in this browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point: Coordinates = { lat: coords.latitude, lng: coords.longitude };
        map.flyTo([point.lat, point.lng], 11, { duration: 0.8 });
        onLocated(point);
        setIsLocating(false);
        onMessage("Map centered on your location.");
      },
      () => {
        setIsLocating(false);
        onMessage("Allow location access to center the map near you.");
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  }

  return (
    <div ref={controlRef} className="absolute bottom-5 right-5 z-[500]">
      <button id="leaflet-locate-button" onClick={locate} type="button" aria-label="Use my location" title="Use my location" className="grid size-11 place-items-center rounded-xl border border-border bg-white text-info shadow-panel hover:bg-info-soft disabled:opacity-50" disabled={isLocating}>
        <LocateFixed size={19} />
      </button>
    </div>
  );
}

function SyncLocation({ location }: { location: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 11, { duration: 0.8 });
  }, [location, map]);
  return null;
}

function MapPicker({ onMapClick }: { onMapClick: (point: Coordinates) => void }) {
  useMapEvents({
    click: ({ latlng }) => onMapClick({ lat: latlng.lat, lng: latlng.lng })
  });
  return null;
}

export default function LeafletMap({
  compact = false,
  equipment = demoEquipment,
  userLocation = null,
  onLocationChange,
  onMapClick
}: {
  compact?: boolean;
  equipment?: Equipment[];
  userLocation?: Coordinates | null;
  onLocationChange?: (location: Coordinates) => void;
  onMapClick?: (location: Coordinates) => void;
}) {
  const [message, setMessage] = useState("");

  const visibleEquipment = useMemo(() => {
    if (!userLocation) {
      return equipment;
    }

    return [...equipment].sort((left, right) => {
      const leftDistance = calculateDistanceKm([userLocation.lat, userLocation.lng], [left.location.lat, left.location.lng]);
      const rightDistance = calculateDistanceKm([userLocation.lat, userLocation.lng], [right.location.lat, right.location.lng]);
      return leftDistance - rightDistance;
    });
  }, [equipment, userLocation]);

  return (
    <div className={`relative h-full ${compact ? "min-h-0" : "min-h-[320px]"} overflow-hidden rounded-[inherit] ${onMapClick ? "[&_.leaflet-container]:cursor-crosshair" : ""}`}>
      <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [30.8138, 73.4534]} zoom={compact ? 8 : 9} scrollWheelZoom={!compact} zoomControl={!compact} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visibleEquipment.map((item) => (
          <Marker key={item.id} position={[item.location.lat, item.location.lng]} icon={equipmentIcon}>
            <Popup>
              <div className="space-y-1">
                {item.photos?.[0] && <img src={item.photos[0]} alt={item.title} className="mb-1.5 h-24 w-44 rounded-md object-cover" />}
                <strong className="block text-sm">{item.title}</strong>
                <span className="block text-xs text-muted">{item.city}</span>
                <span className="block text-xs font-semibold text-primary">PKR {item.pricePerDay.toLocaleString()} / day</span>
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />}
        <SyncLocation location={userLocation} />
        {onMapClick && <MapPicker onMapClick={onMapClick} />}
        <LocateControl onMessage={setMessage} onLocated={(point) => onLocationChange?.(point)} />
      </MapContainer>
      {onMapClick && <div className="pointer-events-none absolute left-1/2 top-2 z-[500] -translate-x-1/2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary-deep shadow">Click the map to pick a location</div>}
      {!compact && <div className="absolute bottom-2 left-2 z-[500] rounded-md bg-white/90 px-2 py-1 text-xs text-muted">© OpenStreetMap contributors</div>}
      {message && <div role="status" className="absolute bottom-5 left-5 z-[500] max-w-[240px] rounded-lg bg-white px-3 py-2 text-xs shadow-panel">{message}</div>}
      {compact && <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-full bg-white px-3 py-2 text-xs font-bold shadow">Punjab · Pakistan</div>}
    </div>
  );
}