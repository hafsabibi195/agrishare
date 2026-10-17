"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoAuth } from "@/lib/demo-state";
import { farmImages } from "@/lib/equipment-images";

export function UserAuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-agri lg:grid-cols-[minmax(400px,44%)_1fr]">
      <aside className="text-on-photo relative hidden min-h-screen overflow-hidden p-10 text-white lg:flex lg:flex-col lg:p-14">
        <Brand dark className="relative z-10 [&_span:nth-child(2)]:text-white" />
        <div className="relative z-10 my-auto max-w-[470px] pb-12 pt-20">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-wheat">AgriShare Pakistan</p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.06]">Machinery when the season needs it.</h1>
          <p className="mt-5 text-lg leading-7 text-white/80">Book trusted equipment from owners near your fields, or put the machines you own to work.</p>
          <div className="mt-8 flex flex-wrap gap-2">{["GPS near me", "Live booking updates", "Trusted local owners"].map((text)=><span key={text} className="rounded-full border border-white/20 bg-white/15 px-3.5 py-2 text-xs font-semibold backdrop-blur">{text}</span>)}</div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3">{[["Tractors", farmImages.tractor], ["Harvesters", farmImages.harvester], ["Sprayers", farmImages.sprayer]].map(([label, src]) => <figure key={label} className="overflow-hidden rounded-xl border border-white/20 bg-white/10"><img src={src} alt={label} className="h-20 w-full object-cover" /><figcaption className="px-2.5 py-1.5 text-xs font-semibold">{label}</figcaption></figure>)}</div>
        <p className="relative z-10 mt-5 text-xs text-white/70">Built for Pakistan&apos;s fields and farming seasons.</p>
      </aside>
      <section className="relative flex min-h-screen items-center justify-center bg-agri px-5 py-20 text-white text-on-photo sm:px-8">
        <div className="absolute right-5 top-5 flex items-center gap-4 sm:right-10 sm:top-8"><Link className="text-sm font-semibold text-white/85 hover:text-wheat" href="/admin/login">Admin portal</Link></div>
        {children}
      </section>
    </main>
  );
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
      login(email, password, "user");
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to log in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <UserAuthFrame><form onSubmit={submit} className="w-full max-w-[420px] space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-wheat">Your farm, in season</p><h2 className="mt-2 font-display text-4xl font-semibold">Welcome back</h2><p className="mt-3 text-sm leading-6 text-white/80">Log in to manage your bookings and equipment.</p></div>
      <FormField label="Email" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@agrishare.pk" defaultValue="farmer@agrishare.pk" required /></FormField>
      <FormField label="Password" htmlFor="password" trailing={<Link href="#forgot-password" className="text-xs font-semibold text-wheat hover:underline">Forgot password?</Link>}>
        <div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" defaultValue="Agri@1234" required className="pr-12"/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
      </FormField>
      <label className="flex items-center gap-2.5 text-sm text-white/85"><input name="remember" type="checkbox" className="size-4 accent-primary"/>Keep me logged in</label>
      {error && <ErrorNotice message={error} />}
      <Button type="submit" disabled={isSubmitting} className="h-[52px] w-full text-base">{isSubmitting?<LoaderCircle className="animate-spin" size={18}/>:null}Log in <ArrowRight size={17}/></Button>
      <div className="flex items-center gap-3 text-xs text-white/75"><span className="h-px flex-1 bg-white/30"/>New to AgriShare?<span className="h-px flex-1 bg-white/30"/></div>
      <Link href="/register" className="flex h-[50px] items-center justify-center rounded-xl border border-border-strong bg-white text-sm font-bold text-primary-deep hover:bg-background-paper">Create an account</Link>
      <p className="text-center text-xs text-white/75"><ShieldCheck size={14} className="mr-1 inline text-wheat"/>Admins must sign in through the <Link href="/admin/login" className="font-semibold text-wheat">admin portal</Link>.</p>
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
      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-wheat">Join AgriShare</p><h2 className="mt-2 font-display text-4xl font-semibold">Create account</h2><p className="mt-3 text-sm text-white/80">One account for your work in the field.</p></div>
      <FormField label="Full name" htmlFor="name"><Input id="name" name="name" autoComplete="name" placeholder="Your full name" minLength={2} required /></FormField>
      <FormField label="Email" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></FormField>
      <FormField label="Phone" htmlFor="phone"><Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" required /></FormField>
      <input type="hidden" name="role" value={initialRole} />
      <FormField label="Password" htmlFor="password"><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /></FormField>
      {error && <ErrorNotice message={error} />}
      <Button type="submit" disabled={isSubmitting} className="h-[52px] w-full text-base">{isSubmitting?<LoaderCircle className="animate-spin" size={18}/>:null}Create account <ArrowRight size={17}/></Button>
      <p className="text-center text-sm text-white/80">Already registered? <Link href="/login" className="font-bold text-wheat">Log in</Link></p>
      <p className="text-center text-xs text-white/75">By creating an account, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
    </form></UserAuthFrame>
  );
}

function FormField({ label, htmlFor, trailing, children }: { label: string; htmlFor: string; trailing?: React.ReactNode; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex items-baseline justify-between gap-3"><label htmlFor={htmlFor} className="text-sm font-semibold">{label}</label>{trailing}</div>{children}</div>;
}

function ErrorNotice({ message }: { message: string }) {
  return <p role="alert" className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{message}</p>;
}