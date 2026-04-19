"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-lg font-semibold text-ctp-text">
        Something went wrong
      </h2>
      <p className="text-sm text-ctp-subtext0">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="rounded-md border border-ctp-surface1 px-4 py-2 text-sm font-medium text-ctp-text transition-colors hover:bg-ctp-surface0"
      >
        Try again
      </button>
    </div>
  );
}
