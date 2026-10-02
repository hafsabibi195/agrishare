import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = { title: "Admin portal sign in" };

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}