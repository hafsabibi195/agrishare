"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { getEquipmentById, getUserById } from "@/data/sampleData";
import { useDemoAuth } from "@/lib/demo-state";

export default function AdminUsagePage() {
  const { data } = useDemoAuth();
  const currentUsage = data.bookings.filter((booking) => booking.status === "approved" || booking.status === "accepted");

  return (
    <AdminShell title="Who’s using what">
      <div className="overflow-hidden rounded-2xl border border-[#1f2d28] bg-[#121c18]">
        <div className="border-b border-[#1f2d28] px-4 py-4 sm:px-5">
          <h2 className="text-sm font-semibold text-white">Current equipment use</h2>
          <p className="mt-1 text-xs text-[#91a69a]">Active and confirmed rentals from the shared booking records.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#0d1512] text-xs uppercase tracking-wide text-[#9bb5a5]">
              <tr>
                <th className="px-4 py-3 font-medium">Farmer</th>
                <th className="px-4 py-3 font-medium">Equipment</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Rental status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d28] text-[#e5eee8]">
              {currentUsage.map((booking) => {
                const farmer = getUserById(booking.renterId);
                const owner = getUserById(booking.ownerId);
                const equipment = getEquipmentById(booking.equipmentId);
                return (
                  <tr key={booking.id}>
                    <td className="px-4 py-3">{farmer?.name ?? "Farmer"}</td>
                    <td className="px-4 py-3">{equipment?.title ?? "Equipment"}</td>
                    <td className="px-4 py-3">{owner?.name ?? equipment?.ownerName ?? "Owner"}</td>
                    <td className="px-4 py-3 text-[#b6c8bf]">{booking.bookedDates}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">{booking.status === "approved" ? "In use" : "Confirmed"}</span></td>
                  </tr>
                );
              })}
              {currentUsage.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-[#91a69a]">No active equipment use right now.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}