import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

function buildClassName(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={buildClassName("min-w-0", className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.05em] text-ctp-subtext0">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={item.href ? `${item.href}-${item.label}` : item.label}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 ? (
                <i
                  aria-hidden
                  className="hn hn-angle-right-solid text-[14px] leading-none text-ctp-overlay0"
                />
              ) : null}

              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={buildClassName(
                    "truncate border border-transparent px-1.5 py-0.5 transition-colors hover:border-[var(--pixel-border)] hover:bg-ctp-surface0 hover:text-ctp-text",
                    isCurrent
                      ? "border-[var(--pixel-border)] bg-ctp-surface0 font-medium text-ctp-text shadow-[var(--pixel-shadow-sm)]"
                      : undefined,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate border border-[var(--pixel-border)] bg-ctp-surface0 px-1.5 py-0.5 font-medium text-ctp-text shadow-[var(--pixel-shadow-sm)]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
