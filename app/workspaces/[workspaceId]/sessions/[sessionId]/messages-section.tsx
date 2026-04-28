"use client";

import { Badge } from "@/components/ui/badge";
import { CopyIdButton } from "@/components/ui/copy-id-button";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { SelectField } from "@/components/ui/select-field";
import { Surface } from "@/components/ui/surface";
import { TablePager, TableRefreshButton } from "@/components/ui/table-controls";
import { useClipboard } from "@/hooks/use-clipboard";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/cn";
import { useCallback, useMemo, useState } from "react";

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
    <li className={cn("flex", isRight ? "justify-end" : "justify-start")}>
      <article className="w-full max-w-4xl">
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col space-y-2",
            isRight ? "items-end" : "items-start",
          )}
        >
          <div
            className={cn(
              "flex w-full flex-wrap items-center gap-x-2 gap-y-1",
              isRight ? "justify-end" : "justify-start",
            )}
          >
            <button
              type="button"
              onClick={() => {
                onFilterPeer(message.peerId);
              }}
              className="ui-compact-label ui-compact-text inline-flex items-center px-0 py-0 text-left text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_70%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-elevated)] focus-visible:outline-none"
            >
              {message.peerId}
            </button>

            <RelativeTime
              value={message.createdAt}
              className="text-xs text-[var(--text-muted)]"
            />
          </div>

          <Surface
            variant={isRight ? "inset" : "subtle"}
            className="w-full max-w-3xl px-4 py-3"
          >
            <p className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--text-primary)]">
              {message.content || "—"}
            </p>
          </Surface>

          <div
            className={cn(
              "ui-compact-text flex w-full max-w-3xl flex-wrap items-center gap-2 text-[var(--text-muted)]",
              isRight ? "justify-end" : "justify-start",
            )}
          >
            <CopyIdButton
              id={message.id}
              copiedId={copiedId}
              onCopy={onCopyId}
            />

            <Badge>
              <span className="ui-compact-kicker font-medium">Tokens</span>
              <span className="font-mono text-[var(--text-muted)]">
                {message.tokenCount}
              </span>
            </Badge>
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
  const [actionError, setActionError] = useState<string | null>(null);
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

  const buildMessagesUrl = useCallback(
    (refreshNonce: number) => {
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

      return `/api/workspaces/${encodeURIComponent(workspaceId)}/sessions/${encodeURIComponent(sessionId)}/messages?${params.toString()}`;
    },
    [pageSize, query, sessionId, workspaceId],
  );

  const {
    isPending,
    error,
    refresh: refreshMessages,
  } = usePaginatedFetch<PaginatedMessagesData>({
    entityName: "messages",
    buildUrl: buildMessagesUrl,
    setData: setMessages,
  });

  const copyMessageId = async (id: string) => {
    setActionError(null);
    const didCopy = await copyToClipboard(id);
    if (!didCopy) {
      setActionError("Could not copy message ID.");
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
        <h2 className="ui-section-label">Messages ({messages.total})</h2>

        <TableRefreshButton
          isPending={isPending}
          onRefresh={refreshMessages}
          label="Refresh messages"
        />
      </div>

      <Surface className="overflow-hidden">
        <div className="space-y-3 border-b-2 border-[var(--pixel-border)] p-4 sm:px-6">
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
      </Surface>

      {(actionError ?? error) ? (
        <p className="text-xs text-[var(--color-danger)]">
          {actionError ?? error}
        </p>
      ) : null}
    </section>
  );
}
