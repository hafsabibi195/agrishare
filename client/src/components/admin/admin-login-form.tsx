"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemoAuth } from "@/lib/demo-state";

export function AdminLoginForm() {
  const router = useRouter();
  const { login, verifyTwoFactor } = useDemoAuth();
  const [step, setStep] = useState<"password" | "totp">("password");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      if (step === "password") {
        const email = String(form.get("email") ?? "");
        const password = String(form.get("password") ?? "");
        const result = login(email, password, "admin");
        if (result.requiresTwoFactor) {
          setStep("totp");
          return;
        }
        router.push("/admin");
        return;
      }

      const code = String(form.get("code") ?? "");
      verifyTwoFactor(code);
      router.push("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Admin sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-agri-dark px-4 py-20 text-[#E8EDE6]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(#17201B 1px, transparent 1px), linear-gradient(90deg, #17201B 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute left-5 top-5 sm:left-10 sm:top-8"><Brand dark admin /></div>
      <form onSubmit={submit} className="relative w-full max-w-[460px] space-y-5 rounded-3xl border border-[#26332B] bg-[#161E19] p-6 shadow-[0_30px_80px_rgba(0,0,0,.45)] sm:p-11">
        <div className="flex flex-col items-center gap-3 text-center"><span className="grid size-16 place-items-center rounded-[18px] border border-primary bg-[#1C2A21] text-[#8FCB9F]">{step === "password" ? <ShieldCheck size={30}/> : <LockKeyhole size={30}/>}</span><h1 className="font-display text-3xl font-semibold">AgriShare Admin Portal</h1><p className="text-sm leading-6 text-[#9AA89E]">Administrator access. Verify your identity to continue.</p></div>
        <div className="flex items-center gap-3 text-xs font-bold"><span className={`flex flex-1 items-center gap-2 ${step === "password" ? "text-white" : "text-[#9AA89E]"}`}><span className="grid size-6 place-items-center rounded-full bg-[#2E7D46] text-white">1</span>Password</span><span className="h-px flex-1 bg-[#33423A]"/><span className={`flex flex-1 items-center justify-end gap-2 ${step === "totp" ? "text-white" : "text-[#9AA89E]"}`}><span className="grid size-6 place-items-center rounded-full border border-[#44554B]">2</span>Authenticator code</span></div>
        {step === "password" ? <><DarkField label="Admin email" htmlFor="admin-email"><Input id="admin-email" name="email" type="email" autoComplete="username" placeholder="admin@agrishare.pk" required className="border-[#33423A] bg-[#0F1512] text-[#E8EDE6] placeholder:text-[#78877C] focus:border-[#8FCB9F] focus:ring-[#8FCB9F]/10"/></DarkField><DarkField label="Password" htmlFor="admin-password"><Input id="admin-password" name="password" type="password" autoComplete="current-password" placeholder="Enter admin password" required className="border-[#33423A] bg-[#0F1512] text-[#E8EDE6] placeholder:text-[#78877C] focus:border-[#8FCB9F] focus:ring-[#8FCB9F]/10"/></DarkField></> : <DarkField label="Authenticator code" htmlFor="admin-code"><Input id="admin-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" required className="border-[#33423A] bg-[#0F1512] text-center font-display text-2xl tracking-[0.4em] text-[#E8EDE6] focus:border-[#8FCB9F] focus:ring-[#8FCB9F]/10"/></DarkField>}
        {error && <p role="alert" className="rounded-xl border border-[#4A3B1C] bg-[#1F1A12] px-4 py-3 text-sm text-[#E6C98A]">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="h-[52px] w-full bg-[#2E7D46] text-base hover:bg-[#26663A]">{isSubmitting?<LoaderCircle size={18} className="animate-spin"/>:null}{step === "password" ? "Continue" : "Verify and sign in"}<ArrowRight size={17}/></Button>
        <div className="flex gap-3 rounded-xl border border-[#33423A] bg-[#101712] p-3.5 text-xs leading-5 text-[#B7C8BC]"><ShieldAlert size={18} className="mt-0.5 shrink-0"/><p>Administrator accounts only. Other account types cannot access this portal.</p></div>
        {step === "totp" && <button type="button" onClick={()=>setStep("password")} className="flex w-full items-center justify-center gap-2 text-sm text-[#9AA89E] hover:text-white"><ArrowLeft size={15}/>Back to password</button>}
      </form>
      <Link href="/" className="absolute bottom-7 flex items-center gap-2 text-sm text-[#9AA89E] hover:text-[#B5E0BF]"><ArrowLeft size={15}/>Back to AgriShare</Link>
    </main>
  );
}

function DarkField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label htmlFor={htmlFor} className="text-sm font-semibold text-[#C9D3CB]">{label}</label>{children}</div>;
}