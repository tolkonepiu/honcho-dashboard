import { cn } from "@/lib/cn";

type TableRefreshButtonProps = {
  isPending: boolean;
  onRefresh: () => void;
  label: string;
};

type TablePagerProps = {
  page: number;
  pages: number;
  size: number;
  total: number;
  isPending: boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

const refreshButtonClass =
  "inline-flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_70%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:text-[var(--text-dim)]";

const pagerButtonClass =
  "inline-flex h-8 min-w-8 items-center justify-center border px-2 py-1 font-medium shadow-[var(--pixel-shadow-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_70%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-elevated)]";

function RefreshIcon({ isPending }: { isPending: boolean }) {
  return (
    <i
      aria-hidden
      className={cn("hn hn-refresh ui-icon-sm", isPending && "animate-spin")}
    />
  );
}

function getRangeLabel(page: number, size: number, total: number) {
  if (total === 0) {
    return "0–0";
  }

  const start = (page - 1) * size + 1;
  const end = Math.min(page * size, total);
  return `${start}–${end}`;
}

function getPagerButtonStateClass(isEnabled: boolean, isPending: boolean) {
  if (isEnabled && !isPending) {
    return "border-[var(--pixel-border)] bg-[var(--surface-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-interactive)]";
  }

  return "border-[var(--surface-border-muted)] bg-[var(--surface-elevated)] text-[var(--text-dim)] shadow-none";
}

export function TableRefreshButton({
  isPending,
  onRefresh,
  label,
}: TableRefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isPending}
      className={refreshButtonClass}
      aria-label={label}
      title={label}
    >
      <RefreshIcon isPending={isPending} />
    </button>
  );
}

export function TablePager({
  page,
  pages,
  size,
  total,
  isPending,
  onFirst,
  onPrevious,
  onNext,
  onLast,
}: TablePagerProps) {
  const canPageBack = page > 1;
  const canPageForward = pages > 0 && page < pages;
  const canJumpToLast = pages > 0 && page !== pages;
  const totalPages = Math.max(pages, 1);
  const pageRange = getRangeLabel(page, size, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[var(--pixel-border)] bg-[var(--surface-base)] px-4 py-3 text-xs tracking-[0.04em] text-[var(--text-muted)] uppercase sm:px-6">
      <p>
        {pageRange} of {total}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onFirst}
          disabled={!canPageBack || isPending}
          className={cn(
            pagerButtonClass,
            getPagerButtonStateClass(canPageBack, isPending),
          )}
          aria-label="First page"
        >
          <i aria-hidden className="hn hn-angle-left-solid ui-icon-sm" />
        </button>

        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPageBack || isPending}
          className={cn(
            pagerButtonClass,
            getPagerButtonStateClass(canPageBack, isPending),
          )}
          aria-label="Previous page"
        >
          <i aria-hidden className="hn hn-arrow-left-solid ui-icon-sm" />
        </button>

        <span className="inline-flex h-8 items-center border border-[var(--pixel-border)] bg-[var(--surface-interactive)] px-2.5 font-medium text-[var(--text-primary)] shadow-[var(--pixel-shadow-sm)]">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!canPageForward || isPending}
          className={cn(
            pagerButtonClass,
            getPagerButtonStateClass(canPageForward, isPending),
          )}
          aria-label="Next page"
        >
          <i aria-hidden className="hn hn-arrow-right-solid ui-icon-sm" />
        </button>

        <button
          type="button"
          onClick={onLast}
          disabled={!canJumpToLast || isPending}
          className={cn(
            pagerButtonClass,
            getPagerButtonStateClass(canJumpToLast, isPending),
          )}
          aria-label="Last page"
        >
          <i aria-hidden className="hn hn-angle-right-solid ui-icon-sm" />
        </button>
      </div>
    </div>
  );
}
