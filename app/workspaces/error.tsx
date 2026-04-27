"use client";

import { subtleButtonClass } from "@/components/ui/button-styles";
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
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Something went wrong
      </h2>
      <p className="text-sm text-[var(--text-muted)]">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className={subtleButtonClass}
      >
        Try again
      </button>
    </div>
  );
}
