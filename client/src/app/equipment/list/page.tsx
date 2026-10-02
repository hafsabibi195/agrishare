"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoCities, demoEquipment, type EquipmentCategory } from "@/data/sampleData";
import { useDemoAuth } from "@/lib/demo-state";

const categories: EquipmentCategory[] = ["Tractor", "Harvester", "Sprayer", "Thresher", "Rotavator"];

export default function ListEquipmentPage() {
  return <DashboardFrame>{({ user }) => <ListingForm user={user} />}</DashboardFrame>;
}

function ListingForm({ user }: { user: ReturnType<typeof useDemoAuth>["auth"]["currentUser"] }) {
  const router = useRouter();
  const { addEquipment } = useDemoAuth();
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("Sign in to list your equipment.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const city = String(form.get("city")) as (typeof demoCities)[number];
    const cityLocation = demoEquipment.find((equipment) => equipment.city === city)?.location ?? { lat: 31.5204, lng: 74.3587 };
    addEquipment({
      id: `eq-${Date.now()}`,
      ownerId: user.id,
      ownerName: user.name,
      title: String(form.get("title") ?? "").trim(),
      category: String(form.get("category")) as EquipmentCategory,
      city,
      location: cityLocation,
      pricePerDay: Number(form.get("pricePerDay")),
      availability: "available",
      status: "available",
      rating: 0,
      description: String(form.get("description") ?? "").trim()
    });
    router.push("/dashboard#equipment");
  }

  return <section className="mx-auto max-w-[680px]">
    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"><ArrowLeft size={16}/>Dashboard</Link>
    <div className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Equipment owner</p><h1 className="mt-2 font-display text-3xl font-semibold">List equipment</h1><p className="mt-2 text-sm text-muted">Add your machine, daily rate and availability for local farmers.</p></div>
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-border bg-white p-5 sm:p-7">
      <label className="block space-y-2 text-sm font-semibold">Equipment name<Input name="title" placeholder="e.g. Massey Ferguson 385" minLength={3} required /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-semibold">Category<select name="category" className="h-11 w-full rounded-[10px] border border-border-strong bg-white px-3 text-sm font-medium" defaultValue={categories[0]}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="block space-y-2 text-sm font-semibold">City<select name="city" className="h-11 w-full rounded-[10px] border border-border-strong bg-white px-3 text-sm font-medium" defaultValue={demoCities[0]}>{demoCities.map((city) => <option key={city}>{city}</option>)}</select></label>
      </div>
      <label className="block space-y-2 text-sm font-semibold">Daily rate (PKR)<Input name="pricePerDay" type="number" min="1" step="100" placeholder="4000" required /></label>
      <label className="block space-y-2 text-sm font-semibold">Details<textarea name="description" rows={3} placeholder="Condition, capacity, or suitable field work" className="w-full rounded-[10px] border border-border-strong bg-white px-3 py-2 text-sm font-medium outline-none focus:border-primary" required /></label>
      <p className="text-xs text-muted">Your account phone number will be shown to farmers. This listing starts as available.</p>
      {error&&<p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" className="w-full"><Plus size={17}/>Publish equipment</Button>
    </form>
  </section>;
}