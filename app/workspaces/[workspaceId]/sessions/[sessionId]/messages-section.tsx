"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CopyIdButton } from "@/components/ui/copy-id-button";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { SelectField } from "@/components/ui/select-field";
import { TablePager, TableRefreshButton } from "@/components/ui/table-controls";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { usePagination } from "@/hooks/use-pagination";
import { getApiErrorMessage } from "@/lib/api-client";

type MessageItem = {
  id: string;
  content: string;
  peerId: string;
  createdAt: string;
  tokenCount: number;
};

type PaginatedMessagesData = {
  items: MessageItem[];
  page: number;
  pages: number;
  size: number;
  total: number;
};

type MessagesSectionProps = {
  workspaceId: string;
  sessionId: string;
  peerIds: string[];
  initialMessages: PaginatedMessagesData;
};

type MessagesQuery = {
  page: number;
  reverse: boolean;
  peerId?: string;
};

function ensureCurrentOption(options: string[], currentValue?: string) {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

function getPeerInitial(peerId: string) {
  const [firstToken] = peerId.trim().split(/\s+/);
  return (firstToken?.[0] ?? "?").toUpperCase();
}

function buildPeerDirectionMap(
  messages: MessageItem[],
  peerIds: string[],
  selectedPeerId?: string,
) {
  const directions = new Map<string, "left" | "right">();

  const orderedPeerIds = selectedPeerId
    ? [selectedPeerId]
    : Array.from(new Set(peerIds)).sort((left, right) =>
        left.localeCompare(right),
      );

  for (const [index, peerId] of orderedPeerIds.entries()) {
    directions.set(peerId, index % 2 === 0 ? "left" : "right");
  }

  for (const message of messages) {
    if (!directions.has(message.peerId)) {
      directions.set(
        message.peerId,
        directions.size % 2 === 0 ? "left" : "right",
      );
    }
  }

  return directions;
}

type MessageListItemProps = {
  message: MessageItem;
  isRight: boolean;
  copiedId: string | null;
  onCopyId: (id: string) => void;
  onFilterPeer: (peerId: string) => void;
};

function MessageListItem({
  message,
  isRight,
  copiedId,
  onCopyId,
  onFilterPeer,
}: MessageListItemProps) {
  return (
    <li className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <article className="w-full max-w-4xl">
        <div
          className={`flex items-start gap-2 ${isRight ? "flex-row-reverse" : ""}`}
        >
          <span
            aria-hidden
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ctp-surface1 bg-ctp-base text-[11px] font-semibold text-ctp-subtext1"
          >
            {getPeerInitial(message.peerId)}
          </span>

          <div
            className={`flex min-w-0 flex-1 flex-col space-y-2 ${isRight ? "items-end" : "items-start"}`}
          >
            <div
              className={`flex w-full flex-wrap items-center gap-x-2 gap-y-1 ${isRight ? "justify-end" : "justify-start"}`}
            >
              <button
                type="button"
                onClick={() => {
                  onFilterPeer(message.peerId);
                }}
                className="rounded-sm text-sm font-semibold text-ctp-text transition-colors hover:text-ctp-lavender hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle"
              >
                {message.peerId}
              </button>

              <RelativeTime
                value={message.createdAt}
                className="text-xs text-ctp-subtext0"
              />
            </div>

            <div
              className={`w-full max-w-3xl rounded-2xl border px-4 py-3 shadow-sm ${
                isRight
                  ? "rounded-tr-sm border-ctp-surface1 bg-ctp-surface0/50"
                  : "rounded-tl-sm border-ctp-surface0 bg-ctp-crust/90"
              }`}
            >
              <p className="break-words whitespace-pre-wrap text-sm leading-6 text-ctp-text">
                {message.content || "—"}
              </p>
            </div>

            <div
              className={`flex w-full max-w-3xl flex-wrap items-center gap-2 text-[11px] text-ctp-subtext0 ${
                isRight ? "justify-end" : "justify-start"
              }`}
            >
              <CopyIdButton
                id={message.id}
                copiedId={copiedId}
                onCopy={onCopyId}
              />

              <span className="inline-flex items-center gap-1 rounded-md border border-ctp-surface0/70 px-2 py-1">
                <span className="font-medium text-ctp-subtext1">Tokens</span>
                <span className="font-mono text-ctp-subtext0">
                  {message.tokenCount}
                </span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}

export function MessagesSection({
  workspaceId,
  sessionId,
  peerIds,
  initialMessages,
}: MessagesSectionProps) {
  const [query, setQuery] = useState<MessagesQuery>({
    page: initialMessages.page,
    reverse: true,
  });
  const [messages, setMessages] = useState(initialMessages);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const isFirstRender = useRef(true);
  const requestId = useRef(0);
  const { copiedId, copyToClipboard } = useClipboard();
  const pageSize = initialMessages.size || 10;
  const pagination = usePagination(setQuery, messages.pages);

  const peerDirectionMap = useMemo(() => {
    return buildPeerDirectionMap(messages.items, peerIds, query.peerId);
  }, [messages.items, peerIds, query.peerId]);

  const peerOptions = useMemo(
    () =>
      ensureCurrentOption(Array.from(new Set(peerIds)).sort(), query.peerId),
    [peerIds, query.peerId],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    const abortController = new AbortController();

    const fetchMessages = async () => {
      setIsPending(true);

      try {
        const params = new URLSearchParams();
        params.set("page", String(query.page));
        params.set("size", String(pageSize));
        params.set("reverse", String(query.reverse));
        if (refreshNonce > 0) {
          params.set("refresh", String(refreshNonce));
        }

        if (query.peerId) {
          params.set("filters", JSON.stringify({ peer_id: query.peerId }));
        }

        const response = await fetch(
          `/api/workspaces/${encodeURIComponent(workspaceId)}/sessions/${encodeURIComponent(sessionId)}/messages?${params.toString()}`,
          {
            cache: "no-store",
            signal: abortController.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(
              response,
              `Failed to load messages (${response.status}).`,
            ),
          );
        }

        const data = (await response.json()) as PaginatedMessagesData;
        if (requestId.current !== currentRequestId) {
          return;
        }

        setMessages(data);
        setError(null);
      } catch (fetchError) {
        if (
          abortController.signal.aborted ||
          requestId.current !== currentRequestId
        ) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load messages.";
        setError(message);
      } finally {
        if (requestId.current === currentRequestId) {
          setIsPending(false);
        }
      }
    };

    void fetchMessages();

    return () => {
      abortController.abort();
    };
  }, [pageSize, query, refreshNonce, sessionId, workspaceId]);

  const refreshMessages = useCallback(() => {
    if (isPending) {
      return;
    }

    setRefreshNonce((previous) => previous + 1);
  }, [isPending]);

  usePageRefreshSignal(refreshMessages);

  const copyMessageId = async (id: string) => {
    const didCopy = await copyToClipboard(id);
    if (!didCopy) {
      setError("Could not copy message ID.");
    }
  };

  const filterByPeer = (peerId: string) => {
    setQuery((previous) => ({
      ...previous,
      page: 1,
      peerId,
    }));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ctp-subtext0">
          Messages ({messages.total})
        </h2>

        <TableRefreshButton
          isPending={isPending}
          onRefresh={refreshMessages}
          label="Refresh messages"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-ctp-surface0 bg-ctp-mantle shadow-sm">
        <div className="space-y-3 border-b border-ctp-surface0 p-4 sm:px-6">
          <div aria-busy={isPending} className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Peer filter"
              value={query.peerId ?? ""}
              onChange={(event) =>
                setQuery((previous) => ({
                  ...previous,
                  page: 1,
                  peerId: event.target.value || undefined,
                }))
              }
            >
              <option value="">All peers</option>
              {peerOptions.map((peerId) => (
                <option key={peerId} value={peerId}>
                  {peerId}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Sort"
              value={String(query.reverse)}
              onChange={(event) =>
                setQuery((previous) => ({
                  ...previous,
                  page: 1,
                  reverse: event.target.value === "true",
                }))
              }
            >
              <option value="true">Newest</option>
              <option value="false">Oldest</option>
            </SelectField>
          </div>
        </div>

        <div className="space-y-3 p-4 sm:px-6" aria-live="polite">
          {messages.items.length === 0 ? (
            <EmptyState
              title="No messages"
              description="No messages matched the current filters."
              className="py-8"
            />
          ) : (
            <ol className="space-y-4">
              {messages.items.map((message) => {
                const direction =
                  peerDirectionMap.get(message.peerId) ?? "left";
                return (
                  <MessageListItem
                    key={message.id}
                    message={message}
                    isRight={direction === "right"}
                    copiedId={copiedId}
                    onCopyId={(id) => {
                      void copyMessageId(id);
                    }}
                    onFilterPeer={filterByPeer}
                  />
                );
              })}
            </ol>
          )}
        </div>

        <TablePager
          page={query.page}
          pages={messages.pages}
          size={pageSize}
          total={messages.total}
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
