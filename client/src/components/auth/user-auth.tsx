"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoAuth } from "@/lib/demo-state";

export function UserAuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(400px,44%)_1fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:p-14">
        <FieldContour />
        <Brand dark className="relative z-10 [&_span:nth-child(2)]:text-white" />
        <div className="relative z-10 my-auto max-w-[470px] pb-12 pt-20">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-wheat">AgriShare Pakistan</p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.06]">Machinery when the season needs it.</h1>
          <p className="mt-5 text-[17px] leading-7 text-white/80">Book trusted equipment from owners near your fields, or put the machines you own to work.</p>
          <div className="mt-8 flex flex-wrap gap-2">{["GPS near me", "Live booking updates", "Protected with 2FA"].map((text)=><span key={text} className="rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold">{text}</span>)}</div>
        </div>
        <p className="relative z-10 text-xs text-white/70">Built for Pakistan&apos;s fields and farming seasons.</p>
      </aside>
      <section className="relative flex min-h-screen items-center justify-center px-5 py-20 sm:px-8">
        <div className="absolute right-5 top-5 flex items-center gap-4 sm:right-10 sm:top-8"><Link className="text-sm font-semibold text-muted hover:text-primary" href="/admin/login">Admin portal</Link></div>
        {children}
      </section>
    </main>
  );
}

function FieldContour() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-45"><div className="absolute -bottom-20 -left-20 h-[48%] w-[125%] -rotate-6 rounded-[48%] border-t-2 border-[#78A67C]"/><div className="absolute -bottom-28 -left-20 h-[48%] w-[125%] -rotate-6 rounded-[48%] border-t-2 border-[#78A67C]"/><div className="absolute -bottom-36 -left-20 h-[48%] w-[125%] -rotate-6 rounded-[48%] border-t-2 border-[#78A67C]"/><div className="absolute right-12 top-24 size-28 rounded-full bg-wheat/90"/></div>;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useDemoAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");
      const result = login(email, password, "user");
      router.push(result.requiresTwoFactor ? "/verify-2fa" : "/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to log in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <UserAuthFrame><form onSubmit={submit} className="w-full max-w-[420px] space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Your farm, in season</p><h2 className="mt-2 font-display text-4xl font-semibold">Welcome back</h2><p className="mt-3 text-sm leading-6 text-muted">Log in to manage your bookings and equipment.</p></div>
      <FormField label="Email" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@agrishare.pk" defaultValue="farmer@agrishare.pk" required /></FormField>
      <FormField label="Password" htmlFor="password" trailing={<Link href="#forgot-password" className="text-xs font-semibold text-primary">Forgot password?</Link>}>
        <div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" defaultValue="Agri@1234" required className="pr-12"/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
      </FormField>
      <label className="flex items-center gap-2.5 text-sm text-[#3E4A3C]"><input name="remember" type="checkbox" className="size-4 accent-primary"/>Keep me logged in</label>
      {error && <ErrorNotice message={error} />}
      <Button type="submit" disabled={isSubmitting} className="h-[52px] w-full text-base">{isSubmitting?<LoaderCircle className="animate-spin" size={18}/>:null}Log in <ArrowRight size={17}/></Button>
      <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border"/>New to AgriShare?<span className="h-px flex-1 bg-border"/></div>
      <Link href="/register" className="flex h-[50px] items-center justify-center rounded-xl border border-border-strong bg-white text-sm font-bold hover:bg-background-paper">Create an account</Link>
      <p className="text-center text-xs text-muted"><ShieldCheck size={14} className="mr-1 inline text-primary"/>Admins must sign in through the <Link href="/admin/login" className="font-semibold text-primary">admin portal</Link>.</p>
    </form></UserAuthFrame>
  );
}

