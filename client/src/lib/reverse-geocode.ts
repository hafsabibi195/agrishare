import type { Coordinates } from "@/lib/geo";

type ReverseResult = { name?: string; display_name?: string; address?: Record<string, string> };

/** Short place name for a map point (town/village), or null if none was found. */
export async function reverseGeocode(point: Coordinates, signal?: AbortSignal): Promise<string | null> {
  const params = new URLSearchParams({ format: "jsonv2", addressdetails: "1", zoom: "14", lat: String(point.lat), lon: String(point.lng) });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, { headers: { "Accept-Language": "en" }, signal });
  if (!response.ok) return null;
  const place = await response.json() as ReverseResult;
  const address = place.address ?? {};
  return address.city ?? address.town ?? address.village ?? address.municipality ?? address.suburb ?? address.county
    ?? place.name ?? place.display_name?.split(",").slice(0, 2).join(",") ?? null;
}

export function formatCoordinates(point: Coordinates) {
  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
}
