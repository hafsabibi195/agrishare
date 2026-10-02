"use client";

import { MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLiveLocation } from "@/hooks/useLiveLocation";
import { useDemoAuth } from "@/lib/demo-state";

export function LiveLocationControl({ compact = false }: { compact?: boolean }) {
  const { sharing, error, toggleSharing, stopSharing } = useLiveLocation();
  const { auth } = useDemoAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (auth.currentUser?.role !== "farmer" && auth.currentUser?.role !== "owner") return null;

  return (
    <div className="flex flex-col items-stretch gap-2">
      <label className={`inline-flex cursor-pointer items-center gap-2.5 ${compact ? "text-xs" : "text-sm"}`}>
        <input
          type="checkbox"
          checked={sharing}
          onChange={toggleSharing}
          className="peer sr-only"
          aria-label="Share live location"
        />
        <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${sharing ? "bg-[#23834f]" : "bg-[#9ca69f]"}`}>
          <span className={`absolute size-4 rounded-full bg-white transition ${sharing ? "translate-x-6" : "translate-x-1"}`} />
        </span>
        <span className="whitespace-nowrap font-semibold text-primary-deep">Share live location</span>
      </label>

      {sharing && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-[#b8dfc6] bg-[#eaf7ee] px-3 py-2 text-xs font-medium text-[#17643a]">
          <span className="inline-flex items-center gap-2"><MapPin size={14} />Sharing live location with AgriShare</span>
          <button type="button" onClick={stopSharing} className="inline-flex items-center gap-1 font-bold hover:text-[#0d4928]">
            <X size={13} /> Stop
          </button>
        </div>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}