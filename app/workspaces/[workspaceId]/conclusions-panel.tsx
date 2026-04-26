"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { metadataButtonClass } from "@/components/ui/button-styles";
import { CopyIdButton } from "@/components/ui/copy-id-button";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { TablePager, TableRefreshButton } from "@/components/ui/table-controls";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { usePagination } from "@/hooks/use-pagination";
import { getApiErrorMessage } from "@/lib/api-client";
import { ConclusionsControls, type QueryUpdates } from "./conclusions-controls";

type ConclusionItem = {
  id: string;
  content: string;
  observerId: string;
  observedId: string;
  sessionId: string | null;
  createdAt: string;
};

type ConclusionsData = {
  items: ConclusionItem[];
  page: number;
  pages: number;
  size: number;
  total: number;
};

type ConclusionsQuery = {
  page: number;
  reverse: boolean;
  observerId?: string;
  observedId?: string;
  sessionId?: string;
};

type ConclusionsPanelProps = {
  workspaceId: string;
  peerIds: string[];
  sessionIds: string[];
  initialQuery: ConclusionsQuery;
  initialConclusions: ConclusionsData;
};

function buildConclusionsApiUrl(
  workspaceId: string,
  query: ConclusionsQuery,
  size: number,
  refreshNonce = 0,
) {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("size", String(size));
  params.set("reverse", String(query.reverse));
  if (refreshNonce > 0) params.set("refresh", String(refreshNonce));

  if (query.observerId) params.set("observer_id", query.observerId);
  if (query.observedId) params.set("observed_id", query.observedId);
  if (query.sessionId) params.set("session_id", query.sessionId);

  return `/api/workspaces/${encodeURIComponent(workspaceId)}/conclusions?${params.toString()}`;
}

const deleteConclusionButtonClass =
  "ml-auto inline-flex h-6 w-6 items-center justify-center text-ctp-red/60 transition-colors hover:text-ctp-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:text-ctp-overlay0";

type ConclusionListItemProps = {
  conclusion: ConclusionItem;
  copiedId: string | null;
  isDeleting: boolean;
  onCopyId: (id: string) => void;
  onDelete: (id: string) => void;
  onFilterObserver: (observerId: string) => void;
  onFilterObserved: (observedId: string) => void;
  onFilterSession: (sessionId: string) => void;
};

function ConclusionListItem({
  conclusion,
  copiedId,
  isDeleting,
  onCopyId,
  onDelete,
  onFilterObserver,
  onFilterObserved,
  onFilterSession,
}: ConclusionListItemProps) {
  return (
    <li className="border-2 border-[var(--pixel-border)] bg-ctp-crust p-4 shadow-[var(--pixel-shadow-md)] transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ctp-subtext0">
          <button
            type="button"
            onClick={() => {
              onFilterObserver(conclusion.observerId);
            }}
            className={metadataButtonClass}
          >
            <span className="font-semibold uppercase tracking-[0.1em] text-ctp-subtext1">
              Observer
            </span>
            <span className="font-mono">{conclusion.observerId}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onFilterObserved(conclusion.observedId);
            }}
            className={metadataButtonClass}
          >
            <span className="font-semibold uppercase tracking-[0.1em] text-ctp-subtext1">
              Observed
            </span>
            <span className="font-mono">{conclusion.observedId}</span>
          </button>

          {conclusion.sessionId ? (
            <button
              type="button"
              onClick={() => {
                const { sessionId } = conclusion;
                if (!sessionId) {
                  return;
                }

                onFilterSession(sessionId);
              }}
              className={metadataButtonClass}
            >
              <span className="font-semibold uppercase tracking-[0.1em] text-ctp-subtext1">
                Session
              </span>
              <span className="font-mono">{conclusion.sessionId}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 border border-[var(--pixel-border)] bg-ctp-base px-2 py-1 shadow-[var(--pixel-shadow-sm)]">
              <span className="font-semibold uppercase tracking-[0.1em] text-ctp-subtext1">
                Session
              </span>
              <span className="font-mono">—</span>
            </span>
          )}
        </div>

        <RelativeTime
          value={conclusion.createdAt}
          className="text-[11px] text-ctp-subtext0"
        />
      </div>

      <div className="mt-3 min-w-0 max-w-full overflow-hidden border-2 border-[var(--pixel-border)] bg-ctp-base px-3 py-2.5 shadow-[var(--pixel-shadow-sm)]">
        <p className="min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-6 text-ctp-text">
          {conclusion.content || "—"}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t-2 border-[var(--pixel-border)] pt-3 text-[11px] text-ctp-subtext0">
        <CopyIdButton
          id={conclusion.id}
          copiedId={copiedId}
          onCopy={onCopyId}
        />

        <button
          type="button"
          onClick={() => {
            onDelete(conclusion.id);
          }}
          disabled={isDeleting}
          className={deleteConclusionButtonClass}
          aria-label={isDeleting ? "Deleting conclusion" : "Delete conclusion"}
          title={isDeleting ? "Deleting conclusion" : "Delete conclusion"}
        >
          <i aria-hidden className="hn hn-trash text-[12px] leading-none" />
        </button>
      </div>
    </li>
  );
}

