"use client";

import { useMemo } from "react";
import { SelectField } from "@/components/ui/select-field";

type ConclusionsControlsProps = {
  peerIds: string[];
  sessionIds: string[];
  observerId?: string;
  observedId?: string;
  sessionId?: string;
  reverse: boolean;
  isPending: boolean;
  onChange: (updates: QueryUpdates, resetPage?: boolean) => void;
};

export type QueryUpdates = {
  observer_id?: string;
  observed_id?: string;
  session_id?: string;
  reverse?: "true" | "false";
};

function ensureCurrentOption(options: string[], currentValue?: string) {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

export function ConclusionsControls({
  peerIds,
  sessionIds,
  observerId,
  observedId,
  sessionId,
  reverse,
  isPending,
  onChange,
}: ConclusionsControlsProps) {
  const observerOptions = useMemo(
    () => ensureCurrentOption(Array.from(new Set(peerIds)).sort(), observerId),
    [observerId, peerIds],
  );
  const observedOptions = useMemo(
    () => ensureCurrentOption(Array.from(new Set(peerIds)).sort(), observedId),
    [observedId, peerIds],
  );
  const sessionOptions = useMemo(
    () =>
      ensureCurrentOption(Array.from(new Set(sessionIds)).sort(), sessionId),
    [sessionId, sessionIds],
  );

  return (
    <div aria-busy={isPending} className="grid gap-3 sm:grid-cols-2">
      <SelectField
        label="Observer"
        value={observerId ?? ""}
        onChange={(event) =>
          onChange({ observer_id: event.target.value || undefined }, true)
        }
      >
        <option value="">All peers</option>
        {observerOptions.map((peerId) => (
          <option key={`observer-${peerId}`} value={peerId}>
            {peerId}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Observed"
        value={observedId ?? ""}
        onChange={(event) =>
          onChange({ observed_id: event.target.value || undefined }, true)
        }
      >
        <option value="">All peers</option>
        {observedOptions.map((peerId) => (
          <option key={`observed-${peerId}`} value={peerId}>
            {peerId}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Session"
        value={sessionId ?? ""}
        onChange={(event) =>
          onChange({ session_id: event.target.value || undefined }, true)
        }
      >
        <option value="">All sessions</option>
        {sessionOptions.map((currentSessionId) => (
          <option key={currentSessionId} value={currentSessionId}>
            {currentSessionId}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Sort"
        value={String(reverse)}
        onChange={(event) =>
          onChange(
            { reverse: event.target.value === "true" ? "true" : "false" },
            true,
          )
        }
      >
        <option value="false">Newest</option>
        <option value="true">Oldest</option>
      </SelectField>
    </div>
  );
}
