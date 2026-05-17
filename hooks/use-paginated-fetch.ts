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
  refresh: () => Promise<void>;
};

export function usePaginatedFetch<TData>({
  entityName,
  buildUrl,
  setData,
}: UsePaginatedFetchOptions<TData>): UsePaginatedFetchResult {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstRenderRef = useRef(true);
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingPromiseRef = useRef<Promise<void> | null>(null);

  const runFetch = useCallback(
    (refreshNonce: number) => {
      if (pendingPromiseRef.current) {
        return pendingPromiseRef.current;
      }

      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const pendingPromise = (async () => {
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

          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null;
          }

          if (requestIdRef.current === currentRequestId) {
            pendingPromiseRef.current = null;
          }
        }
      })();

      pendingPromiseRef.current = pendingPromise;

      return pendingPromise;
    },
    [buildUrl, entityName, setData],
  );

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    void runFetch(0);

    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      pendingPromiseRef.current = null;
    };
  }, [runFetch]);

  const refresh = useCallback(() => {
    return runFetch(Date.now());
  }, [runFetch]);

  usePageRefreshSignal(refresh);

  return {
    isPending,
    error,
    refresh,
  };
}
