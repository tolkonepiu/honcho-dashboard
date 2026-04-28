import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import "server-only";

type PageDataResult<T> =
  | { data: T; errorElement: null }
  | { data: null; errorElement: ReactElement };

export async function loadHonchoPageData<T>(
  loader: () => Promise<T>,
): Promise<PageDataResult<T>> {
  try {
    return {
      data: await loader(),
      errorElement: null,
    };
  } catch (error) {
    if (isHonchoAppError(error)) {
      return {
        data: null,
        errorElement: <HonchoErrorState message={error.message} />,
      };
    }

    throw error;
  }
}

export async function loadHonchoPageEntity<T>(
  loader: () => Promise<T | null>,
): Promise<PageDataResult<T>> {
  const result = await loadHonchoPageData(loader);

  if (result.errorElement) {
    return result;
  }

  if (result.data === null) {
    notFound();
  }

  return {
    data: result.data,
    errorElement: null,
  };
}