export function ConclusionsPanel({
  workspaceId,
  peerIds,
  sessionIds,
  initialQuery,
  initialConclusions,
}: ConclusionsPanelProps) {
  const [query, setQuery] = useState<ConclusionsQuery>(initialQuery);
  const [conclusions, setConclusions] =
    useState<ConclusionsData>(initialConclusions);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingConclusionId, setDeletingConclusionId] = useState<
    string | null
  >(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const isFirstRender = useRef(true);
  const requestId = useRef(0);
  const { copiedId, copyToClipboard } = useClipboard();
  const pagination = usePagination(setQuery, conclusions.pages);
  const pageSize = conclusions.size || 10;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;

    const abortController = new AbortController();

    const fetchConclusions = async () => {
      setIsPending(true);

      try {
        const response = await fetch(
          buildConclusionsApiUrl(workspaceId, query, pageSize, refreshNonce),
          {
            cache: "no-store",
            signal: abortController.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(
              response,
              `Failed to load conclusions (${response.status}).`,
            ),
          );
        }

        const data = (await response.json()) as ConclusionsData;
        if (requestId.current !== currentRequestId) {
          return;
        }

        setConclusions(data);
        setError(null);
      } catch (fetchError) {
        if (abortController.signal.aborted) {
          return;
        }

        if (requestId.current !== currentRequestId) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load conclusions.";
        setError(message);
      } finally {
        if (requestId.current === currentRequestId) {
          setIsPending(false);
        }
      }
    };

    void fetchConclusions();

    return () => {
      abortController.abort();
    };
  }, [pageSize, query, refreshNonce, workspaceId]);

  const updateQuery = (updates: QueryUpdates, resetPage = true) => {
    setQuery((previous) => {
      const next: ConclusionsQuery = {
        ...previous,
      };

      if (Object.hasOwn(updates, "observer_id")) {
        next.observerId = updates.observer_id?.trim() || undefined;
      }

      if (Object.hasOwn(updates, "observed_id")) {
        next.observedId = updates.observed_id?.trim() || undefined;
      }

      if (Object.hasOwn(updates, "session_id")) {
        next.sessionId = updates.session_id?.trim() || undefined;
      }

      if (Object.hasOwn(updates, "reverse") && updates.reverse) {
        next.reverse = updates.reverse === "true";
      }

      if (resetPage) {
        next.page = 1;
      }

      return next;
    });
  };

  const copyIdToClipboard = async (id: string) => {
    const didCopy = await copyToClipboard(id);
    if (!didCopy) {
      setError("Could not copy conclusion ID.");
    }
  };

  const deleteConclusion = async (conclusionId: string) => {
    if (deletingConclusionId) {
      return;
    }

    setDeletingConclusionId(conclusionId);
    setError(null);

    try {
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/conclusions/${encodeURIComponent(conclusionId)}`,
        {
          method: "DELETE",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Failed to delete conclusion (${response.status}).`,
          ),
        );
      }

      setConclusions((previous) => ({
        ...previous,
        items: previous.items.filter((item) => item.id !== conclusionId),
        total: Math.max(0, previous.total - 1),
      }));
      setRefreshNonce((previous) => previous + 1);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete conclusion.",
      );
    } finally {
      setDeletingConclusionId(null);
    }
  };

  const refreshConclusions = useCallback(() => {
    if (isPending) {
      return;
    }

    setRefreshNonce((previous) => previous + 1);
  }, [isPending]);

  usePageRefreshSignal(refreshConclusions);

  const filterByObserver = (observerId: string) => {
    updateQuery({ observer_id: observerId }, true);
  };

  const filterByObserved = (observedId: string) => {
    updateQuery({ observed_id: observedId }, true);
  };

  const filterBySession = (sessionId: string) => {
    updateQuery({ session_id: sessionId }, true);
  };

  return (
    <section className="flex min-h-0 flex-col gap-2 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-ctp-subtext0">
          Conclusions ({conclusions.total})
        </h2>

        <div className="flex items-center gap-2">
          <TableRefreshButton
            isPending={isPending}
            onRefresh={refreshConclusions}
            label="Refresh conclusions"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-2 border-[var(--pixel-border)] bg-ctp-mantle shadow-[var(--pixel-shadow-md)]">
        <div className="space-y-3 border-b-2 border-[var(--pixel-border)] p-4 sm:px-6">
          <ConclusionsControls
            peerIds={peerIds}
            sessionIds={sessionIds}
            observerId={query.observerId}
            observedId={query.observedId}
            sessionId={query.sessionId}
            reverse={query.reverse}
            isPending={isPending}
            onChange={updateQuery}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
          {conclusions.items.length === 0 ? (
            <EmptyState
              title="No conclusions"
              description="No conclusions matched the current filters."
              className="m-4 sm:mx-6"
            />
          ) : (
            <ul className="space-y-3 p-4 sm:px-6 sm:py-4">
              {conclusions.items.map((conclusion) => (
                <ConclusionListItem
                  key={conclusion.id}
                  conclusion={conclusion}
                  copiedId={copiedId}
                  isDeleting={deletingConclusionId === conclusion.id}
                  onCopyId={(id) => {
                    void copyIdToClipboard(id);
                  }}
                  onDelete={(id) => {
                    void deleteConclusion(id);
                  }}
                  onFilterObserver={filterByObserver}
                  onFilterObserved={filterByObserved}
                  onFilterSession={filterBySession}
                />
              ))}
            </ul>
          )}
        </div>

        <TablePager
          page={query.page}
          pages={conclusions.pages}
          size={pageSize}
          total={conclusions.total}
          isPending={isPending}
          onFirst={pagination.onFirst}
          onPrevious={pagination.onPrevious}
          onNext={pagination.onNext}
          onLast={pagination.onLast}
        />
      </div>

      {error ? <p className="text-xs text-ctp-red">{error}</p> : null}
    </section>
  );
}
