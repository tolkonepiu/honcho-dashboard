import { usePageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type UsePaginatedFetchOptions<TData> = {
  entityName: string;
  buildUrl: (refreshNonce: number) => string;
  setData: Dispatch<SetStateAction<TData>>;
};

type UsePaginatedFetchResult = {
  isPending: boolean;
  error: string | null;
  refresh: () => void;
};

export function usePaginatedFetch<TData>({
  entityName,
  buildUrl,
  setData,
}: UsePaginatedFetchOptions<TData>): UsePaginatedFetchResult {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const isFirstRenderRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    const abortController = new AbortController();

    const runFetch = async () => {
      setIsPending(true);

      try {
        const response = await fetch(buildUrl(refreshNonce), {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(
              response,
              `Failed to load ${entityName} (${response.status}).`,
            ),
          );
        }

        const data = (await response.json()) as TData;
        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        setData(data);
        setError(null);
      } catch (fetchError) {
        if (
          abortController.signal.aborted ||
          requestIdRef.current !== currentRequestId
        ) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : `Failed to load ${entityName}.`;
        setError(message);
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsPending(false);
        }
      }
    };

    void runFetch();

    return () => {
      abortController.abort();
    };
  }, [buildUrl, entityName, refreshNonce, setData]);

  const refresh = useCallback(() => {
    if (isPending) {
      return;
    }

    setRefreshNonce((previous) => previous + 1);
  }, [isPending]);

  usePageRefreshSignal(refresh);

  return {
    isPending,
    error,
    refresh,
  };
}
