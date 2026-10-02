import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(24),
  password: z.string().min(8).max(128),
  role: z.enum(["farmer", "owner"]).default("farmer")
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128)
});

export const codeSchema = z.object({
  code: z.string().regex(/^(?:\d{6}|[a-fA-F0-9]{10})$/, "Enter a six-digit authenticator code or backup code")
});