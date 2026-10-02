import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-[50px] w-full rounded-xl border border-border-strong bg-white px-4 text-[15px] text-primary-deep outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-background-paper",
        className
      )}
      {...props}
    />
  );
}