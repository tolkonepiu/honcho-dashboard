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
    "group relative block border-2 border-[var(--pixel-border)] bg-ctp-mantle p-4 shadow-[var(--pixel-shadow-md)] transition-[background-color,border-color,transform] hover:-translate-y-px hover:border-ctp-lavender hover:bg-ctp-surface0",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        <span
          aria-hidden
          className="absolute right-4 top-4 text-[10px] text-ctp-overlay0 transition-colors group-hover:text-ctp-lavender"
        >
          <i className="hn hn-arrow-right-solid" />
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
        "text-sm font-semibold uppercase tracking-[0.05em] text-ctp-text",
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
    <p
      className={buildClassName(
        "text-xs leading-5 text-ctp-subtext0",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function ListCardFooter({ children, className }: ListCardSectionProps) {
  return (
    <div
      className={buildClassName(
        "mt-4 border-t-2 border-[var(--pixel-border)] pt-3 text-xs text-ctp-subtext1",
        className,
      )}
    >
      {children}
    </div>
  );
}
