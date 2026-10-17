"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MapContainer } from "@/components/maps/map-container";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Search, UserRound } from "lucide-react";
import { onValue, ref } from "firebase/database";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import { useDemoAuth } from "@/lib/demo-state";
import { type Equipment, type EquipmentStatus } from "@/data/sampleData";
import { db, firebaseConfigured } from "@/lib/firebase";
import { readLocalLiveLocations, subscribeLocalLiveLocations, type LiveLocation, type LiveLocationMap } from "@/lib/live-location";

const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451];

const statusColors: Record<EquipmentStatus, string> = {
  available: "#16a34a",
  rented: "#f59e0b",
  "pending approval": "#16a34a"
};

const defaultIcon = (color: string) =>
  L.divIcon({
    className: "admin-equipment-marker",
    html: `<span style="display:block;width:18px;height:18px;border-radius:999px;border:3px solid #fff;background:${color};box-shadow:0 0 0 8px rgba(255,255,255,0.12)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

const personIcon = (role: LiveLocation["role"], stale: boolean) => {
  const color = stale ? "#77817b" : role === "farmer" ? "#14532d" : "#123e73";
  const person = renderToStaticMarkup(<UserRound size={17} strokeWidth={2.3} color="white" />);
  const animation = stale ? "" : "animation:agrishare-live-pulse 1.8s ease-out infinite;";
  return L.divIcon({
    className: "admin-live-user-marker",
    html: `<span style="display:grid;place-items:center;width:34px;height:34px;border:2px solid white;border-radius:50%;background:${color};box-shadow:0 0 0 7px ${stale ? "rgba(100,116,108,.12)" : role === "farmer" ? "rgba(20,83,45,.18)" : "rgba(18,62,115,.18)"};opacity:${stale ? ".58" : "1"};${animation}">${person}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

function MapFocus({ target }: { target: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target, 11, { duration: 1.2 });
    }
  }, [map, target]);

  return null;
}

function FollowLiveUser({ target, onDrag }: { target: [number, number] | null; onDrag: () => void }) {
  const map = useMap();
  useMapEvents({ dragstart: onDrag });
  useEffect(() => {
    if (target) map.panTo(target, { animate: true, duration: 0.9 });
  }, [map, target]);
  return null;
}

function formatAge(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `Updated ${seconds} sec ago`;
  return `Last seen ${Math.floor(seconds / 60)} min ago`;
}

function formatLastSeen(timestamp: number): string {
  const minutes = Math.floor(Math.max(0, Date.now() - timestamp) / 60_000);
  return `Last seen ${minutes < 1 ? "less than 1" : minutes} min ago`;
}

