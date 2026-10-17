"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, CloudSun, Leaf, LocateFixed, LogOut, MapPin, Phone, Search, Sprout, Tractor, UserRound, Wheat, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { MapPreview } from "@/components/map-preview";
import { demoEquipment, type EquipmentCategory } from "@/data/sampleData";
import { useDemoAuth } from "@/lib/demo-state";
import { farmImages } from "@/lib/equipment-images";
import { MAX_LISTING_PHOTOS, compressPhoto } from "@/lib/photo-upload";
import { formatCoordinates, reverseGeocode } from "@/lib/reverse-geocode";
import type { Coordinates } from "@/lib/geo";

const categories: EquipmentCategory[] = ["Tractor", "Harvester", "Sprayer", "Thresher", "Rotavator"];

type GeocodingResult = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: Record<string, string>;
};

function getPlaceLabel(place: GeocodingResult) {
  return place.address?.city
    ?? place.address?.town
    ?? place.address?.village
    ?? place.address?.municipality
    ?? place.address?.suburb
    ?? place.name
    ?? place.display_name.split(",").slice(0, 2).join(",");
}

export default function DashboardPage() {
  const router = useRouter();
  const { auth, data, addEquipment, logout } = useDemoAuth();
  const user = auth.currentUser;
  const [location, setLocation] = useState("");
  const [locationMode, setLocationMode] = useState<"current" | "search">("search");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<GeocodingResult[]>([]);
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [isSuggestingLocation, setIsSuggestingLocation] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const mapPickRef = useRef(0);
  const [photoMessage, setPhotoMessage] = useState("");
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const previewEquipment = data.equipment.length ? data.equipment : demoEquipment;

  useEffect(() => {
    const query = location.trim();
    if (locationMode !== "search" || coordinates || query.length < 3) {
      setLocationSuggestions([]);
      setSuggestionMessage("");
      setIsSuggestingLocation(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSuggestingLocation(true);
      setSuggestionMessage("");
      try {
        const params = new URLSearchParams({ format: "jsonv2", addressdetails: "1", countrycodes: "pk", limit: "5", q: query });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: { "Accept-Language": "en" },
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Place suggestions are unavailable right now.");
        const places = await response.json() as GeocodingResult[];
        setLocationSuggestions(places);
        setSuggestionMessage(places.length ? "" : "No matches found. You can still press Search.");
      } catch (suggestionError) {
        if (!controller.signal.aborted) {
          setLocationSuggestions([]);
          setSuggestionMessage(suggestionError instanceof Error ? suggestionError.message : "Place suggestions are unavailable right now.");
        }
      } finally {
        if (!controller.signal.aborted) setIsSuggestingLocation(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [coordinates, location, locationMode]);

  function useCurrentLocation() {
    setLocationMode("current");
    setCoordinates(null);
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }
    setLocationMessage("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords: point }) => {
        setCoordinates({ lat: point.latitude, lng: point.longitude });
        setLocation("Current location");
        setLocationMessage("Using your current location.");
      },
      () => setLocationMessage("Location access was blocked. Search for a place instead."),
      { enableHighAccuracy: true, timeout: 9000 }
    );
  }

  async function pickLocationOnMap(point: Coordinates) {
    const pick = ++mapPickRef.current;
    setLocationMode("search");
    setCoordinates(point);
    setLocationSuggestions([]);
    setLocation(formatCoordinates(point));
    setLocationMessage("Location pinned on the map. Finding the place name…");
    try {
      const label = await reverseGeocode(point);
      if (pick !== mapPickRef.current) return;
      if (label) setLocation(label);
      setLocationMessage("Location pinned on the map.");
    } catch {
      if (pick === mapPickRef.current) setLocationMessage("Location pinned on the map.");
    }
  }

  async function searchLocation() {
    const query = location.trim();
    if (!query) {
      setLocationMessage("Enter a town, village, or address to search.");
      return;
    }
    setLocationMode("search");
    setCoordinates(null);
    setIsSearchingLocation(true);
    setLocationMessage("Searching for this place…");
    try {
      const params = new URLSearchParams({ format: "jsonv2", addressdetails: "1", countrycodes: "pk", limit: "1", q: query });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { "Accept-Language": "en" }
      });
      if (!response.ok) throw new Error("Location search is temporarily unavailable.");
      const results = await response.json() as GeocodingResult[];
      const result = results[0];
      if (!result) {
        setLocationMessage("No matching place found. Try adding a town or region.");
        return;
      }
      setCoordinates({ lat: Number(result.lat), lng: Number(result.lon) });
      setLocation(getPlaceLabel(result));
      setLocationSuggestions([]);
      setLocationMessage("Location found and pinned on the map.");
    } catch (searchError) {
      setLocationMessage(searchError instanceof Error ? searchError.message : "Could not search for this location.");
    } finally {
      setIsSearchingLocation(false);
    }
  }

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    const room = MAX_LISTING_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoMessage(`You can add up to ${MAX_LISTING_PHOTOS} photos.`);
      return;
    }
    setIsProcessingPhotos(true);
    setPhotoMessage(files.length > room ? `Only the first ${room} photo${room === 1 ? "" : "s"} were added (limit ${MAX_LISTING_PHOTOS}).` : "");
    try {
      const added = await Promise.all(files.slice(0, room).map((file) => compressPhoto(file)));
      setPhotos((current) => [...current, ...added].slice(0, MAX_LISTING_PHOTOS));
    } catch (photoError) {
      setPhotoMessage(photoError instanceof Error ? photoError.message : "Could not add the photo.");
    } finally {
      setIsProcessingPhotos(false);
    }
  }

  async function publishListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!user) {
      setError("Sign in to publish an equipment listing.");
      return;
    }
    let listingLocation = location.trim();
    if (!listingLocation) {
      setLocationMessage("Enter a town, village, or address for this listing.");
      return;
    }

    let listingCoordinates = coordinates;
    if (!listingCoordinates) {
      setIsSearchingLocation(true);
      setLocationMessage("Finding your listing location…");
      try {
        const params = new URLSearchParams({ format: "jsonv2", addressdetails: "1", countrycodes: "pk", limit: "1", q: listingLocation });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: { "Accept-Language": "en" }
        });
        if (!response.ok) throw new Error("Location search is temporarily unavailable.");
        const results = await response.json() as GeocodingResult[];
        const result = results[0];
        if (!result) {
          setLocationMessage("No matching place found. Try adding a town or region.");
          return;
        }
        listingCoordinates = { lat: Number(result.lat), lng: Number(result.lon) };
        listingLocation = getPlaceLabel(result);
        setCoordinates(listingCoordinates);
        setLocation(listingLocation);
      } catch (locationError) {
        setLocationMessage(locationError instanceof Error ? locationError.message : "Could not find this location.");
        return;
      } finally {
        setIsSearchingLocation(false);
      }
    }

    const form = new FormData(event.currentTarget);
    const category = String(form.get("category")) as EquipmentCategory;
    const title = String(form.get("title") ?? "").trim();
    addEquipment({
      id: `eq-${Date.now()}`,
      ownerId: user.id,
      ownerName: user.name,
      contactPhone: String(form.get("contactPhone") ?? "").trim(),
      title: title || `${category}${String(form.get("size") ?? "").trim() ? ` ${String(form.get("size")).trim()}` : ""}`,
      category,
      city: listingLocation,
      location: listingCoordinates,
      pricePerDay: Number(form.get("pricePerDay")),
      availability: "available",
      status: "available",
      rating: 0,
      description: `${String(form.get("condition"))} condition. ${String(form.get("description") ?? "").trim()}`,
      photos
    });
    router.push("/equipment/near-me");
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const availableCount = previewEquipment.filter((equipment) => equipment.availability === "available").length;
  const myListings = user ? data.equipment.filter((equipment) => equipment.ownerId === user.id).length : 0;

  return <div className="bg-agri agri-fields min-h-screen text-[#1E2A1F]">
    <header className="sticky top-0 z-[1000] flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-b border-[#E2DCCB] bg-[#FBF9F2]/95 px-4 py-3 backdrop-blur sm:px-7 lg:px-12">
      <Brand className="shrink-0 text-[#1E2A1F]" />
      <nav className="hidden items-center gap-1 text-sm font-semibold md:flex">
        <Link href="/dashboard" className="rounded-lg bg-[#E4EDDF] px-3 py-2 text-[#2E5E3A]">Dashboard</Link>
        <Link href="/equipment/near-me" className="rounded-lg px-3 py-2 text-[#3E4A3C] hover:bg-[#E4EDDF]">Find equipment</Link>
        <Link href="/" className="rounded-lg px-3 py-2 text-[#3E4A3C] hover:bg-[#E4EDDF]">Home</Link>
      </nav>
      <div className="ml-auto flex items-center gap-3 sm:gap-5 md:ml-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2E5E3A] text-sm font-bold text-white ring-2 ring-[#E3B04B]/60 ring-offset-2 ring-offset-[#FBF9F2]">{user?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() ?? <UserRound size={18}/>}</span>
          <span className="hidden max-w-[180px] truncate text-sm font-bold sm:block">{user?.name ?? "Guest"}</span>
        </div>
        <button type="button" onClick={handleLogout} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#D6CFBB] bg-white px-3 text-sm font-semibold hover:bg-[#FBF9F2]" aria-label="Log out"><LogOut size={16}/><span className="hidden sm:inline">Log out</span></button>
      </div>
    </header>

    <main className="mx-auto flex max-w-[1440px] flex-col gap-7 px-4 py-8 sm:px-7 sm:py-10 lg:px-12 xl:px-20">
      {!user && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E3B04B]/50 bg-[#FFF1D6] px-4 py-3 text-sm text-[#624A14]"><span>You are browsing as a guest. Log in to publish listings.</span><Link href="/login" className="font-bold underline">Log in</Link></div>}

      <section className="relative overflow-hidden rounded-3xl bg-[#1E2A1F] text-white shadow-[0_18px_48px_rgba(30,42,31,0.18)]">
        <img src={farmImages.hero} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#1E2A1F] via-[#1E2A1F]/85 to-[#2E5E3A]/30" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-9 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E3B04B]/40 bg-[#E3B04B]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F2CD7A]"><Wheat size={14}/>Rabi season · wheat sowing</p>
            <h1 className="mt-4 font-display text-3xl font-semibold sm:text-[42px] sm:leading-[1.1]">Welcome{firstName ? `, ${firstName}` : ""}</h1>
            <p className="mt-2 text-base text-[#DCE7D6] sm:text-lg">List your machinery for rent, or find equipment near your fields.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:min-w-[420px]">
            {[
              { label: "Available nearby", value: availableCount, icon: Tractor },
              { label: "Your listings", value: myListings, icon: Sprout },
              { label: "Categories", value: categories.length, icon: Leaf }
            ].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur"><Icon size={18} className="text-[#F2CD7A]"/><p className="mt-2 font-display text-2xl font-semibold">{value}</p><p className="text-[11px] leading-4 text-[#DCE7D6]">{label}</p></div>)}
          </div>
        </div>
      </section>

      <section aria-label="Browse by category" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tractors", image: farmImages.tractor },
          { label: "Harvesters", image: farmImages.harvester },
          { label: "Sprayers", image: farmImages.sprayer },
          { label: "Rotavators", image: farmImages.cultivator }
        ].map((item) => <Link key={item.label} href="/equipment/near-me" className="group relative h-28 overflow-hidden rounded-2xl border border-[#E2DCCB] shadow-sm sm:h-32">
          <img src={item.image} alt={item.label} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105"/>
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#1E2A1F]/80 via-[#1E2A1F]/10 to-transparent"/>
          <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-sm font-bold text-white">{item.label}<ArrowRight size={16} className="transition group-hover:translate-x-0.5"/></span>
        </Link>)}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr] xl:gap-7">
        <section className="flex flex-col gap-6 overflow-hidden rounded-2xl border border-[#E2DCCB] bg-white p-5 shadow-[0_18px_48px_rgba(30,42,31,0.09)] sm:p-7 lg:p-8" aria-labelledby="listing-heading">
          <div className="-mx-5 -mt-5 flex items-center gap-4 border-b border-[#E2DCCB] bg-[#E4EDDF] px-5 py-4 sm:-mx-7 sm:-mt-7 sm:px-7 lg:-mx-8 lg:-mt-8 lg:px-8"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#2E5E3A] text-white"><Tractor size={24}/></span><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7A5200]">Option 1 · For owners</p><h2 id="listing-heading" className="mt-0.5 font-display text-2xl font-semibold sm:text-[28px]">List your equipment for rent</h2></div></div>
          <form onSubmit={publishListing} className="flex flex-col gap-6">
            <section className="flex flex-col gap-3" aria-labelledby="location-heading">
              <h3 id="location-heading" className="flex items-center gap-2 text-base font-bold"><StepDot n={1}/>Location</h3>
              <div role="group" aria-label="Location mode" className="grid grid-cols-1 gap-1 rounded-[10px] bg-[#F1EDE0] p-1 sm:grid-cols-2">
                <button type="button" aria-pressed={locationMode === "current"} onClick={useCurrentLocation} className={`min-h-10 rounded-lg px-2 text-sm font-semibold ${locationMode === "current" ? "bg-white text-[#2E5E3A] shadow-sm" : "hover:bg-white/60"}`}><LocateFixed size={15} className="mr-1.5 inline"/>Use my location</button>
                <button type="button" aria-pressed={locationMode === "search"} onClick={() => { setLocationMode("search"); setLocationMessage(""); }} className={`min-h-10 rounded-lg px-2 text-sm font-semibold ${locationMode === "search" ? "bg-white text-[#2E5E3A] shadow-sm" : "hover:bg-white/60"}`}><Search size={15} className="mr-1.5 inline"/>Search location</button>
              </div>
              <div className="relative h-[170px] overflow-hidden rounded-xl border border-[#E2DCCB] bg-[#E8E6D2]">
                <MapPreview compact equipment={previewEquipment} userLocation={coordinates} onMapClick={(point) => void pickLocationOnMap(point)} />
              </div>
              <div className="flex flex-col gap-2 text-sm text-[#3E4A3C]">
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <label className="sr-only" htmlFor="listing-location">Search location</label>
                    <input id="listing-location" type="text" value={location} autoComplete="off" role="combobox" aria-autocomplete="list" aria-controls="location-suggestions" aria-expanded={locationSuggestions.length > 0} onChange={(event) => { setLocation(event.target.value); setLocationMode("search"); setCoordinates(null); setLocationSuggestions([]); setLocationMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (locationSuggestions[0]) { const first = locationSuggestions[0]; setCoordinates({ lat: Number(first.lat), lng: Number(first.lon) }); setLocation(getPlaceLabel(first)); setLocationSuggestions([]); setLocationMessage("Location found and pinned on the map."); } else { void searchLocation(); } } }} placeholder="Enter a town, village, or address" className="h-11 w-full min-w-0 rounded-lg border border-[#C9C1A9] bg-white px-3 text-sm outline-none focus:border-[#2E5E3A]"/>
                    {(locationSuggestions.length > 0 || isSuggestingLocation || suggestionMessage) && <div id="location-suggestions" role="listbox" aria-label="Location suggestions" className="absolute inset-x-0 top-[calc(100%+4px)] z-[700] max-h-56 overflow-y-auto rounded-lg border border-[#D6CFBB] bg-white py-1 shadow-lg">
                      {isSuggestingLocation && <p role="status" className="px-3 py-2 text-xs text-[#5B6457]">Searching places…</p>}
                      {locationSuggestions.map((place) => <button key={place.place_id} type="button" role="option" aria-selected="false" onClick={() => { setCoordinates({ lat: Number(place.lat), lng: Number(place.lon) }); setLocation(getPlaceLabel(place)); setLocationSuggestions([]); setSuggestionMessage(""); setLocationMessage("Location found and pinned on the map."); }} className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-[#F5F1E6]"><MapPin size={15} className="mt-0.5 shrink-0 text-[#2E5E3A]"/><span className="line-clamp-2">{place.display_name}</span></button>)}
                      {!isSuggestingLocation && suggestionMessage && <p role="status" className="px-3 py-2 text-xs text-[#5B6457]">{suggestionMessage}</p>}
                    </div>}
                  </div>
                  <button type="button" aria-label="Search location" onClick={() => void searchLocation()} disabled={isSearchingLocation} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#2E5E3A] px-3 text-sm font-semibold text-white hover:bg-[#1F4429] disabled:opacity-60"><Search size={16}/><span className="hidden sm:inline">{isSearchingLocation ? "Searching" : "Search"}</span></button>
                </div>
                {locationMessage && <span role="status" className="text-xs text-[#5B6457]">{locationMessage}</span>}
              </div>
            </section>

            <section className="flex flex-col gap-3" aria-labelledby="price-heading">
              <h3 id="price-heading" className="flex items-center gap-2 text-base font-bold"><StepDot n={2}/>Price</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-semibold">Per day (Rs)<input name="pricePerDay" type="number" min="1" step="any" placeholder="Enter your price" required className="h-12 rounded-[10px] border border-[#C9C1A9] px-3.5 text-base font-bold outline-none focus:border-[#2E5E3A]"/></label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold">Per week (Rs)<input type="number" min="1" step="any" placeholder="Enter your price" className="h-12 rounded-[10px] border border-[#C9C1A9] px-3.5 text-base font-bold outline-none focus:border-[#2E5E3A]"/></label>
              </div>
            </section>

            <section className="flex flex-col gap-3" aria-labelledby="description-heading">
              <h3 id="description-heading" className="flex items-center gap-2 text-base font-bold"><StepDot n={3}/>Description</h3>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Equipment name<input name="title" type="text" placeholder="Optional, e.g. Massey Ferguson 385" className="h-12 rounded-[10px] border border-[#C9C1A9] px-3.5 text-sm font-medium outline-none focus:border-[#2E5E3A]"/></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm font-semibold">Type<select name="category" className="h-12 rounded-[10px] border border-[#C9C1A9] bg-white px-3 text-sm"><option>{categories[0]}</option>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold">Size<input name="size" type="text" placeholder="85 HP" className="h-12 rounded-[10px] border border-[#C9C1A9] px-3 text-sm outline-none focus:border-[#2E5E3A]"/></label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold">Condition<select name="condition" className="h-12 rounded-[10px] border border-[#C9C1A9] bg-white px-3 text-sm"><option>Good</option><option>Excellent</option><option>Fair</option></select></label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Details<textarea name="description" rows={2} placeholder="Add useful details for nearby farmers" className="resize-y rounded-[10px] border border-[#C9C1A9] px-3.5 py-3 text-sm font-medium outline-none focus:border-[#2E5E3A]"/></label>
            </section>

            <section className="flex flex-col gap-3" aria-labelledby="photos-heading">
              <h3 id="photos-heading" className="flex items-center gap-2 text-base font-bold"><StepDot n={4}/>Photos</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((photo, index) => <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E2DCCB] bg-[#F1EDE0]">
                  <img src={photo} alt={`Equipment photo ${index + 1}`} className="size-full object-cover"/>
                  {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-[#2E5E3A] px-2 py-0.5 text-[10px] font-bold text-white">Cover</span>}
                  <button type="button" onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Remove photo ${index + 1}`} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><X size={14}/></button>
                </div>)}
                {photos.length < MAX_LISTING_PHOTOS && <label className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#C9C1A9] bg-[#FBF9F2] text-center text-xs font-semibold text-[#3E4A3C] transition hover:border-[#2E5E3A] hover:text-[#2E5E3A] ${isProcessingPhotos ? "pointer-events-none opacity-60" : ""}`}>
                  <Camera size={22}/>{isProcessingPhotos ? "Adding…" : "Add photos"}
                  <input type="file" accept="image/*" multiple onChange={(event) => void addPhotos(event)} className="sr-only"/>
                </label>}
              </div>
              <span className="text-xs text-[#5B6457]">{photoMessage || `Optional. Up to ${MAX_LISTING_PHOTOS} photos; the first one is shown as the cover.`}</span>
            </section>

            <section className="flex flex-col gap-2 rounded-xl border border-dashed border-[#C9C1A9] bg-[#FBF9F2] p-4" aria-labelledby="contact-heading">
              <h3 id="contact-heading" className="text-sm font-bold">Contact information</h3>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Contact number<input name="contactPhone" type="tel" defaultValue={user?.phone ?? ""} placeholder="e.g. +92 300 1234567" autoComplete="tel" required className="h-12 rounded-[10px] border border-[#C9C1A9] bg-white px-3.5 text-sm font-medium outline-none focus:border-[#2E5E3A]"/><span className="inline-flex items-center gap-1.5 text-xs font-normal text-[#5B6457]"><Phone size={14} className="text-[#2E5E3A]"/>Farmers can use this number to contact you about the listing.</span></label>
            </section>

            {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
            <button type="submit" disabled={isSearchingLocation || isProcessingPhotos} className="inline-flex min-h-[52px] items-center gap-2 self-start rounded-[10px] bg-[#2E5E3A] px-7 text-base font-bold text-white shadow-md shadow-[#2E5E3A]/20 transition hover:bg-[#1F4429] disabled:cursor-wait disabled:opacity-60"><Sprout size={18}/>{isSearchingLocation ? "Finding location…" : "Publish listing"}</button>
          </form>
        </section>

        <div className="flex flex-col gap-6">
          <section className="relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-[#2E5E3A] p-5 text-white shadow-[0_16px_40px_rgba(30,42,31,0.18)] sm:p-7" aria-labelledby="find-heading">
            <div className="relative h-[220px] overflow-hidden rounded-xl bg-[#E8E6D2]"><MapPreview compact equipment={previewEquipment}/><span className="absolute bottom-3 left-3 z-[500] rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1E2A1F] shadow">{availableCount} available nearby</span></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#F2CD7A]">Option 2 · For farmers</p><h2 id="find-heading" className="mt-2 font-display text-3xl font-semibold">Find equipment</h2><p className="mt-2 text-base leading-6 text-[#DCE7D6]">See available tractors, harvesters and more near you.</p></div>
            <Link href="/equipment/near-me" className="inline-flex min-h-[50px] items-center gap-2 self-start rounded-[10px] bg-[#E3B04B] px-5 text-base font-bold text-[#1E2A1F] transition hover:bg-[#F0C15F]">Find equipment <ArrowRight size={18}/></Link>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#E2DCCB] bg-white" aria-labelledby="season-heading">
            <img src={farmImages.harvester} alt="Combine harvester in a wheat field" loading="lazy" className="h-40 w-full object-cover"/>
            <div className="p-5">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#7A5200]"><CloudSun size={14}/>Season tip</p>
              <h2 id="season-heading" className="mt-1.5 font-display text-xl font-semibold">Plan ahead for harvest</h2>
              <p className="mt-1.5 text-sm leading-6 text-[#5B6457]">Harvesters book out fast in April and October. Contact owners two weeks before your crop is ready.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>;
}

function StepDot({ n }: { n: number }) {
  return <span className="grid size-6 place-items-center rounded-full bg-[#E3B04B] text-xs font-bold text-[#1E2A1F]">{n}</span>;
}
