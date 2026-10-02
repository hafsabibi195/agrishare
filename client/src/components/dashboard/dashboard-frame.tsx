"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, LayoutDashboard, LogOut, MapPin, Menu, Search, ShieldCheck, Tractor, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { useDemoAuth } from "@/lib/demo-state";
import { LiveLocationControl } from "@/components/live-location-control";

type DashboardRole = "farmer" | "owner";

const farmerLinks = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Find equipment", "/equipment/near-me", MapPin]
] as const;

const ownerLinks = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["My equipment", "/dashboard#equipment", Tractor],
  ["Booking requests", "/dashboard#requests", CalendarDays],
  ["Calendar", "/dashboard#calendar", CalendarDays],
  ["Find equipment", "/equipment/near-me", MapPin]
] as const;

export function DashboardFrame({ children }: { children: (state: { user: ReturnType<typeof useDemoAuth>["auth"]["currentUser"]; role: DashboardRole; loading: boolean; error: string }) => React.ReactNode }) {
  const router = useRouter();
  const { auth, logout } = useDemoAuth();
  const user = auth.currentUser;
  const loading = false;
  const error = user ? "" : "Sign in to load your account.";
  const role: DashboardRole = user?.role === "owner" ? "owner" : "farmer";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const links = role === "owner" ? ownerLinks : farmerLinks;
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-background-paper px-4 pb-5 lg:flex">
        <div className="flex h-[72px] items-center px-2"><Brand /></div>
        <Badge variant={role === "owner" ? "blue" : "amber"} className="mx-2 mb-4 self-start">{role === "owner" ? "Owner account" : "Farmer account"}</Badge>
        <nav className="flex flex-col gap-1">{links.map(([label, href, Icon], index) => <Link key={label} href={href} className={`flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm transition ${index === 0 ? "bg-primary-soft font-bold text-primary" : "text-[#3E4A3C] hover:bg-primary-soft"}`}><Icon size={19} strokeWidth={1.8}/>{label}</Link>)}</nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-xl border border-border bg-white p-3.5">{user?.twoFactorEnabled ? <><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={18} className="text-primary"/>2FA is on</div><p className="mt-1 text-xs text-muted">Your account is protected.</p></> : <><div className="text-sm font-bold">Account security</div><p className="mt-1 text-xs text-muted">Enable 2FA in account settings.</p></>}</div>
          <Link href="/admin/login" className="block px-2 text-xs text-muted hover:text-primary">Admin portal →</Link>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-border bg-background-paper/95 px-4 backdrop-blur sm:px-7">
          <Brand className="lg:hidden" />
          <label className="hidden h-11 w-full max-w-[380px] items-center gap-2.5 rounded-[10px] border border-border-strong bg-white px-3.5 text-muted sm:flex"><Search size={17}/><input aria-label="Search" placeholder={role === "owner" ? "Search requests, equipment…" : "Search tractors, sprayers…"} className="min-w-0 flex-1 bg-transparent text-sm text-primary-deep outline-none placeholder:text-muted" /></label>
          {user && <div className="hidden lg:block"><LiveLocationControl compact /></div>}
          <button type="button" aria-label="Notifications" title="Notifications" className="relative grid size-11 place-items-center rounded-[10px] border border-border-strong bg-white"><Bell size={19}/><span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger"/></button>
          <div className="flex min-w-0 items-center gap-2.5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{user?.name?.split(/\s+/).map((part)=>part[0]).slice(0,2).join("").toUpperCase() ?? <UserRound size={18}/>}</span><div className="hidden min-w-0 sm:block"><p className="truncate text-sm font-bold">{user?.name ?? "Guest"}</p><p className="text-xs capitalize text-muted">{user ? `${user.role} account` : "Not signed in"}</p></div></div>
          <button type="button" onClick={handleLogout} aria-label="Log out" title="Log out" className="grid size-10 place-items-center rounded-[10px] text-muted hover:bg-danger-soft hover:text-danger"><LogOut size={18}/></button>
          <button type="button" aria-label="Open navigation" className="grid size-10 place-items-center rounded-[10px] border border-border-strong bg-white lg:hidden"><Menu size={18}/></button>
        </header>
        <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-7 lg:px-8">
          {!user && <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-wheat/50 bg-wheat-soft px-4 py-3 text-sm text-[#624A14]"><span>{error}. Sign in to view your dashboard.</span><Link href="/login" className="font-bold underline">Log in</Link></div>}
          {children({ user, role, loading, error })}
        </main>
        <footer className="flex items-center justify-between border-t border-border px-5 py-5 text-xs text-muted sm:px-8"><span>© 2026 AgriShare Pakistan</span><Link href="/admin/login" className="hover:text-primary">Admin portal</Link></footer>
      </div>
    </div>
  );
}