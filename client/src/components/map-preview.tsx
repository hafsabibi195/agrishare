"use client";

import dynamic from "next/dynamic";
import type { Equipment } from "@/data/sampleData";
import type { Coordinates } from "@/lib/geo";

const LeafletMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#E8E6D2]" />
});

export function MapPreview({ compact = false, equipment, userLocation, onMapClick }: { compact?: boolean; equipment?: Equipment[]; userLocation?: Coordinates | null; onMapClick?: (location: Coordinates) => void }) {
  return (
    <div className={compact ? "h-full min-h-0" : "h-full min-h-[520px]"}>
      <LeafletMap compact={compact} equipment={equipment} userLocation={userLocation} onMapClick={onMapClick} />
    </div>
  );
}