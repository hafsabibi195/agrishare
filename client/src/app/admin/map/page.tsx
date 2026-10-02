"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { demoUsers } from "@/data/sampleData";
import { readLocalLiveLocations, subscribeLocalLiveLocations } from "@/lib/live-location";
import { useDemoAuth } from "@/lib/demo-state";

const AdminEquipmentMap = dynamic(() => import("@/components/admin/admin-equipment-map"), {
  ssr: false,
  loading: () => <div className="h-[620px] animate-pulse rounded-2xl border border-[#1f2d28] bg-[#101712]" />
});

export default function AdminMapPage() {
  const { data } = useDemoAuth();
  const [liveUserCount, setLiveUserCount] = useState(0);

  useEffect(() => {
    const updateCount = (locations: ReturnType<typeof readLocalLiveLocations>) => {
      setLiveUserCount(Object.values(locations).filter((location) => location.sharing && Date.now() - location.updatedAt <= 120_000).length);
    };
    updateCount(readLocalLiveLocations());
    return subscribeLocalLiveLocations(updateCount);
  }, []);

  const stats = [
    ["Users", demoUsers.length],
    ["Equipment listed", data.equipment.length],
    ["In use now", data.equipment.filter((equipment) => equipment.status === "rented").length],
    ["Live users now", liveUserCount]
  ] as const;

  return (
    <AdminShell title="Live map" mapDashboard>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {stats.map(([label, value]) => <div key={label} className="min-w-0 rounded-lg border border-[#deddd3] bg-white px-3 py-3 shadow-sm sm:px-4"><p className="truncate text-[11px] font-medium text-[#657065]">{label}</p><p className="mt-1 font-display text-2xl font-semibold text-[#1e2a1f] sm:text-[28px]">{value}</p></div>)}
      </div>
      <div className="mt-3">
        <AdminEquipmentMap />
      </div>
    </AdminShell>
  );
}
