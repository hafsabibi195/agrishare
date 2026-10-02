"use client";

import { Star } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { demoEquipment, demoUsers } from "@/data/sampleData";
import { useDemoAuth } from "@/lib/demo-state";

export default function AdminReviewsPage() {
  const { data } = useDemoAuth();

  return (
    <AdminShell title="Reviews">
      <div className="overflow-hidden rounded-2xl border border-[#1f2d28] bg-[#121c18]">
        <div className="border-b border-[#1f2d28] px-4 py-4 sm:px-5">
          <h2 className="text-sm font-semibold text-white">User reviews</h2>
          <p className="mt-1 text-xs text-[#91a69a]">Read-only feedback from equipment rentals.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#0d1512] text-xs uppercase tracking-wide text-[#9bb5a5]">
              <tr>
                <th className="px-4 py-3 font-medium">Reviewer</th>
                <th className="px-4 py-3 font-medium">Equipment</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d28] text-[#e5eee8]">
              {data.reviews.map((review) => {
                const equipment = demoEquipment.find((item) => item.id === review.equipmentId);
                const reviewer = demoUsers.find((user) => user.id === review.userId);
                return (
                  <tr key={review.id}>
                    <td className="px-4 py-4 font-medium">{reviewer?.name ?? review.userName}</td>
                    <td className="px-4 py-4">{equipment?.title ?? "Equipment"}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-amber-300"><Star size={14} fill="currentColor" />{review.rating}/5</span>
                    </td>
                    <td className="max-w-[420px] px-4 py-4 leading-5 text-[#b6c8bf]">{review.comment}</td>
                  </tr>
                );
              })}
              {data.reviews.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-[#91a69a]">No reviews yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}