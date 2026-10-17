"use client";
import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  Leaf,
  PhoneCall,
  Search,
  Tractor,
} from "lucide-react";
import { MapPreview } from "@/components/map-preview";
import { PublicFooter, PublicNav } from "@/components/public-nav";
import { demoEquipment } from "@/data/sampleData";
import { farmImages } from "@/lib/equipment-images";

const categories = [
  { title: "Tractors", image: farmImages.tractor, desc: "Massey Ferguson, Fiat, John Deere" },
  { title: "Combine Harvesters", image: farmImages.harvester, desc: "Wheat and paddy harvesting" },
  { title: "Rotavators & Cultivators", image: farmImages.cultivator, desc: "Soil tilling and land preparation" },
  { title: "Sprayers & Pumps", image: farmImages.sprayer, desc: "Crop protection and irrigation" },
];

const steps = [
  { step: "01", title: "Locate tools near you", desc: "Search by town or village to see equipment pinned on the map around your fields.", icon: Search },
  { step: "02", title: "Call the owner directly", desc: "Talk to the owner and agree on a daily or weekly rate. No middlemen.", icon: PhoneCall },
  { step: "03", title: "Get the field work done", desc: "Have the machine brought to your land, finish the season's work, and return it.", icon: Tractor },
];

export default function HomePage() {
  const available = demoEquipment.filter((equipment) => equipment.availability === "available").length;

  // Fade sections in as they scroll into view.
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-agri flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden text-white">
          <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-24">
            <div className="text-on-photo space-y-6 lg:col-span-7">
              <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-wheat/40 bg-wheat/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-wheat">
                <Leaf size={14} /> Farm equipment rental · Pakistan
              </span>
              <h1 style={{ animationDelay: "120ms" }} className="animate-fade-up font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                The right machine for every <span className="text-wheat">season</span>, right next to your fields.
              </h1>
              <p style={{ animationDelay: "240ms" }} className="animate-fade-up max-w-2xl text-base leading-relaxed text-[#DCE7D6] sm:text-lg">
                Rent tractors, harvesters and sprayers from trusted owners near you, or put your idle machinery to work.
              </p>
              <div style={{ animationDelay: "360ms" }} className="animate-fade-up flex flex-wrap items-center gap-3 pt-2">
                <Link href="/equipment/near-me" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-wheat px-7 text-base font-bold text-primary-deep shadow-lg shadow-black/20 transition hover:bg-[#F0C15F] active:scale-[0.98]">
                  Find equipment <ArrowRight size={18} />
                </Link>
                <Link href="/register?role=owner" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  List your machinery
                </Link>
              </div>
            </div>

            <div style={{ animationDelay: "300ms" }} className="animate-fade-up lg:col-span-5">
              <div className="animate-float rounded-3xl border border-white/20 bg-white/10 p-2.5 shadow-2xl backdrop-blur">
                <div className="relative h-[340px] overflow-hidden rounded-2xl bg-[#E8E6D2] sm:h-[400px]">
                  <MapPreview compact equipment={demoEquipment} />
                  <div className="absolute inset-x-3 bottom-3 z-[500] flex items-center justify-between rounded-xl border border-border bg-white/95 px-4 py-2.5 text-primary-deep shadow-md backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="size-2.5 animate-pulse rounded-full bg-primary" />
                      Live regional map
                    </div>
                    <span className="rounded-md border border-wheat/50 bg-wheat-soft px-2 py-0.5 text-xs font-extrabold text-[#7A5200]">
                      {available} available now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="mx-auto w-full max-w-[1440px] scroll-mt-28 space-y-10 px-5 py-16 lg:px-12 lg:py-20">
          <div className="reveal text-on-photo mx-auto max-w-2xl space-y-2 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-wheat">Agricultural equipment</p>
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Rent popular farming machinery</h2>
            <p className="text-sm text-white/80 sm:text-base">Choose from machinery listed by trusted farm owners in your district.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((item, index) => (
              <div key={item.title} style={{ transitionDelay: `${index * 100}ms` }} className="reveal flex">
              <Link href="/equipment/near-me" className="group w-full flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-panel">
                <div className="relative h-48 overflow-hidden bg-muted-soft">
                  <img src={item.image} alt={item.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary-deep/50 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                  <div>
                    <h3 className="text-lg font-bold transition group-hover:text-primary">{item.title}</h3>
                    <p className="mt-1 text-xs text-muted">{item.desc}</p>
                  </div>
                  <span className="flex items-center gap-1 border-t border-border pt-3 text-xs font-bold text-primary">Browse available <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-28 border-y border-[#CFE0C6] bg-primary-soft/95 px-5 py-16 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-[1440px] space-y-12">
            <div className="reveal mx-auto max-w-xl space-y-2 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A5200]">Simple 3-step process</p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">How AgriShare works</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map(({ step, title, desc, icon: Icon }, index) => (
                <div key={step} style={{ transitionDelay: `${index * 120}ms` }} className="reveal relative space-y-4 overflow-hidden rounded-2xl border border-border bg-white p-6">
                  <div aria-hidden="true" className="absolute -right-8 -top-8 size-28 rounded-full bg-wheat-soft" />
                  <div className="relative flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-primary text-white shadow-sm"><Icon size={22} /></span>
                    <span className="font-display text-3xl font-semibold text-wheat">{step}</span>
                  </div>
                  <h3 className="relative text-xl font-bold">{title}</h3>
                  <p className="relative text-sm leading-relaxed text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Owners CTA */}
        <section id="owners" className="mx-auto w-full max-w-[1440px] scroll-mt-28 px-5 pb-16 lg:px-12">
          <div className="reveal relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-primary p-8 text-white shadow-panel sm:p-12 md:flex-row md:items-center">
            <img src={farmImages.cultivator} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/85 to-primary/30" />
            <div className="relative max-w-xl space-y-4">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">Have equipment sitting idle?</h2>
              <p className="text-sm text-[#DCE7D6] sm:text-base">List your tractor, rotavator or harvester on AgriShare and earn by renting to farmers nearby.</p>
            </div>
            <Link href="/register?role=owner" className="relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-wheat px-7 text-base font-bold text-primary-deep shadow-lg transition hover:bg-[#F0C15F]">
              List your equipment <ArrowRight size={18} />
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
