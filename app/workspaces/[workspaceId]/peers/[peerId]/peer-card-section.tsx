"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRefreshButton } from "@/components/ui/table-controls";
import { usePageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { getApiErrorMessage } from "@/lib/api-client";

type PeerCardSectionProps = {
  workspaceId: string;
  peerId: string;
  initialCard: string[] | null;
};

const cardActionButtonBaseClass =
  "inline-flex h-8 w-8 items-center justify-center border shadow-[var(--pixel-shadow-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:border-ctp-surface0 disabled:bg-ctp-mantle disabled:text-ctp-overlay0 disabled:shadow-none";

const neutralCardActionButtonClass = `${cardActionButtonBaseClass} border-[var(--pixel-border)] bg-ctp-crust text-ctp-subtext0 hover:bg-ctp-surface0 hover:text-ctp-text`;

const editCardActionButtonClass =
  "inline-flex h-8 w-8 items-center justify-center text-ctp-subtext0 transition-colors hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:text-ctp-overlay0";

const acceptCardActionButtonClass = `${cardActionButtonBaseClass} border-ctp-green/70 bg-ctp-green/20 text-ctp-green hover:bg-ctp-green/30`;

function formatCardText(card: string[] | null): string {
  return (card ?? []).join("\n");
}

function parseCardText(value: string): string[] | null {
  const entries = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return entries.length > 0 ? entries : null;
}

export function PeerCardSection({
  workspaceId,
  peerId,
  initialCard,
}: PeerCardSectionProps) {
  const [card, setCard] = useState(initialCard);
  const [draftCardText, setDraftCardText] = useState(() =>
    formatCardText(initialCard),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isBusy = isRefreshing || isSaving;

  const resizeDraftTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const refreshCard = useCallback(async () => {
    if (isBusy || isEditing) {
      return;
    }

    setIsRefreshing(true);

    try {
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/peers/${encodeURIComponent(peerId)}/card`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Failed to refresh peer card (${response.status}).`,
          ),
        );
      }

      const data = (await response.json()) as string[] | null;
      setCard(data);
      setDraftCardText(formatCardText(data));
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to refresh peer card.";
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, [isBusy, isEditing, peerId, workspaceId]);

  const acceptDraftCard = useCallback(async () => {
    if (!isEditing || isBusy) {
      return;
    }

    setIsSaving(true);

    try {
      const nextCard = parseCardText(draftCardText);
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/peers/${encodeURIComponent(peerId)}/card`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ peer_card: nextCard }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Failed to update peer card (${response.status}).`,
          ),
        );
      }

      const data = (await response.json()) as string[] | null;
      setCard(data);
      setDraftCardText(formatCardText(data));
      setIsEditing(false);
      setError(null);
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to update peer card.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [draftCardText, isBusy, isEditing, peerId, workspaceId]);

  usePageRefreshSignal(() => {
    void refreshCard();
  });

  useEffect(() => {
    if (!isEditing || !cardTextareaRef.current) {
      return;
    }

    resizeDraftTextarea(cardTextareaRef.current);
  }, [isEditing, resizeDraftTextarea]);

  const hasCardEntries = (card?.length ?? 0) > 0;
  const readCardText = formatCardText(card);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-ctp-subtext0">
          Peer Card
        </h2>

        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  void acceptDraftCard();
                }}
                disabled={isBusy}
                className={acceptCardActionButtonClass}
                aria-label={isSaving ? "Saving peer card" : "Accept peer card"}
                title={isSaving ? "Saving peer card" : "Accept peer card"}
              >
                <i aria-hidden className="hn hn-check-solid text-[14px] leading-none" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDraftCardText(formatCardText(card));
                  setIsEditing(false);
                  setError(null);
                }}
                disabled={isBusy}
                className={neutralCardActionButtonClass}
                aria-label="Cancel editing peer card"
                title="Cancel editing peer card"
              >
                <i aria-hidden className="hn hn-times-solid text-[14px] leading-none" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setDraftCardText(formatCardText(card));
                  setIsEditing(true);
                  setError(null);
                }}
                disabled={isBusy}
                className={editCardActionButtonClass}
                aria-label="Edit peer card"
                title="Edit peer card"
              >
                <i aria-hidden className="hn hn-pencil-solid text-[14px] leading-none" />
              </button>

              <TableRefreshButton
                isPending={isRefreshing}
                onRefresh={() => {
                  void refreshCard();
                }}
                label="Refresh peer card"
              />
            </>
          )}
        </div>
      </div>

      {!isEditing && !hasCardEntries ? (
        <EmptyState
          title="No peer card"
          description="This peer has no card entries yet."
        />
      ) : (
        <div
          className={`overflow-hidden border-2 border-[var(--pixel-border)] bg-ctp-mantle shadow-[var(--pixel-shadow-md)] ${
            isEditing
              ? "focus-within:border-ctp-lavender focus-within:ring-2 focus-within:ring-ctp-lavender/70 focus-within:ring-offset-1 focus-within:ring-offset-ctp-mantle"
              : ""
          }`}
        >
          {isEditing ? (
            <textarea
              ref={cardTextareaRef}
              value={draftCardText}
              onChange={(event) => {
                setDraftCardText(event.target.value);
                resizeDraftTextarea(event.currentTarget);
              }}
              disabled={isBusy}
              className="block min-h-44 w-full resize-y border-0 bg-transparent px-4 py-3 text-sm leading-6 text-ctp-text outline-none placeholder:text-ctp-overlay0 sm:px-5"
              placeholder="Enter peer card content"
              aria-label="Edit peer card"
            />
          ) : (
            <p className="px-4 py-3 break-normal hyphens-none whitespace-pre-wrap text-sm leading-6 text-ctp-text sm:px-5">
              {readCardText || "—"}
            </p>
          )}
        </div>
      )}

      {error ? <p className="text-xs text-ctp-red">{error}</p> : null}
    </section>
  );
}
