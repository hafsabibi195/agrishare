import type { Metadata } from "next";
import { VerifyTwoFactorForm } from "@/components/auth/user-auth";

export const metadata: Metadata = { title: "Two-step verification" };

export default function VerifyTwoFactorPage() {
  return <VerifyTwoFactorForm />;
}