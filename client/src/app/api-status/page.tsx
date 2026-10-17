"use client";

export default function ApiStatusPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-agri px-6 text-[#1E2A1F]">
      <section className="w-full max-w-lg rounded-2xl border border-[#DEDBCF] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2E7D46]">AgriShare</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Application status</h1>
        <div className="mt-8 space-y-4">
          <StatusRow label="Web application" status="Available" state="ok" />
          <StatusRow label="Mock data layer" status="Loaded" state="ok" />
          <StatusRow label="OpenStreetMap view" status="Available" state="ok" />
          <StatusRow label="Backend API" status="Not used" state="pending" />
        </div>
        <p className="mt-5 text-sm text-[#4B5D4F]">This app runs entirely in the browser using local state and seeded sample data for the product walkthrough.</p>
        <a className="mt-8 inline-flex rounded-md bg-[#2E7D46] px-5 py-3 font-medium text-white hover:bg-[#26663A]" href="/">
          Back to AgriShare
        </a>
      </section>
    </main>
  );
}

function StatusRow({ label, status, state }: { label: string; status: string; state: "ok" | "pending" | "error" }) {
  const dotClass = state === "ok" ? "bg-emerald-600" : state === "error" ? "bg-red-600" : "bg-amber-500";

  return (
    <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm last:border-0 last:pb-0">
      <span className="text-stone-600">{label}</span>
      <span className="flex items-center gap-2 font-medium">
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClass}`} />
        {status}
      </span>
    </div>
  );
}