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

function buildClassName(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

export function ListCard({ children, href, className }: ListCardProps) {
  const classes = buildClassName(
    "group relative block rounded-xl border border-ctp-surface0 bg-ctp-mantle p-4 shadow-sm transition-colors hover:border-ctp-surface1",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        <span
          aria-hidden
          className="absolute right-4 top-4 text-ctp-overlay0 transition-colors group-hover:text-ctp-subtext0"
        >
          →
        </span>
      </Link>
    );
  }

  return <article className={classes}>{children}</article>;
}

export function ListCardHeader({ children, className }: ListCardSectionProps) {
  return (
    <div className={buildClassName("space-y-1", className)}>{children}</div>
  );
}

export function ListCardTitle({ children, className }: ListCardSectionProps) {
  return (
    <h3
      className={buildClassName(
        "text-base font-semibold tracking-tight text-ctp-text",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function ListCardDescription({
  children,
  className,
}: ListCardSectionProps) {
  return (
    <p className={buildClassName("text-sm text-ctp-subtext0", className)}>
      {children}
    </p>
  );
}

export function ListCardFooter({ children, className }: ListCardSectionProps) {
  return (
    <div
      className={buildClassName(
        "mt-4 border-t border-ctp-surface0 pt-3 text-xs text-ctp-subtext1",
        className,
      )}
    >
      {children}
    </div>
  );
}
