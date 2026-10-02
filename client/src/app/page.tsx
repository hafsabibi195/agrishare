import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { MapPreview } from "@/components/map-preview";
import { demoEquipment } from "@/data/sampleData";

const steps = [
  {
    number: "1",
    title: "Sign in securely",
    description: "Log in with your password and a 6-digit code from your authenticator app."
  },
  {
    number: "2",
    title: "List or find",
    description: "Put your equipment up for rent, or search for equipment near you."
  },
  {
    number: "3",
    title: "See it on the map",
    description: "Every listing has a GPS location, so you can see how far it is."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F1E6] text-[#1E2A1F]">
      <header className="border-b border-[#E2DCCB] bg-[#FBF9F2]">
        <div className="mx-auto flex min-h-20 max-w-[1440px] items-center gap-5 px-5 sm:px-8 lg:px-20">
          <Brand className="mr-auto" />
          <a href="#how" className="hidden text-sm font-medium hover:text-[#2E5E3A] sm:block">How it works</a>
          <Link href="/login" className="text-sm font-semibold hover:text-[#2E5E3A]">Log in</Link>
          <Link href="/register" className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#2E5E3A] px-5 text-sm font-semibold text-white transition hover:bg-[#1F4429]">Sign up</Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-6 sm:gap-9 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:px-20 lg:py-[72px]">
          <div className="flex flex-col items-start gap-4 sm:gap-7">
            <span className="rounded-full bg-[#E4EDDF] px-3.5 py-1.5 text-xs font-bold text-[#2E5E3A]">Farm equipment rental · Pakistan</span>
            <h1 className="max-w-[650px] font-display text-[42px] font-semibold leading-[1.04] sm:text-[54px] lg:text-[62px]">Rent farm equipment near you, on the map.</h1>
            <p className="max-w-[550px] text-base leading-7 text-[#4A5447] sm:text-lg sm:leading-8">List your tractor for rent, or find one close to your farm. AgriShare uses your location to show what’s available nearby.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] bg-[#2E5E3A] px-6 text-base font-bold text-white transition hover:bg-[#1F4429]">Get started <ArrowRight size={17}/></Link>
              <a href="#how" className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] border border-[#C9C1A9] bg-white px-6 text-base font-bold transition hover:border-[#2E5E3A]">How it works</a>
            </div>
          </div>

          <div className="relative h-[230px] overflow-hidden rounded-2xl border border-[#D6CFBB] bg-[#E8E6D2] shadow-[0_24px_54px_rgba(30,42,31,0.12)] sm:h-[390px] lg:h-[520px] lg:rounded-[28px]">
            <MapPreview compact equipment={demoEquipment}/>
            <div className="pointer-events-none absolute inset-0 z-[500]" aria-hidden="true">
              <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#2E5E3A]/80 bg-[#2E5E3A]/[0.07] sm:size-52 lg:size-[280px]"/>
              <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#2E6FB0] shadow-[0_0_0_7px_rgba(46,111,176,0.2)]"/>
              <span className="absolute left-[8%] top-[26%] rounded-full border border-[#D6CFBB] bg-white px-3 py-1.5 text-xs font-bold shadow-md sm:left-[12%] sm:top-[31%]">Nearby equipment</span>
              <span className="absolute bottom-[22%] right-[7%] rounded-full bg-[#2E5E3A] px-3 py-1.5 text-xs font-bold text-white shadow-md sm:right-[12%]">Local listings</span>
            </div>
            <div className="absolute right-3 top-3 z-[600] flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold shadow sm:right-5 sm:top-5"><span className="size-2 rounded-full bg-[#2E6FB0]"/>Find your area</div>
            <Link href="/equipment/near-me" aria-label="Explore nearby equipment on the map" className="absolute bottom-3 left-3 z-[600] inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold shadow transition hover:bg-[#F5F1E6] sm:bottom-5 sm:left-5 sm:px-4 sm:py-3 sm:text-sm"><MapPin size={16} className="text-[#2E5E3A]"/>Explore nearby equipment <ArrowRight size={15}/></Link>
          </div>
        </section>

        <section id="how" className="border-t border-[#E2DCCB] bg-[#EEEBDD] px-5 py-12 sm:px-8 sm:py-16 lg:px-20 lg:py-20">
          <div className="mx-auto max-w-[1280px]">
            <h2 className="font-display text-3xl font-semibold sm:text-[42px]">How it works</h2>
            <div className="mt-7 grid gap-3 md:mt-9 md:grid-cols-3 md:gap-5">
              {steps.map((step) => (
                <article key={step.number} className="flex min-h-[200px] flex-col items-start gap-3 rounded-lg border border-[#E2DCCB] bg-white p-5 sm:p-7">
                  <span className="grid size-11 place-items-center rounded-full bg-[#2E5E3A] font-display text-xl font-semibold text-white">{step.number}</span>
                  <h3 className="text-lg font-bold sm:text-[21px]">{step.title}</h3>
                  <p className="text-sm leading-6 text-[#4A5447] sm:text-base">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1E2A1F] px-5 py-6 text-[#B9C2B0] sm:px-8 lg:px-20">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 text-sm">
          <Brand dark className="[&_span:last-child]:text-xl" />
          <span className="mr-auto">© 2026 AgriShare</span>
          <Link href="/admin/login" className="inline-flex items-center gap-2 hover:text-white"><ShieldCheck size={15}/>Admin</Link>
        </div>
      </footer>
    </div>
  );
}