export function RegisterForm({ initialRole = "farmer" }: { initialRole?: "farmer" | "owner" }) {
  const router = useRouter();
  const { register } = useDemoAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      register({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        password: String(form.get("password") ?? ""),
        role: initialRole
      });
      router.push("/login");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <UserAuthFrame><form onSubmit={submit} className="w-full max-w-[440px] space-y-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Join AgriShare</p><h2 className="mt-2 font-display text-4xl font-semibold">Create account</h2><p className="mt-3 text-sm text-muted">One account for your work in the field.</p></div>
      <FormField label="Full name" htmlFor="name"><Input id="name" name="name" autoComplete="name" placeholder="Your full name" minLength={2} required /></FormField>
      <FormField label="Email" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></FormField>
      <FormField label="Phone" htmlFor="phone"><Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" required /></FormField>
      <input type="hidden" name="role" value={initialRole} />
      <FormField label="Password" htmlFor="password"><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /></FormField>
      {error && <ErrorNotice message={error} />}
      <Button type="submit" disabled={isSubmitting} className="h-[52px] w-full text-base">{isSubmitting?<LoaderCircle className="animate-spin" size={18}/>:null}Create account <ArrowRight size={17}/></Button>
      <p className="text-center text-sm text-muted">Already registered? <Link href="/login" className="font-bold text-primary">Log in</Link></p>
      <p className="text-center text-xs text-muted">By creating an account, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
    </form></UserAuthFrame>
  );
}

export function VerifyTwoFactorForm() {
  const router = useRouter();
  const { verifyTwoFactor } = useDemoAuth();
  const [code, setCode] = useState("");
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      verifyTwoFactor(code);
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not verify this code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <div className="absolute left-5 top-5"><Brand /></div>
      <form onSubmit={submit} className="w-full max-w-[520px] rounded-[26px] border border-border bg-white p-6 text-center shadow-panel sm:p-12">
        <span className="mx-auto grid size-[68px] place-items-center rounded-full bg-primary-soft text-primary"><ShieldCheck size={34}/></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-primary">Account security</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-[34px]">Two-step verification</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Enter your six-digit verification code to continue.</p>
        <label htmlFor="verification-code" className="sr-only">{backup ? "Backup code" : "Six-digit code"}</label>
        <Input id="verification-code" autoFocus inputMode={backup?"text":"numeric"} autoComplete="one-time-code" maxLength={backup?10:6} value={code} onChange={(event)=>setCode(event.target.value.replace(backup?/[^a-fA-F0-9]/g:/\D/g, "").slice(0,backup?10:6))} placeholder={backup?"Backup code":"000000"} className="mt-7 h-[66px] text-center font-display text-3xl font-semibold tracking-[0.35em]" required />
        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">{Array.from({length:6},(_,index)=><span key={index} className={`h-1.5 w-8 rounded-full ${code.length>index?"bg-primary":"bg-muted-soft"}`}/>)}</div>
        <label className="mt-6 flex items-center justify-center gap-2 text-sm text-muted"><input type="checkbox" className="size-4 accent-primary"/>Trust this device for 30 days</label>
        {error && <div className="mt-5"><ErrorNotice message={error}/></div>}
        <Button type="submit" disabled={isSubmitting || code.length < (backup?10:6)} className="mt-6 h-[52px] w-full text-base">{isSubmitting?<LoaderCircle className="animate-spin" size={18}/>:<Check size={18}/>}Verify and continue</Button>
        <button type="button" onClick={()=>{setBackup(!backup);setCode("");setError("");}} className="mt-5 text-sm font-semibold text-primary hover:underline">{backup?"Use an authenticator code":"Use a backup code instead"}</button>
        <Link href="/login" className="mt-7 flex items-center justify-center gap-2 text-sm text-muted hover:text-primary"><ArrowLeft size={15}/>Back to log in</Link>
      </form>
    </main>
  );
}

function FormField({ label, htmlFor, trailing, children }: { label: string; htmlFor: string; trailing?: React.ReactNode; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex items-baseline justify-between gap-3"><label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label>{trailing}</div>{children}</div>;
}

function ErrorNotice({ message }: { message: string }) {
  return <p role="alert" className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{message}</p>;
}