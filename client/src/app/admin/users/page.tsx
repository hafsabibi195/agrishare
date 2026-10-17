"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { demoUsers } from "@/data/sampleData";

export default function AdminUsersPage() {
  return (
    <AdminShell title="Users">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#1f2d28] bg-[#121c18] p-4">
          <div className="mb-3 text-sm uppercase tracking-[0.12em] text-[#9bb5a5]">Registered users</div>
          <div className="space-y-3">
            {demoUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-xl border border-[#21332a] bg-[#0d1512] px-3 py-3">
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-[#8ea39a]">{user.email}</div>
                </div>
                <span className="rounded-full bg-[#1f3b2d] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#b7f0cb]">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
