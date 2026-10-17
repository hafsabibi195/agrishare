"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { adminStats, demoBookings, demoEquipment, demoReviews, demoUsers, type Booking, type DemoUser, type Equipment, type Review } from "@/data/sampleData";

const AUTH_STORAGE_KEY = "agrishare-demo-auth";
const DATA_STORAGE_KEY = "agrishare-demo-data";
const USERS_STORAGE_KEY = "agrishare-demo-users";

type DemoRoleTarget = "user" | "admin";

interface DemoAuthState {
  currentUser: DemoUser | null;
  pendingLoginEmail: string | null;
  lastActivityAt: number | null;
}

interface DemoDataState {
  equipment: Equipment[];
  bookings: Booking[];
  reviews: Review[];
  adminStats: typeof adminStats;
}

interface DemoContextValue {
  /** False until saved auth/data have been read from localStorage after mount. */
  hydrated: boolean;
  auth: DemoAuthState;
  data: DemoDataState;
  login: (email: string, password: string, target?: DemoRoleTarget) => { requiresTwoFactor: boolean; user?: DemoUser };
  verifyTwoFactor: (code: string) => DemoUser;
  register: (input: { name: string; email: string; phone: string; password: string; role: DemoUser["role"] }) => DemoUser;
  logout: () => void;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  updateEquipmentStatus: (equipmentId: string, status: Equipment["status"]) => void;
  addEquipment: (equipment: Equipment) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function readStoredAuth(): DemoAuthState {
  if (typeof window === "undefined") {
    return { currentUser: null, pendingLoginEmail: null, lastActivityAt: null };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { currentUser: null, pendingLoginEmail: null, lastActivityAt: null };
    const stored = JSON.parse(raw) as Partial<DemoAuthState>;
    if (stored.currentUser?.role === "admin") {
      const lastActivityAt = stored.lastActivityAt ?? Date.now();
      if (Date.now() - lastActivityAt >= 30 * 60 * 1000) {
        return { currentUser: null, pendingLoginEmail: null, lastActivityAt: null };
      }
      return {
        currentUser: stored.currentUser,
        pendingLoginEmail: stored.pendingLoginEmail ?? null,
        lastActivityAt
      };
    }
    return {
      currentUser: stored.currentUser ?? null,
      pendingLoginEmail: stored.pendingLoginEmail ?? null,
      lastActivityAt: null
    };
  } catch {
    return { currentUser: null, pendingLoginEmail: null, lastActivityAt: null };
  }
}

function readStoredData(): DemoDataState {
  if (typeof window === "undefined") {
    return { equipment: demoEquipment, bookings: demoBookings, reviews: demoReviews, adminStats };
  }

  try {
    const raw = window.localStorage.getItem(DATA_STORAGE_KEY);
    if (!raw) return { equipment: demoEquipment, bookings: demoBookings, reviews: demoReviews, adminStats };
    return JSON.parse(raw) as DemoDataState;
  } catch {
    return { equipment: demoEquipment, bookings: demoBookings, reviews: demoReviews, adminStats };
  }
}

function readRegisteredUsers(): DemoUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const users = JSON.parse(raw) as DemoUser[];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function getDemoUsers(): DemoUser[] {
  return [...demoUsers, ...readRegisteredUsers()];
}

// useLayoutEffect warns during server rendering; it only matters in the browser.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const emptyAuth: DemoAuthState = { currentUser: null, pendingLoginEmail: null, lastActivityAt: null };
const seedData: DemoDataState = { equipment: demoEquipment, bookings: demoBookings, reviews: demoReviews, adminStats };

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // Start from the same state the server rendered, then load what this browser saved.
  // Reading localStorage during the first render causes hydration mismatches.
  const [auth, setAuth] = useState<DemoAuthState>(emptyAuth);
  const [data, setData] = useState<DemoDataState>(seedData);
  const [hydrated, setHydrated] = useState(false);

