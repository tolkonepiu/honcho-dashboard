import { useEffect } from "react";

const pageRefreshEventName = "honcho:page-refresh";

type PageRefreshEventDetail = {
  addRefreshPromise: (promise: Promise<void>) => void;
};

type PageRefreshHandler = () => Promise<void> | void;

export function dispatchPageRefreshSignal() {
  const refreshPromises: Promise<void>[] = [];

  window.dispatchEvent(
    new CustomEvent<PageRefreshEventDetail>(pageRefreshEventName, {
      detail: {
        addRefreshPromise: (promise) => {
          refreshPromises.push(promise);
        },
      },
    }),
  );

  return Promise.allSettled(refreshPromises);
}

export function usePageRefreshSignal(onRefresh: PageRefreshHandler) {
  useEffect(() => {
    const handlePageRefresh = (event: Event) => {
      const refreshResult = onRefresh();

      if (refreshResult instanceof Promise) {
        (event as CustomEvent<PageRefreshEventDetail>).detail.addRefreshPromise(
          refreshResult,
        );
      }
    };

    window.addEventListener(pageRefreshEventName, handlePageRefresh);

    return () => {
      window.removeEventListener(pageRefreshEventName, handlePageRefresh);
    };
  }, [onRefresh]);
}
