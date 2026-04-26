"use client";

import { useCallback, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRefreshButton } from "@/components/ui/table-controls";
import { usePageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { getApiErrorMessage } from "@/lib/api-client";

type PeerCardSectionProps = {
  workspaceId: string;
  peerId: string;
  initialCard: string[] | null;
};

function buildPeerCardItems(card: string[] | null) {
  const counts = new Map<string, number>();

  return (card ?? []).map((entry) => {
    const occurrence = (counts.get(entry) ?? 0) + 1;
    counts.set(entry, occurrence);

    return {
      key: `${entry}::${occurrence}`,
      value: entry,
    };
  });
}

export function PeerCardSection({
  workspaceId,
  peerId,
  initialCard,
}: PeerCardSectionProps) {
  const [card, setCard] = useState(initialCard);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCard = useCallback(async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

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
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to refresh peer card.";
      setError(message);
    } finally {
      setIsPending(false);
    }
  }, [isPending, peerId, workspaceId]);

  usePageRefreshSignal(() => {
    void refreshCard();
  });

  const cardItems = buildPeerCardItems(card);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-ctp-subtext0">
          Peer Card
        </h2>

        <TableRefreshButton
          isPending={isPending}
          onRefresh={() => {
            void refreshCard();
          }}
          label="Refresh peer card"
        />
      </div>

      {cardItems.length === 0 ? (
        <EmptyState
          title="No peer card"
          description="This peer has no card entries yet."
        />
      ) : (
        <div className="overflow-hidden border-2 border-[var(--pixel-border)] bg-ctp-mantle shadow-[var(--pixel-shadow-md)]">
          <ul className="divide-y divide-ctp-surface1">
            {cardItems.map((entry) => (
              <li key={entry.key} className="px-4 py-3 sm:px-5">
                <p className="break-normal hyphens-none whitespace-pre-wrap text-sm leading-6 text-ctp-text">
                  {entry.value || "—"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error ? <p className="text-xs text-ctp-red">{error}</p> : null}
    </section>
  );
}
