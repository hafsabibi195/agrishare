"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onDisconnect, ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { haversineDistanceKm } from "@/lib/geo";
import { publishLocalLiveLocation, type LiveLocation } from "@/lib/live-location";
import { useDemoAuth } from "@/lib/demo-state";

type LiveLocationContextValue = {
  sharing: boolean;
  error: string;
  toggleSharing: () => void;
  stopSharing: () => void;
};

const LiveLocationContext = createContext<LiveLocationContextValue | null>(null);

async function writeLocation(location: LiveLocation): Promise<void> {
  if (!db) {
    publishLocalLiveLocation(location);
    return;
  }

  try {
    let timeoutId: number | undefined;
    try {
      await Promise.race([
        set(ref(db, `liveLocations/${location.userId}`), location),
        new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error("Firebase write timed out")), 5000);
        })
      ]);
    } finally {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    }
    if (location.sharing) {
      void onDisconnect(ref(db, `liveLocations/${location.userId}`))
        .set({ ...location, sharing: false, updatedAt: Date.now() })
        .catch(() => undefined);
    }
  } catch {
    publishLocalLiveLocation(location);
  }
}

export function LiveLocationProvider({ children }: { children: React.ReactNode }) {
  const { auth, data } = useDemoAuth();
  const user = auth.currentUser;
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const watchIdRef = useRef<number | null>(null);
  const lastWriteRef = useRef<{ lat: number; lng: number; at: number } | null>(null);
  const autoSharingRef = useRef(false);

  const hasActiveOwnerRental = user?.role === "owner" && data.bookings.some(
    (booking) => booking.ownerId === user.id && booking.status === "approved"
  );

  useEffect(() => {
    if (user?.role === "owner" && hasActiveOwnerRental) {
      autoSharingRef.current = true;
      setSharing(true);
    } else if (autoSharingRef.current) {
      autoSharingRef.current = false;
      setSharing(false);
    }
  }, [hasActiveOwnerRental, user?.role]);

  useEffect(() => {
    if (!sharing || !user || (user.role !== "farmer" && user.role !== "owner")) return;
    const role: LiveLocation["role"] = user.role;
    setError("");

    if (!navigator.geolocation) {
      setError("Location is unavailable in this browser.");
      setSharing(false);
      return;
    }

    const stopWatch = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    const publishStopped = () => {
      const previous = lastWriteRef.current;
      if (!previous) return;
      void writeLocation({
        userId: user.id,
        name: user.name,
        role,
        lat: previous.lat,
        lng: previous.lng,
        accuracy: 0,
        heading: null,
        speed: null,
        sharing: false,
        updatedAt: Date.now()
      });
    };

    const onSuccess = (position: GeolocationPosition) => {
      const { latitude: lat, longitude: lng, accuracy, heading, speed } = position.coords;
      const now = Date.now();
      const last = lastWriteRef.current;
      const movedKm = last ? haversineDistanceKm({ lat: last.lat, lng: last.lng }, { lat, lng }) : Infinity;
      if (last && movedKm <= 0.015 && now - last.at < 10_000) return;

      lastWriteRef.current = { lat, lng, at: now };
      void writeLocation({
        userId: user.id,
        name: user.name,
        role,
        lat,
        lng,
        accuracy,
        heading,
        speed,
        sharing: true,
        updatedAt: now
      });
    };

    const onError = (geoError: GeolocationPositionError) => {
      const messages: Record<number, string> = {
        1: "Location blocked. Allow location in your browser settings.",
        2: "Your position is unavailable. Check your device location settings.",
        3: "Location request timed out. Check your connection and try again."
      };
      setError(messages[geoError.code] ?? "Unable to get your location.");
      stopWatch();
      publishStopped();
      setSharing(false);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    });

    const onBeforeUnload = () => {
      stopWatch();
      publishStopped();
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      stopWatch();
      window.removeEventListener("beforeunload", onBeforeUnload);
      publishStopped();
    };
  }, [sharing, user]);

  const stopSharing = () => {
    autoSharingRef.current = false;
    setSharing(false);
  };

  useEffect(() => {
    if (!user && sharing) stopSharing();
  }, [sharing, user]);

  const value = useMemo(() => ({
    sharing,
    error,
    toggleSharing: () => {
      setError("");
      setSharing((current) => !current);
    },
    stopSharing
  }), [error, sharing]);

  return <LiveLocationContext.Provider value={value}>{children}</LiveLocationContext.Provider>;
}

export function useLiveLocation(): LiveLocationContextValue {
  const context = useContext(LiveLocationContext);
  if (!context) throw new Error("useLiveLocation must be used inside LiveLocationProvider");
  return context;
}