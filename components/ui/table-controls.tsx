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
  "inline-flex h-8 w-8 items-center justify-center text-ctp-subtext0 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:text-ctp-overlay0";

const pagerButtonClass =
  "inline-flex h-8 min-w-8 items-center justify-center border px-2 py-1 font-medium shadow-[var(--pixel-shadow-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle";

function RefreshIcon({ isPending }: { isPending: boolean }) {
  return (
    <i
      aria-hidden
      className={`hn hn-refresh text-[14px] leading-none ${isPending ? "animate-spin" : ""}`}
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
    return "border-[var(--pixel-border)] bg-ctp-crust text-ctp-text hover:bg-ctp-surface0";
  }

  return "border-ctp-surface0 bg-ctp-mantle text-ctp-overlay0 shadow-none";
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
    <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[var(--pixel-border)] bg-ctp-base px-4 py-3 text-xs uppercase tracking-[0.04em] text-ctp-subtext0 sm:px-6">
      <p>
        {pageRange} of {total}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onFirst}
          disabled={!canPageBack || isPending}
          className={`${pagerButtonClass} ${getPagerButtonStateClass(canPageBack, isPending)}`}
          aria-label="First page"
        >
          <i
            aria-hidden
            className="hn hn-angle-left-solid text-[14px] leading-none"
          />
        </button>

        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPageBack || isPending}
          className={`${pagerButtonClass} ${getPagerButtonStateClass(canPageBack, isPending)}`}
          aria-label="Previous page"
        >
          <i
            aria-hidden
            className="hn hn-arrow-left-solid text-[14px] leading-none"
          />
        </button>

        <span className="inline-flex h-8 items-center border border-[var(--pixel-border)] bg-ctp-surface0 px-2.5 font-medium text-ctp-text shadow-[var(--pixel-shadow-sm)]">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!canPageForward || isPending}
          className={`${pagerButtonClass} ${getPagerButtonStateClass(canPageForward, isPending)}`}
          aria-label="Next page"
        >
          <i
            aria-hidden
            className="hn hn-arrow-right-solid text-[14px] leading-none"
          />
        </button>

        <button
          type="button"
          onClick={onLast}
          disabled={!canJumpToLast || isPending}
          className={`${pagerButtonClass} ${getPagerButtonStateClass(canJumpToLast, isPending)}`}
          aria-label="Last page"
        >
          <i
            aria-hidden
            className="hn hn-angle-right-solid text-[14px] leading-none"
          />
        </button>
      </div>
    </div>
  );
}
