import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "li" | "section";
  children: ReactNode;
  variant?: "default" | "inset" | "subtle";
  interactive?: boolean;
};

const variantClassName = {
  default: "ui-surface",
  inset: "ui-surface-inset",
  subtle: "ui-surface-subtle",
};

export function Surface({
  as = "div",
  children,
  className,
  interactive = false,
  variant = "default",
  ...props
}: SurfaceProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        variantClassName[variant],
        interactive &&
          "transition-[background-color,border-color,transform] hover:-translate-y-px hover:border-[var(--color-accent)] hover:bg-[var(--surface-interactive)]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
