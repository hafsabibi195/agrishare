import type { ZodType } from "zod";
import { AppError } from "./app-error.js";

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new AppError(400, "Validation failed", result.error.flatten());
  return result.data;
}