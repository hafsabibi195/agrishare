"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, List, LocateFixed, Map as MapIcon, MapPin, Search, Tractor } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { demoUsers, type Equipment } from "@/data/sampleData";
import { LiveLocationControl } from "@/components/live-location-control";
import { formatDistanceKm, haversineDistanceKm, type Coordinates } from "@/lib/geo";
import { useDemoAuth } from "@/lib/demo-state";

const EquipmentMap = dynamic(() => import("@/components/maps/leaflet-map"), { ssr: false, loading: () => <div className="h-full min-h-[420px] animate-pulse bg-[#E8E6D2]" /> });
const categories = ["All", "Tractor", "Harvester", "Sprayer", "Thresher", "Rotavator"];
const radii = [10, 25];
type PlaceSuggestion = { place_id: number; lat: string; lon: string; display_name: string };

export default function EquipmentNearMePage() {
  const { data, auth } = useDemoAuth();
  const isOwner = auth.currentUser?.role === "owner";
  const [radius, setRadius] = useState(25);
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [view, setView] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placeMessage, setPlaceMessage] = useState("");
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [locationMessage, setLocationMessage] = useState("Finding equipment near your location…");

  useEffect(() => {
    const query = locationQuery.trim();
    if (query.length < 3) {
      setPlaceSuggestions([]);
      setPlaceMessage("");
      setIsSearchingPlace(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingPlace(true);
      try {
        const params = new URLSearchParams({ format: "jsonv2", countrycodes: "pk", limit: "5", q: query });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Location suggestions are unavailable right now.");
        const places = await response.json() as PlaceSuggestion[];
        setPlaceSuggestions(places);
        setPlaceMessage(places.length ? "" : "No Pakistani places matched. Try another search.");
      } catch (searchError) {
        if (!controller.signal.aborted) setPlaceMessage(searchError instanceof Error ? searchError.message : "Could not search places.");
      } finally {
        if (!controller.signal.aborted) setIsSearchingPlace(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [locationQuery]);

  function selectPlace(place: PlaceSuggestion) {
    setUserLocation({ lat: Number(place.lat), lng: Number(place.lon) });
    setLocationQuery(place.display_name.split(",").slice(0, 2).join(","));
    setPlaceSuggestions([]);
    setPlaceMessage("");
    setLocationMessage(`Showing equipment near ${place.display_name.split(",")[0]}.`);
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is unavailable in this browser. Enable location services to find nearby equipment.");
      return;
    }
    setLocationMessage("Finding equipment near your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocationMessage("");
      },
      (error) => {
        setUserLocation(null);
        setLocationMessage(error.code === error.PERMISSION_DENIED
          ? "Location blocked. Allow location in browser settings to see equipment within your radius."
          : "Could not get your location. Check location services and try again.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const filteredEquipment = useMemo<(Equipment & { distanceKm: number | null })[]>(() => {
    return data.equipment.flatMap((equipment) => {
      const matchesCategory = category === "All" || equipment.category.toLowerCase() === category.toLowerCase();
      const matchesPrice = equipment.pricePerDay <= maxPrice;
      const distanceKm = userLocation ? haversineDistanceKm(userLocation, equipment.location) : null;
      const matchesRadius = distanceKm === null || distanceKm <= radius;
      return matchesCategory && matchesPrice && matchesRadius ? [{ ...equipment, distanceKm }] : [];
    }).sort((left, right) => {
      if (left.distanceKm !== null && right.distanceKm !== null) return left.distanceKm - right.distanceKm;
      if (left.availability !== right.availability) return left.availability === "available" ? -1 : 1;
      return left.title.localeCompare(right.title);
    });
  }, [category, data.equipment, maxPrice, radius, userLocation]);

  return <main className="min-h-screen overflow-hidden bg-background">
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background-paper px-5 py-2 lg:hidden"><Brand/><LiveLocationControl compact/><a href="/dashboard" className="text-sm font-semibold text-primary">Dashboard</a></header>
    <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:min-h-screen lg:grid-cols-[248px_440px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-background-paper px-4 pb-5 pt-5 lg:block">
        <div className="flex h-9 items-center gap-2 px-2"><MapPin size={18} className="text-primary"/><span className="text-sm font-bold">{isOwner ? "Owner account" : "Farmer account"}</span></div>
        <nav className="mt-4 flex flex-col gap-1">{(isOwner ? [["Dashboard","/dashboard"],["My equipment","/dashboard#equipment"],["List equipment","/equipment/list"],["Find equipment","/equipment/near-me"],["Booking requests","/dashboard#requests"]] : [["Dashboard","/dashboard"],["Find equipment","/equipment/near-me"]]).map(([label,href])=><a key={label} href={href} className={`rounded-[10px] px-3 py-3 text-sm ${label==="Find equipment"?"bg-primary-soft font-bold text-primary":"text-[#3E4A3C] hover:bg-white"}`}>{label}</a>)}</nav>
        <a href="/admin/login" className="mt-10 block px-3 text-xs text-muted hover:text-primary">Admin portal →</a>
      </aside>
      <section className="flex min-h-[620px] flex-col gap-5 border-r border-border bg-background-paper p-5 sm:p-6">
        <div className="hidden lg:block"><LiveLocationControl /></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Equipment search</p><h1 className="mt-2 font-display text-[28px] font-semibold">Equipment near you</h1><button type="button" onClick={requestLocation} className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-primary"><MapPin size={15} className="text-info"/>Use current location</button>{locationMessage && <p role="status" className="mt-2 text-xs leading-5 text-muted">{locationMessage}</p>}</div>
        <div className="relative">
          <label htmlFor="equipment-location" className="mb-2 block text-xs font-bold text-[#3E4A3C]">Search location in Pakistan</label>
          <div className="flex gap-2"><input id="equipment-location" type="text" value={locationQuery} autoComplete="off" role="combobox" aria-autocomplete="list" aria-controls="equipment-place-suggestions" aria-expanded={placeSuggestions.length > 0} onChange={(event) => { setLocationQuery(event.target.value); setUserLocation(null); setLocationMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (placeSuggestions[0]) selectPlace(placeSuggestions[0]); } }} placeholder="Town, village, or address" className="h-10 min-w-0 flex-1 rounded-[10px] border border-border-strong bg-white px-3 text-sm outline-none focus:border-primary"/><button type="button" aria-label="Search location" onClick={() => placeSuggestions[0] && selectPlace(placeSuggestions[0])} disabled={!placeSuggestions.length} className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-primary text-white disabled:opacity-50"><Search size={17}/></button></div>
          {(placeSuggestions.length > 0 || isSearchingPlace || placeMessage) && <div id="equipment-place-suggestions" role="listbox" aria-label="Pakistan location suggestions" className="absolute inset-x-0 top-full z-[700] mt-1 max-h-56 overflow-y-auto rounded-lg border border-border-strong bg-white py-1 shadow-lg">{isSearchingPlace && <p role="status" className="px-3 py-2 text-xs text-muted">Searching places…</p>}{placeSuggestions.map((place) => <button key={place.place_id} type="button" role="option" aria-selected="false" onClick={() => selectPlace(place)} className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs hover:bg-background"><MapPin size={14} className="mt-0.5 shrink-0 text-primary"/><span>{place.display_name}</span></button>)}{!isSearchingPlace && placeMessage && <p role="status" className="px-3 py-2 text-xs text-muted">{placeMessage}</p>}</div>}
        </div>
        <div><div className="mb-2 text-xs font-bold text-[#3E4A3C]">Search radius</div><div className="grid grid-cols-2 gap-2">{radii.map((value)=><button key={value} type="button" aria-pressed={radius===value} onClick={()=>setRadius(value)} className={`h-10 rounded-[10px] border text-sm font-semibold transition ${radius===value?"border-primary bg-primary text-white":"border-border-strong bg-white hover:border-primary"}`}>{value} km</button>)}</div></div>
        <fieldset><legend className="mb-2 text-xs font-bold text-[#3E4A3C]">Category</legend><div className="flex flex-wrap gap-2">{categories.map((value)=><button key={value} type="button" aria-pressed={category===value} onClick={()=>setCategory(value)} className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${category===value?"border-primary-deep bg-primary-deep text-white":"border-border-strong bg-white hover:border-primary"}`}>{value}</button>)}</div></fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2 text-xs font-bold text-[#3E4A3C]">Max price / day<input type="range" min="1000" max="10000" step="500" value={maxPrice} onChange={(event)=>setMaxPrice(Number(event.target.value))} className="mt-1 accent-primary"/><span className="font-medium text-muted">Up to Rs {maxPrice.toLocaleString()}</span></label>
          <label className="flex flex-col gap-2 text-xs font-bold text-[#3E4A3C]">Available on<span className="relative"><CalendarDays size={15} className="absolute left-3 top-3 text-muted"/><input type="date" className="h-10 w-full rounded-[10px] border border-border-strong bg-white pl-9 pr-2 text-xs font-medium outline-none focus:border-primary" /></span></label>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted"><span><strong className="text-primary-deep">{filteredEquipment.length} listings</strong>{userLocation ? ` within ${radius} km` : " matching filters"}</span><span>{userLocation ? "Nearest first" : "Available first"}</span></div>
        <div className="grid gap-3">
          {filteredEquipment.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-white p-3.5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">{item.city} · {item.category}{item.distanceKm !== null ? ` · ${formatDistanceKm(item.distanceKm)}` : ""}</p>
                </div>
                <Badge variant={item.availability === "available" ? "green" : "neutral"}>{item.availability}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>PKR {item.pricePerDay.toLocaleString()} / day</span>
                <span>{item.rating.toFixed(1)} ★</span>
              </div>
              <p className="mt-2 text-xs text-muted">Owner: {item.ownerName} · <a className="font-semibold text-primary hover:underline" href={`tel:${item.contactPhone ?? demoUsers.find((owner) => owner.id === item.ownerId)?.phone ?? ""}`}>{item.contactPhone ?? demoUsers.find((owner) => owner.id === item.ownerId)?.phone ?? "Contact unavailable"}</a></p>
            </div>
          ))}
          {filteredEquipment.length === 0 && (
            <div className="rounded-xl border border-dashed border-border-strong bg-white p-4 text-sm leading-6 text-muted">
              No equipment matches within {radius} km. Try the 25 km radius, another category, or a higher price limit.
            </div>
          )}
        </div>
      </section>
      <section className="relative min-h-[520px] bg-[#E8E6D2] lg:min-h-0">
        <div className="absolute left-4 top-4 z-[600] flex rounded-xl bg-white p-1 shadow-panel"><button type="button" aria-pressed={view==="map"} onClick={()=>setView("map")} className={`flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold ${view==="map"?"bg-primary-deep text-white":"text-primary-deep"}`}><MapIcon size={15}/>Map</button><button type="button" aria-pressed={view==="list"} onClick={()=>setView("list")} className={`flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold ${view==="list"?"bg-primary-deep text-white":"text-primary-deep"}`}><List size={15}/>List</button></div>
        {view === "map" ? <div className="absolute inset-0"><EquipmentMap equipment={filteredEquipment} userLocation={userLocation} onLocationChange={setUserLocation}/></div> : <div className="h-full min-h-[520px] overflow-y-auto bg-background-paper p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold">Equipment listings</h2><p className="mt-1 text-sm text-muted">Rates, availability and owner contact details.</p></div><Badge variant="neutral">{filteredEquipment.length} results</Badge></div><div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{filteredEquipment.map((item) => { const owner = demoUsers.find((candidate) => candidate.id === item.ownerId); const contactPhone = item.contactPhone ?? owner?.phone; return <article key={item.id} className="rounded-xl border border-border bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-xs text-muted">{item.category} · {item.city}{item.distanceKm !== null ? ` · ${formatDistanceKm(item.distanceKm)}` : ""}</p></div><Badge variant={item.availability === "available" ? "green" : "neutral"}>{item.availability}</Badge></div><p className="mt-3 line-clamp-2 text-sm leading-5 text-muted">{item.description}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className="text-sm font-bold">PKR {item.pricePerDay.toLocaleString()} <span className="font-normal text-muted">/ day</span></span><a href={contactPhone ? `tel:${contactPhone}` : undefined} className="text-sm font-semibold text-primary hover:underline">{contactPhone ?? "Contact owner"}</a></div><p className="mt-2 text-xs text-muted">Owner: {item.ownerName}</p></article>; })}</div></div>}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[600] flex items-center gap-2 rounded-md bg-white/90 px-2.5 py-1.5 text-[10px] text-muted"><LocateFixed size={12}/>OpenStreetMap · use location control to center map</div>
      </section>
    </div>
  </main>;
}
