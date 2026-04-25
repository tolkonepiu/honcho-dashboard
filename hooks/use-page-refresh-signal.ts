import { useEffect } from "react";

const pageRefreshEventName = "honcho:page-refresh";

export function dispatchPageRefreshSignal() {
  window.dispatchEvent(new Event(pageRefreshEventName));
}

export function usePageRefreshSignal(onRefresh: () => void) {
  useEffect(() => {
    const handlePageRefresh = () => {
      onRefresh();
    };

    window.addEventListener(pageRefreshEventName, handlePageRefresh);

    return () => {
      window.removeEventListener(pageRefreshEventName, handlePageRefresh);
    };
  }, [onRefresh]);
}