  useBrowserLayoutEffect(() => {
    setAuth(readStoredAuth());
    setData(readStoredData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }, [auth, hydrated]);

  useEffect(() => {
    if (auth.currentUser?.role !== "admin") return;

    let lastRecorded = auth.lastActivityAt ?? Date.now();
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastRecorded < 1000) return;
      lastRecorded = now;
      setAuth((current) => current.currentUser?.role === "admin" ? { ...current, lastActivityAt: now } : current);
    };
    const checkExpiry = () => {
      const lastActivityAt = lastRecorded;
      if (Date.now() - lastActivityAt >= 30 * 60 * 1000) {
        setAuth({ currentUser: null, pendingLoginEmail: null, lastActivityAt: null });
      }
    };

    const activityEvents: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, updateActivity, { passive: true }));
    const intervalId = window.setInterval(checkExpiry, 5000);

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, updateActivity));
      window.clearInterval(intervalId);
    };
  }, [auth.currentUser?.role]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // Photos can push the demo data past the browser's storage quota.
      console.warn("Could not save AgriShare data locally.", error);
    }
  }, [data, hydrated]);

  const login = (email: string, password: string, target: DemoRoleTarget = "user") => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = getDemoUsers().find((user) => user.email.toLowerCase() === normalizedEmail && user.password === password);

    if (!account) {
      throw new Error("Incorrect email or password.");
    }

    if (target === "admin" && account.role !== "admin") {
      throw new Error("Access denied.");
    }

    if (target === "user" && account.role === "admin") {
      throw new Error("Please use the admin portal.");
    }

    if (target === "admin") {
      setAuth({ currentUser: null, pendingLoginEmail: account.email, lastActivityAt: null });
      return { requiresTwoFactor: true };
    }

    setAuth({ currentUser: account, pendingLoginEmail: null, lastActivityAt: null });
    return { requiresTwoFactor: false, user: account };
  };

  const verifyTwoFactor = (code: string) => {
    if (code !== "123456") {
      throw new Error("Invalid verification code.");
    }

    const pendingLoginEmail = auth.pendingLoginEmail;
    if (!pendingLoginEmail) {
      throw new Error("No pending sign-in found. Please log in again.");
    }

    const account = getDemoUsers().find((user) => user.email.toLowerCase() === pendingLoginEmail.toLowerCase());
    if (!account) {
      throw new Error("Your session is invalid.");
    }

    setAuth({ currentUser: account, pendingLoginEmail: null, lastActivityAt: account.role === "admin" ? Date.now() : null });
    return account;
  };

  const register = (input: { name: string; email: string; phone: string; password: string; role: DemoUser["role"] }) => {
    const trimmedEmail = input.email.trim().toLowerCase();
    const registeredUsers = readRegisteredUsers();
    if (getDemoUsers().some((user) => user.email.toLowerCase() === trimmedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const newUser: DemoUser = {
      id: `user-${Date.now()}`,
      name: input.name.trim(),
      email: trimmedEmail,
      phone: input.phone.trim(),
      password: input.password,
      role: input.role,
      twoFactorEnabled: false
    };

    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...registeredUsers, newUser]));
    return newUser;
  };

  const logout = () => {
    setAuth({ currentUser: null, pendingLoginEmail: null, lastActivityAt: null });
  };

  const updateBookingStatus = (bookingId: string, status: Booking["status"]) => {
    setData((current) => ({
      ...current,
      bookings: current.bookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
    }));
  };

  const updateEquipmentStatus = (equipmentId: string, status: Equipment["status"]) => {
    setData((current) => ({
      ...current,
      equipment: current.equipment.map((equipment) =>
        equipment.id === equipmentId
          ? { ...equipment, status, availability: status === "available" ? "available" : status === "rented" ? "booked" : "maintenance" }
          : equipment
      )
    }));
  };

  const addEquipment = (equipment: Equipment) => {
    setData((current) => ({ ...current, equipment: [equipment, ...current.equipment] }));
  };

  const value = useMemo<DemoContextValue>(() => ({
    hydrated,
    auth,
    data,
    login,
    verifyTwoFactor,
    register,
    logout,
    updateBookingStatus,
    updateEquipmentStatus,
    addEquipment
  }), [auth, data, hydrated]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoAuth() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoAuth must be used inside DemoProvider");
  }
  return context;
}

export function useDemoData() {
  return useDemoAuth();
}
