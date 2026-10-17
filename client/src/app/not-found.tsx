import Link from "next/link";
import { ArrowLeft, Tractor } from "lucide-react";
import { Brand } from "@/components/brand";
import { farmImages } from "@/lib/equipment-images";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-primary-deep px-5 py-20 text-white">
      <img src={farmImages.hero} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-primary-deep/80" />
      <div className="absolute left-5 top-5 sm:left-10 sm:top-8"><Brand dark /></div>
      <div className="relative max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-wheat text-primary-deep"><Tractor size={30} /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-wheat">404 · Off the field</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">This page wandered off the farm</h1>
        <p className="mt-3 text-[#DCE7D6]">The page you are looking for does not exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-xl bg-wheat px-5 font-bold text-primary-deep hover:bg-[#F0C15F]"><ArrowLeft size={17} />Back home</Link>
          <Link href="/equipment/near-me" className="inline-flex h-11 items-center rounded-xl border border-white/30 bg-white/10 px-5 font-semibold hover:bg-white/20">Find equipment</Link>
        </div>
      </div>
    </main>
  );
}
