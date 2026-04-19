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

function HonchoMark() {
  return (
    <span
      aria-hidden
      className="inline-grid h-4 w-4 grid-cols-3 items-end gap-0.5 rounded-[3px] bg-ctp-surface0 p-0.5"
    >
      <span className="h-3 rounded-sm bg-ctp-mauve" />
      <span className="h-2 rounded-sm bg-ctp-blue" />
      <span className="h-2.5 rounded-sm bg-ctp-teal" />
    </span>
  );
}

export function DashboardShell({
  children,
  headerActions,
}: DashboardShellProps) {
  const pathname = usePathname();
  const breadcrumbs = toBreadcrumbs(pathname);

  return (
    <div className="min-h-[100dvh] bg-ctp-base text-ctp-text">
      <header className="sticky top-0 z-20 border-b border-ctp-surface0/80 bg-ctp-mantle/85 backdrop-blur">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6">
          <div className="flex h-14 items-center gap-4">
            <Link
              href="/workspaces"
              className="inline-flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-sm font-semibold tracking-tight text-ctp-text transition-colors hover:text-ctp-lavender"
            >
              <HonchoMark />
              <span className="truncate">Honcho Dashboard</span>
            </Link>

            {headerActions ? (
              <div className="ml-auto shrink-0">{headerActions}</div>
            ) : null}
          </div>

          <div className="flex min-h-11 items-center border-t border-ctp-surface0/80 py-2">
            <div className="min-w-0 flex-1">
              {breadcrumbs.length > 0 ? (
                <Breadcrumbs items={breadcrumbs} />
              ) : (
                <div
                  aria-hidden
                  className="h-5 w-full max-w-56 rounded bg-ctp-surface0/80"
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
