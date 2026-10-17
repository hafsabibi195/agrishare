import Link from "next/link";
import { Menu, Sprout, Wheat } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

const navLinks = [
  ["How it works", "/#how"],
  ["Equipment", "/#categories"],
  ["For owners", "/#owners"]
] as const;

export function PublicNav() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-background-paper/90 backdrop-blur-md">
      <div className="hidden bg-primary-deep text-xs font-semibold text-wheat-soft sm:block">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-5 lg:px-12">
          <span className="inline-flex items-center gap-1.5"><Wheat size={13} className="text-wheat" />Rabi season is here: book wheat sowing equipment early</span>
          <span className="inline-flex items-center gap-1.5"><Sprout size={13} className="text-wheat" />Punjab · Sindh · KPK · Balochistan</span>
        </div>
      </div>
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-8 px-5 lg:px-12">
        <Brand />
        <nav className="hidden flex-1 items-center gap-8 text-sm font-medium lg:flex">
          {navLinks.map(([label, href]) => <a key={label} className="text-[#3E4A3C] transition hover:text-primary" href={href}>{label}</a>)}
          <Link className="text-[#3E4A3C] transition hover:text-primary" href="/equipment/near-me">Find equipment</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link className="hidden text-sm font-semibold hover:text-primary sm:inline" href="/login">Log in</Link>
          <Link href="/register"><Button size="sm" className="px-5">Sign up</Button></Link>
          <details className="group relative lg:hidden">
            <summary className="grid size-10 list-none cursor-pointer place-items-center rounded-lg border border-border-strong bg-white" aria-label="Open navigation"><Menu size={19} /></summary>
            <nav className="absolute right-0 top-12 flex w-52 flex-col gap-1 rounded-xl border border-border bg-white p-2 shadow-panel">
              {navLinks.map(([label, href]) => <a key={label} className="rounded-lg px-3 py-2 text-sm hover:bg-background" href={href}>{label}</a>)}
              <Link className="rounded-lg px-3 py-2 text-sm hover:bg-background" href="/equipment/near-me">Find equipment</Link>
              <Link className="rounded-lg px-3 py-2 text-sm hover:bg-background" href="/login">Log in</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-primary-deep text-[#E9E4D4]">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(90deg,#E3B04B_0_24px,#2E5E3A_24px_48px)]" />
      <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-20">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Brand dark />
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#B9C2B0]">Farm equipment rental for farmers across Pakistan. From sowing to harvest, the right machine is never far away.</p>
          </div>
          <FooterColumn title="Platform" links={[["Rent equipment", "/equipment/near-me"], ["List equipment", "/register?role=owner"], ["How it works", "/#how"]]} />
          <FooterColumn title="Support" links={[["Contact us", "mailto:hello@agrishare.pk"], ["Safety", "/#owners"]]} />
          <FooterColumn title="Legal" links={[["Terms", "/terms"], ["Privacy", "/privacy"]]} />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#34422F] pt-6 text-xs text-[#B9C2B0]">
          <span>© 2026 AgriShare Pakistan</span>
          <Link className="inline-flex items-center gap-2 hover:text-white" href="/admin/login">Admin portal</Link>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return <div className="flex flex-col items-start gap-3 text-sm"><h2 className="font-bold text-white">{title}</h2>{links.map(([label, href]) => <Link key={label} className="text-[#B9C2B0] hover:text-white" href={href}>{label}</Link>)}</div>;
}
