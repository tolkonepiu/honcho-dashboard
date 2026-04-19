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
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-ctp-surface1 text-ctp-subtext0 transition-colors hover:bg-ctp-surface0 hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:border-ctp-surface0 disabled:text-ctp-overlay0";

const pagerButtonClass =
  "inline-flex min-w-8 items-center justify-center rounded-md border px-2 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle";

function RefreshIcon({ isPending }: { isPending: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
    >
      <title>Refresh</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 10a6 6 0 1 1-1.76-4.24"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v3.5h-3.5" />
    </svg>
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
    return "border-ctp-surface1 text-ctp-text hover:bg-ctp-surface0";
  }

  return "border-ctp-surface0 text-ctp-overlay0";
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
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ctp-surface0 px-4 py-3 text-xs text-ctp-subtext0 sm:px-6">
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
          {"<<"}
        </button>

        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPageBack || isPending}
          className={`${pagerButtonClass} ${getPagerButtonStateClass(canPageBack, isPending)}`}
          aria-label="Previous page"
        >
          {"<"}
        </button>

        <span className="rounded-md border border-ctp-surface0 px-2.5 py-1 font-medium text-ctp-text">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!canPageForward || isPending}
          className={`${pagerButtonClass} ${getPagerButtonStateClass(canPageForward, isPending)}`}
          aria-label="Next page"
        >
          {">"}
        </button>

        <button
          type="button"
          onClick={onLast}
          disabled={!canJumpToLast || isPending}
          className={`${pagerButtonClass} ${getPagerButtonStateClass(canJumpToLast, isPending)}`}
          aria-label="Last page"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
