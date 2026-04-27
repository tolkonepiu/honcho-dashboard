import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ReactNode } from "react";

type ListCardProps = {
  children: ReactNode;
  href?: string;
  className?: string;
};

type ListCardSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ListCard({ children, href, className }: ListCardProps) {
  const classes = cn("group relative block p-4", className);

  if (href) {
    return (
      <Link href={href} className="group block">
        <Surface as="article" interactive className={classes}>
          {children}
          <span
            aria-hidden
            className="ui-compact-text absolute top-4 right-4 text-[var(--text-dim)] transition-colors group-hover:text-[var(--color-accent)]"
          >
            <i className="hn hn-arrow-right-solid" />
          </span>
        </Surface>
      </Link>
    );
  }

  return (
    <Surface as="article" className={classes}>
      {children}
    </Surface>
  );
}

export function ListCardHeader({ children, className }: ListCardSectionProps) {
  return <div className={cn("space-y-1", className)}>{children}</div>;
}

export function ListCardTitle({ children, className }: ListCardSectionProps) {
  return <h3 className={cn("ui-title", className)}>{children}</h3>;
}

export function ListCardDescription({
  children,
  className,
}: ListCardSectionProps) {
  return (
    <p className={cn("text-xs leading-5 text-[var(--text-muted)]", className)}>
      {children}
    </p>
  );
}

export function ListCardFooter({ children, className }: ListCardSectionProps) {
  return (
    <div
      className={cn(
        "mt-4 border-t-2 border-[var(--pixel-border)] pt-3 text-xs text-[var(--text-secondary)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
