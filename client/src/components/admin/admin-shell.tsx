"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, MessageSquareQuote, Tractor, Users, Wrench } from "lucide-react";
import { useEffect } from "react";
import { Brand } from "@/components/brand";
import { useDemoAuth } from "@/lib/demo-state";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/equipment", label: "Equipment", icon: Tractor },
] as const;

export function AdminShell({ children, title, mapDashboard = false }: { children: React.ReactNode; title: string; mapDashboard?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout } = useDemoAuth();

  useEffect(() => {
    if (!auth.currentUser || auth.currentUser.role !== "admin") {
      router.push("/admin/login");
    }
  }, [auth.currentUser, router]);

  return (
    <div className={`min-h-screen ${mapDashboard ? "bg-[#f4f3ed] text-[#1e2a1f]" : "bg-[#0f1714] text-[#edf3ee]"}`}>
      {!mapDashboard && <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r border-[#1d2c26] bg-[#121c18] p-4 lg:flex">
        <div className="flex h-14 items-center px-2 text-lg font-semibold text-white">AgriShare</div>
        <nav className="mt-4 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-[#1d2e26] text-white" : "text-[#b8c7bd] hover:bg-[#17231d] hover:text-white"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-[#203128] bg-[#141f1a] p-3 text-xs text-[#bfd2c6]">
          Signed in as admin
        </div>
      </aside>}

      <div className={mapDashboard ? "" : "lg:pl-[248px]"}>
        <header className={`sticky top-0 z-[700] flex min-h-[72px] items-center justify-between border-b px-4 backdrop-blur sm:px-6 ${mapDashboard ? "border-[#283a30] bg-[#14231b] text-white" : "border-[#1d2c26] bg-[#101712]/95"}`}>
          {mapDashboard ? <>
            <div className="flex items-center gap-3"><Brand dark admin className="[&_span:last-child]:text-lg"/><span className="hidden text-xs text-[#a8c2b2] sm:inline">Operations map</span></div>
            <div className="flex items-center gap-4"><span className="hidden text-xs text-[#a8c2b2] sm:inline">Live admin session</span><button type="button" onClick={() => { logout(); router.push("/admin/login"); }} className="inline-flex items-center gap-2 rounded-lg border border-[#54705e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#20362a]"><LogOut size={14}/>Log out</button></div>
          </> : <>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9fd4ae]">Administration</p>
            <h1 className="mt-1 text-xl font-semibold text-white">{title}</h1>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#203128] bg-[#16231d] px-3 py-2 text-sm text-[#edf3ee] hover:bg-[#1b2d25]"
          >
            <LogOut size={15} />
            Log out
          </button>
          </>}
        </header>

        <main className={`mx-auto ${mapDashboard ? "max-w-[1600px] px-3 py-3 sm:px-5" : "max-w-[1600px] px-4 py-6 sm:px-6"}`}>{children}</main>
      </div>
    </div>
  );
}