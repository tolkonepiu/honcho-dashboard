import Link from "next/link";
import { cn } from "@/lib/cn";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("min-w-0", className)}
    >
      <ol className="ui-section-label flex flex-wrap items-center gap-x-2 gap-y-1">
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
                  className="hn hn-angle-right-solid ui-icon-sm text-[var(--text-dim)]"
                />
              ) : null}

              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "truncate border border-transparent px-1.5 py-0.5 transition-colors hover:border-[var(--pixel-border)] hover:bg-[var(--surface-interactive)] hover:text-[var(--text-primary)]",
                    isCurrent
                      ? "border-[var(--pixel-border)] bg-[var(--surface-interactive)] font-medium text-[var(--text-primary)] shadow-[var(--pixel-shadow-sm)]"
                      : undefined,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate border border-[var(--pixel-border)] bg-[var(--surface-interactive)] px-1.5 py-0.5 font-medium text-[var(--text-primary)] shadow-[var(--pixel-shadow-sm)]">
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
