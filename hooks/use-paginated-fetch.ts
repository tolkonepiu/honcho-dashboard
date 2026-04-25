import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { getApiErrorMessage } from "@/lib/api-client";
import { usePageRefreshSignal } from "@/hooks/use-page-refresh-signal";

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
  const isFirstRender = useRef(true);
  const requestId = useRef(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
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
        if (requestId.current !== currentRequestId) {
          return;
        }

        setData(data);
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
            : `Failed to load ${entityName}.`;
        setError(message);
      } finally {
        if (requestId.current === currentRequestId) {
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
