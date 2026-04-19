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
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ctp-subtext0">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={item.href ? `${item.href}-${item.label}` : item.label}
              className="flex min-w-0 items-center gap-2"
            >
              {index > 0 ? (
                <span aria-hidden className="text-ctp-overlay0">
                  &gt;
                </span>
              ) : null}

              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={buildClassName(
                    "truncate transition-colors hover:text-ctp-text",
                    isCurrent ? "font-medium text-ctp-text" : undefined,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-ctp-text">
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
