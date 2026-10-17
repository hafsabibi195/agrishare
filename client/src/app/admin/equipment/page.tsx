"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { useDemoAuth } from "@/lib/demo-state";

const statusColor: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-300",
  rented: "bg-amber-500/15 text-amber-300",
  "pending approval": "bg-blue-500/15 text-blue-300"
};

export default function AdminEquipmentPage() {
  const { data } = useDemoAuth();

  return (
    <AdminShell title="Equipment">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-4">
          <div className="mb-3 text-sm uppercase tracking-[0.12em] text-[#9bb5a5]">Equipment catalog</div>
          <div className="space-y-3">
            {data.equipment.map((equipment) => (
              <div key={equipment.id} className="rounded-xl border border-[#21332a] bg-[#0d1512] p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-white">{equipment.title}</div>
                    <div className="text-sm text-[#8ea39a]">{equipment.city} • {equipment.category}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${equipment.status === "rented" ? statusColor.rented : statusColor.available}`}>
                    {equipment.status === "rented" ? "In use" : "Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