export default function AdminEquipmentMap() {
  const { data } = useDemoAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<Array<{ lat: string; lon: string; display_name: string }>>([]);
  const [showEquipment, setShowEquipment] = useState(true);
  const [showLiveUsers, setShowLiveUsers] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<[number, number] | null>(null);
  const [liveLocations, setLiveLocations] = useState<LiveLocationMap>({});
  const [connectionMode, setConnectionMode] = useState<"firebase" | "local">("local");
  const [animatedPositions, setAnimatedPositions] = useState<Record<string, [number, number]>>({});
  const [followUserId, setFollowUserId] = useState<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const trailRefs = useRef<Record<string, [number, number][]>>({});
  const animationRefs = useRef<Record<string, number>>({});

  const filteredEquipment = useMemo(() => {
    return data.equipment.filter((item) => {
      return item.status === "available";
    });
  }, [data.equipment]);

  useEffect(() => {
    const localUnsubscribe = subscribeLocalLiveLocations((locations) => {
      setLiveLocations((current) => ({ ...current, ...locations }));
    });
    if (!db || !firebaseConfigured) {
      setConnectionMode("local");
      setLiveLocations(readLocalLiveLocations());
      return localUnsubscribe;
    }

    let receivedInitialValue = false;
    setConnectionMode("local");
    setLiveLocations(readLocalLiveLocations());
    const fallbackTimer = window.setTimeout(() => {
      if (!receivedInitialValue) {
        setConnectionMode("local");
        setLiveLocations(readLocalLiveLocations());
      }
    }, 5000);
    const unsubscribeFirebase = onValue(
      ref(db, "liveLocations"),
      (snapshot) => {
        receivedInitialValue = true;
        window.clearTimeout(fallbackTimer);
        setConnectionMode("firebase");
        setLiveLocations((snapshot.val() as LiveLocationMap | null) ?? {});
      },
      () => {
        window.clearTimeout(fallbackTimer);
        setConnectionMode("local");
        setLiveLocations(readLocalLiveLocations());
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      unsubscribeFirebase();
      localUnsubscribe();
    };
  }, []);

  useEffect(() => {
    Object.values(liveLocations).forEach((location) => {
      if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
      const target: [number, number] = [location.lat, location.lng];
      const previousTrail = trailRefs.current[location.userId] ?? [];
      const previousPoint = previousTrail[previousTrail.length - 1];
      if (!previousPoint || previousPoint[0] !== target[0] || previousPoint[1] !== target[1]) {
        trailRefs.current[location.userId] = [...previousTrail, target].slice(-20);
      }

      const start = animatedPositions[location.userId] ?? previousPoint ?? target;
      const startedAt = performance.now();
      window.cancelAnimationFrame(animationRefs.current[location.userId] ?? 0);
      const animate = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 1000);
        const eased = 1 - (1 - progress) * (1 - progress);
        setAnimatedPositions((current) => ({
          ...current,
          [location.userId]: [
            start[0] + (target[0] - start[0]) * eased,
            start[1] + (target[1] - start[1]) * eased
          ]
        }));
        if (progress < 1) animationRefs.current[location.userId] = window.requestAnimationFrame(animate);
      };
      animationRefs.current[location.userId] = window.requestAnimationFrame(animate);
    });
  }, [liveLocations]);

  useEffect(() => () => Object.values(animationRefs.current).forEach((frame) => window.cancelAnimationFrame(frame)), []);

  const activeLiveUsers = Object.values(liveLocations).filter(
    (location) => location.sharing && Date.now() - location.updatedAt <= 120_000
  );
  const followLocation = followUserId ? liveLocations[followUserId] : null;

  async function searchMap() {
    const query = searchQuery.trim();
    if (!query) return;
    const normalizedQuery = query.toLocaleLowerCase();
    const equipmentMatch = data.equipment.find((item) => item.title.toLocaleLowerCase().includes(normalizedQuery) || item.ownerName.toLocaleLowerCase().includes(normalizedQuery));
    if (equipmentMatch) {
      setSelectedTarget([equipmentMatch.location.lat, equipmentMatch.location.lng]);
      markerRefs.current[equipmentMatch.id]?.openPopup();
      setPlaceResults([]);
      return;
    }
    const liveUserMatch = Object.values(liveLocations).find((location) => location.name.toLocaleLowerCase().includes(normalizedQuery));
    if (liveUserMatch) {
      setSelectedTarget([liveUserMatch.lat, liveUserMatch.lng]);
      setPlaceResults([]);
      return;
    }
    const lastRequest = (window as Window & { __agrishareLastPlaceSearch?: number }).__agrishareLastPlaceSearch ?? 0;
    const now = Date.now();
    if (now - lastRequest < 1000) {
      setPlaceResults([]);
      return;
    }
    (window as Window & { __agrishareLastPlaceSearch?: number }).__agrishareLastPlaceSearch = now;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=pk&limit=5&q=${encodeURIComponent(query)}`);
    const json = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    setPlaceResults(json.slice(0, 5));
  }

  function handlePlaceChoice(result: { lat: string; lon: string; display_name: string }) {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setSelectedTarget([lat, lng]);
    setSearchQuery(result.display_name.split(",")[0] || result.display_name);
    setPlaceResults([]);
  }

  return (
    <div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_230px]">
      <div className="relative h-[min(68vh,620px)] min-h-[420px] min-w-0 overflow-hidden rounded-lg border border-[#deddd3] bg-[#e8e6d2]">
        <MapContainer center={PAKISTAN_CENTER} zoom={6} scrollWheelZoom className="h-full w-full" attributionControl>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading>
            {showEquipment && filteredEquipment.map((item) => (
              <Marker
                key={item.id}
                ref={(node) => {
                  markerRefs.current[item.id] = node;
                }}
                position={[item.location.lat, item.location.lng]}
                icon={defaultIcon(statusColors[item.status])}
              >
                <Popup>
                  <div className="min-w-[180px] space-y-2 text-sm text-slate-700">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div>{item.ownerName}</div>
                    <div>{item.city}</div>
                    <div className="font-medium text-[#0f172a]">PKR {item.pricePerDay.toLocaleString()} / day</div>
                    <div className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{item.status === "rented" ? "In use" : "Available"}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
          {showLiveUsers && Object.values(liveLocations).map((location) => {
              const fresh = location.sharing && Date.now() - location.updatedAt <= 120_000;
              const position = animatedPositions[location.userId] ?? [location.lat, location.lng] as [number, number];
              const trail = trailRefs.current[location.userId] ?? [];
              return (
                <Fragment key={location.userId}>
                  {trail.length > 1 && <Polyline positions={trail} pathOptions={{ color: location.role === "farmer" ? "#14532d" : "#123e73", opacity: fresh ? 0.55 : 0.2, weight: 3 }} />}
                  {fresh && <Circle center={position} radius={Math.max(0, location.accuracy || 0)} pathOptions={{ color: location.role === "farmer" ? "#14532d" : "#123e73", fillOpacity: 0.08, weight: 1 }} />}
                  <Marker position={position} icon={personIcon(location.role, !fresh)}>
                    <Popup>
                      <div className="min-w-[190px] space-y-2 text-sm text-slate-700">
                        <div className="font-bold text-slate-900">{location.name}</div>
                        <div className="capitalize">{location.role}</div>
                        <div>Speed: {location.speed === null ? "Unavailable" : `${(location.speed * 3.6).toFixed(1)} km/h`}</div>
                        <div>{fresh ? `Updated ${Math.max(0, Math.floor((Date.now() - location.updatedAt) / 1000))} sec ago` : formatLastSeen(location.updatedAt)}</div>
                        <button type="button" onClick={() => setFollowUserId(location.userId)} className="rounded-lg bg-[#175b39] px-3 py-1.5 text-xs font-semibold text-white">Follow</button>
                      </div>
                    </Popup>
                  </Marker>
                </Fragment>
              );
            })}
          <MapFocus target={selectedTarget} />
          <FollowLiveUser
            target={followLocation && followUserId ? [followLocation.lat, followLocation.lng] : null}
            onDrag={() => setFollowUserId(null)}
          />
        </MapContainer>

        <div className="absolute left-3 top-3 z-[600] w-[min(320px,calc(100%-24px))]">
          <form onSubmit={(event) => { event.preventDefault(); void searchMap(); }} className="flex h-10 items-center gap-2 rounded-lg border border-[#d5d2c5] bg-white px-3 shadow-md">
            <Search size={15} className="shrink-0 text-[#697267]"/>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs text-[#1e2a1f] outline-none placeholder:text-[#7b8176]" placeholder="Search place, equipment or user…" aria-label="Search place, equipment or user"/>
            <button type="submit" className="sr-only">Search</button>
          </form>
          {placeResults.length > 0 && <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#deddd3] bg-white p-1 shadow-lg">{placeResults.map((result) => <button key={`${result.lat}-${result.lon}`} type="button" onClick={() => handlePlaceChoice(result)} className="block w-full rounded-md px-2 py-2 text-left text-xs text-[#334138] hover:bg-[#f4f3ed]">{result.display_name}</button>)}</div>}
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
          © OpenStreetMap contributors
        </div>

        <div className="absolute bottom-3 left-3 z-[500] rounded-lg border border-white/80 bg-white/95 p-2.5 text-xs text-[#334138] shadow-sm">
          <div className="mb-1.5 font-bold uppercase tracking-wide">Show on map</div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2"><input type="checkbox" checked={showEquipment} onChange={() => setShowEquipment((current) => !current)} className="accent-[#2e5e3a]"/><span className="size-2 rounded-sm bg-[#17643a]"/>Available equipment</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={showLiveUsers} onChange={() => setShowLiveUsers((current) => !current)} className="accent-[#2e5e3a]"/><span className="size-2 rounded-full bg-[#2e6fb0]"/>Users (live)</label>
          </div>
        </div>
        <div className={`absolute bottom-4 right-4 z-[500] rounded-full px-3 py-1.5 text-xs font-semibold ${connectionMode === "firebase" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
          ● {connectionMode === "firebase" ? "Live (Firebase)" : "Local mode"}
        </div>
      </div>
      <aside className="grid content-start gap-4 rounded-lg border border-[#deddd3] bg-white p-3 xl:max-h-[620px] xl:overflow-y-auto">
        <section>
          <h3 className="text-sm font-bold text-[#1e2a1f]">In use now</h3>
          <div className="mt-2 divide-y divide-[#e5e1d5]">
            {data.equipment.filter((item) => item.status === "rented").slice(0, 5).map((item) => <button key={item.id} type="button" onClick={() => { setFollowUserId(null); setSelectedTarget([item.location.lat, item.location.lng]); markerRefs.current[item.id]?.openPopup(); }} className="block w-full py-2 text-left hover:bg-[#f7f6f0]"><span className="block truncate text-xs font-bold text-[#26352b]">{item.title}</span><span className="mt-0.5 block truncate text-xs text-[#697267]">Used by {item.ownerName} · {item.city}</span></button>)}
            {data.equipment.every((item) => item.status !== "rented") && <p className="py-2 text-xs text-[#697267]">No equipment in use.</p>}
          </div>
        </section>
        <section className="border-t border-[#e5e1d5] pt-3">
        <h3 className="text-sm font-bold text-[#1e2a1f]">Live users ({activeLiveUsers.length})</h3>
        <div className="mt-2 space-y-1.5">
          {activeLiveUsers.map((location) => (
            <button
              key={location.userId}
              type="button"
              onClick={() => {
                setFollowUserId(null);
                setSelectedTarget([location.lat, location.lng]);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left hover:bg-[#f4f3ed]"
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-[#26352b]">{location.name}</span>
                <span className="block text-xs capitalize text-[#697267]">{location.role} · {formatAge(location.updatedAt)}</span>
              </span>
              <span className="size-2 shrink-0 rounded-full bg-[#2E6FB0]" aria-label="Live" />
            </button>
          ))}
          {activeLiveUsers.length === 0 && <p className="py-2 text-xs leading-5 text-[#697267]">No users are sharing their location right now.</p>}
        </div>
        </section>
      </aside>
      </div>
    </div>
  );
}
