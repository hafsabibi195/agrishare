"use client";

import { ArrowRight, ClipboardCheck, MapPinned, Tractor, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { useDemoAuth } from "@/lib/demo-state";

const statusColor: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-300",
  rented: "bg-amber-500/15 text-amber-300",
  "pending approval": "bg-blue-500/15 text-blue-300"
};

export default function AdminOverviewPage() {
  const { data } = useDemoAuth();

  const activeRentals = data.equipment.filter((item) => item.status === "rented").length;
  const pendingApproval = data.equipment.filter((item) => item.status === "pending approval").length;

  return (
    <AdminShell title="Overview">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.adminStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[#9bb5a5]">
                <span>{stat.label}</span>
                <ArrowRight size={14} />
              </div>
              <div className="mt-5 text-3xl font-semibold text-white">{stat.value}</div>
              <div className="mt-2 text-sm text-[#9bb5a5]">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#1f3b2d] p-2 text-[#b7f0cb]">
                <Tractor size={18} />
              </div>
              <div>
                <p className="text-sm text-[#a8bcb0]">Fleet health</p>
                <h2 className="text-xl font-semibold text-white">Equipment status</h2>
              </div>
            </div>

            <div className="space-y-3">
              {data.equipment.slice(0, 5).map((equipment) => (
                <div key={equipment.id} className="flex items-center justify-between rounded-xl border border-[#21332a] bg-[#0d1512] px-3 py-2.5">
                  <div>
                    <div className="font-medium text-white">{equipment.title}</div>
                    <div className="text-xs text-[#8ea39a]">{equipment.city}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusColor[equipment.status]}`}>
                    {equipment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#1d2d29] p-2 text-[#cfe8ff]">
                  <MapPinned size={18} />
                </div>
                <div>
                  <p className="text-sm text-[#a8bcb0]">Dispatch</p>
                  <h3 className="text-lg font-semibold text-white">Most active regions</h3>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[#dfefe6]">
                <li>• Lahore: 24 active rentals</li>
                <li>• Faisalabad: 18 equipment listings</li>
                <li>• Multan: 16 bookings</li>
                <li>• Okara: 11 nearby users</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#1d2d29] p-2 text-[#f4dca8]">
                  <ClipboardCheck size={18} />
                </div>
                <div>
                  <p className="text-sm text-[#a8bcb0]">Operations</p>
                  <h3 className="text-lg font-semibold text-white">At a glance</h3>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#0d1512] p-3">
                  <div className="text-[#8fa79f]">Active rentals</div>
                  <div className="mt-1 text-xl font-semibold text-white">{activeRentals}</div>
                </div>
                <div className="rounded-xl bg-[#0d1512] p-3">
                  <div className="text-[#8fa79f]">Pending</div>
                  <div className="mt-1 text-xl font-semibold text-white">{pendingApproval}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-5">
            <div className="mb-2 flex items-center gap-2 text-[#a8bcb0]">
              <Users size={18} />
              <span className="text-sm">Users</span>
            </div>
            <div className="text-3xl font-semibold text-white">{data.bookings.length + 5}</div>
            <div className="mt-2 text-sm text-[#8ea39a]">Registered members and operators</div>
          </div>

          <div className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-5">
            <div className="mb-2 flex items-center gap-2 text-[#a8bcb0]">
              <Tractor size={18} />
              <span className="text-sm">Equipment</span>
            </div>
            <div className="text-3xl font-semibold text-white">{data.equipment.length}</div>
            <div className="mt-2 text-sm text-[#8ea39a]">Currently listed across Pakistan</div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}