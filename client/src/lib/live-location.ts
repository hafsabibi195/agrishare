export type LiveLocation = {
  userId: string;
  name: string;
  role: "farmer" | "owner";
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  sharing: boolean;
  updatedAt: number;
};

export type LiveLocationMap = Record<string, LiveLocation>;

const CHANNEL_NAME = "agrishare-live";
const STORAGE_KEY = "agrishare-live-locations";

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null;
  channel ??= new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function readLocalLiveLocations(): LiveLocationMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as LiveLocationMap;
  } catch {
    return {};
  }
}

export function publishLocalLiveLocation(location: LiveLocation): void {
  if (typeof window === "undefined") return;
  const locations = readLocalLiveLocations();
  locations[location.userId] = location;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  getChannel()?.postMessage(location);
}

export function subscribeLocalLiveLocations(listener: (locations: LiveLocationMap) => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const notify = () => listener(readLocalLiveLocations());
  const localChannel = getChannel();
  const onMessage = () => notify();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) notify();
  };

  localChannel?.addEventListener("message", onMessage);
  window.addEventListener("storage", onStorage);
  notify();

  return () => {
    localChannel?.removeEventListener("message", onMessage);
    window.removeEventListener("storage", onStorage);
  };
}