import { type Dispatch, type SetStateAction, useCallback } from "react";

type PaginationQuery = {
  page: number;
};

type SetQuery<T extends PaginationQuery> = Dispatch<SetStateAction<T>>;

type UsePaginationResult = {
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

export function usePagination<T extends PaginationQuery>(
  setQuery: SetQuery<T>,
  pages: number,
): UsePaginationResult {
  const onFirst = useCallback(() => {
    setQuery((previous) => ({ ...previous, page: 1 }));
  }, [setQuery]);

  const onPrevious = useCallback(() => {
    setQuery((previous) => ({
      ...previous,
      page: Math.max(1, previous.page - 1),
    }));
  }, [setQuery]);

  const onNext = useCallback(() => {
    setQuery((previous) => ({
      ...previous,
      page: pages > 0 ? Math.min(previous.page + 1, pages) : previous.page,
    }));
  }, [pages, setQuery]);

  const onLast = useCallback(() => {
    setQuery((previous) => ({
      ...previous,
      page: pages > 0 ? pages : previous.page,
    }));
  }, [pages, setQuery]);

  return {
    onFirst,
    onPrevious,
    onNext,
    onLast,
  };
}
