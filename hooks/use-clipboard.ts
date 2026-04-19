import { useCallback, useEffect, useRef, useState } from "react";

type UseClipboardResult = {
  copiedId: string | null;
  copyToClipboard: (id: string) => Promise<boolean>;
};

export function useClipboard(resetAfterMs = 1200): UseClipboardResult {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    },
    [],
  );

  const copyToClipboard = useCallback(
    async (id: string) => {
      try {
        await navigator.clipboard.writeText(id);
        setCopiedId(id);

        if (resetTimeoutRef.current !== null) {
          window.clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = window.setTimeout(() => {
          setCopiedId(null);
        }, resetAfterMs);

        return true;
      } catch {
        return false;
      }
    },
    [resetAfterMs],
  );

  return {
    copiedId,
    copyToClipboard,
  };
}
