import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "dark";

export function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "default" | "sm" | "icon" }) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-white hover:bg-[#1F4429]",
        variant === "secondary" && "bg-wheat text-primary-deep hover:bg-[#D5A13F]",
        variant === "outline" && "border border-border-strong bg-white text-primary-deep hover:bg-background-paper",
        variant === "ghost" && "text-primary-deep hover:bg-primary-soft",
        variant === "danger" && "bg-danger text-white hover:bg-[#8F3024]",
        variant === "dark" && "bg-forest text-white hover:bg-[#1C2A21]",
        size === "default" && "min-h-11 px-5 text-sm",
        size === "sm" && "min-h-9 px-3 text-xs",
        size === "icon" && "size-11",
        className
      )}
      {...props}
    />
  );
}