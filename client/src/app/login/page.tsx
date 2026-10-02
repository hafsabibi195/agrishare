import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/user-auth";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <LoginForm />;
}