"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

type DashboardShellProps = {
  children: ReactNode;
  headerActions?: ReactNode;
};

function toBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  return segments.map((segment, index) => ({
    label: decodeURIComponent(segment),
    href: `/${segments.slice(0, index + 1).join("/")}`,
  }));
}

export function DashboardShell({
  children,
  headerActions,
}: DashboardShellProps) {
  const pathname = usePathname();
  const breadcrumbs = toBreadcrumbs(pathname);

  return (
    <div className="min-h-[100dvh] bg-ctp-base text-ctp-text">
      <header className="sticky top-0 z-20 border-b-2 border-[var(--pixel-border)] bg-ctp-mantle shadow-[0_3px_0_0_var(--color-ctp-crust)]">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6">
          <div className="flex h-14 items-center gap-4">
            <Link
              href="/workspaces"
              className="inline-flex min-w-0 items-center gap-2 border border-transparent px-1.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-ctp-text transition-colors hover:border-[var(--pixel-border)] hover:bg-ctp-surface0 hover:text-ctp-lavender"
            >
              <i
                aria-hidden
                className="hn hn-analytics text-[18px] leading-none text-ctp-lavender"
              />
              <span className="truncate">Honcho Dashboard</span>
            </Link>

            {headerActions ? (
              <div className="ml-auto shrink-0">{headerActions}</div>
            ) : null}
          </div>

          <div className="flex min-h-11 items-center border-t border-[var(--pixel-border)] py-2">
            <div className="min-w-0 flex-1">
              {breadcrumbs.length > 0 ? (
                <Breadcrumbs items={breadcrumbs} />
              ) : (
                <div
                  aria-hidden
                  className="h-5 w-full max-w-56 border border-[var(--pixel-border)] bg-ctp-surface0"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 px-4 py-6 sm:px-6">
        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </div>
  );
}
