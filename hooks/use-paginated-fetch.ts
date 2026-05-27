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
  buildUrl: () => string;
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

  const runFetch = useCallback(async () => {
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsPending(true);

    try {
      const response = await fetch(buildUrl(), {
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
    }
  }, [buildUrl, entityName, setData]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    void runFetch();

    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, [runFetch]);

  const refresh = useCallback(() => {
    return runFetch();
  }, [runFetch]);

  return {
    isPending,
    error,
    refresh,
  };
}
