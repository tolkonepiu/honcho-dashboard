import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: "default" | "neutral" | "success" | "danger";
};

const variantClassName = {
  default: "ui-badge text-[var(--text-muted)]",
  neutral: "ui-badge bg-[var(--surface-strong)] text-[var(--text-muted)]",
  success:
    "ui-badge border-[color:color-mix(in_srgb,var(--color-success)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--color-success)_20%,transparent)] text-[var(--color-success)]",
  danger:
    "ui-badge border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)] text-[var(--color-danger)]",
};

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span className={cn(variantClassName[variant], className)} {...props}>
      {children}
    </span>
  );
}
