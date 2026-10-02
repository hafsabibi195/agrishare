import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "green" | "amber" | "blue" | "red" | "neutral";

export function Badge({ className, variant = "green", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        variant === "green" && "bg-primary-soft text-primary",
        variant === "amber" && "bg-wheat-soft text-[#7A5200]",
        variant === "blue" && "bg-info-soft text-info",
        variant === "red" && "bg-danger-soft text-danger",
        variant === "neutral" && "bg-muted-soft text-muted",
        className
      )}
      {...props}
    />
  );
}