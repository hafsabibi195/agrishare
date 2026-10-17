"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemoAuth } from "@/lib/demo-state";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, hydrated } = useDemoAuth();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === "/admin/login";
  const isAdmin = auth.currentUser?.role === "admin";

  useEffect(() => {
    if (!hydrated) return;
    setChecked(true);
    if (!isLoginPage && !isAdmin) router.replace("/admin/login");
  }, [hydrated, isAdmin, isLoginPage, router]);

  if (isLoginPage) return children;
  if (!checked || !isAdmin) {
    return <main className="grid min-h-screen place-items-center bg-agri-dark text-sm text-[#b8c7bd]">Checking administrator access…</main>;
  }
  return children;
}