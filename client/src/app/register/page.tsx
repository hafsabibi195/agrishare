import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/user-auth";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  const initialRole = searchParams.role === "owner" ? "owner" : "farmer";
  return <RegisterForm initialRole={initialRole} />;
}