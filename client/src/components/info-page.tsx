import { PublicFooter, PublicNav } from "@/components/public-nav";
import { farmImages } from "@/lib/equipment-images";

export function InfoPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: [string, string][] }) {
  return (
    <div className="bg-agri agri-fields flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-primary-deep text-white">
          <img src={farmImages.hero} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/85 to-primary/40" />
          <div className="relative mx-auto max-w-3xl px-5 py-16">
            <p className="text-xs font-bold uppercase tracking-wider text-wheat">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold">{title}</h1>
            <p className="mt-3 text-[#DCE7D6]">{intro}</p>
          </div>
        </section>
        <div className="mx-auto max-w-3xl space-y-4 px-5 py-12">
          {sections.map(([heading, body]) => (
            <section key={heading} className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-bold">{heading}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
