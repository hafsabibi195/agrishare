import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

export function Brand({ dark = false, admin = false, className }: { dark?: boolean; admin?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className={cn("grid size-9 place-items-center rounded-[10px]", dark ? "bg-white text-primary" : "bg-primary text-white")}>
        <Leaf aria-hidden="true" size={20} strokeWidth={2} />
      </span>
      <span className={cn("font-display text-2xl font-semibold", dark && "text-white")}>AgriShare</span>
      {admin && <span className="ml-1 rounded-md border border-[#2C3D31] bg-[#1C2A21] px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[#8FCB9F]">ADMIN</span>}
    </Link>
  );
}