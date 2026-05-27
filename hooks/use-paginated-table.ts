import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { usePagination } from "@/hooks/use-pagination";
import type { PaginatedResult } from "@/lib/dashboard-types";
import { useCallback, useState } from "react";

type UsePaginatedTableOptions<TItem, TData extends PaginatedResult<TItem>> = {
  initialData: TData;
  apiPath: string;
  entityName: string;
};

export function usePaginatedTable<TItem, TData extends PaginatedResult<TItem>>({
  initialData,
  apiPath,
  entityName,
}: UsePaginatedTableOptions<TItem, TData>) {
  const [query, setQuery] = useState({ page: initialData.page });
  const [data, setData] = useState(initialData);
  const pageSize = data.size;
  const pagination = usePagination(setQuery, data.pages);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(query.page));
    params.set("size", String(pageSize));

    return `${apiPath}?${params.toString()}`;
  }, [apiPath, pageSize, query]);

  const { isPending, error, refresh } = usePaginatedFetch<TData>({
    entityName,
    buildUrl,
    setData,
  });

  return {
    data,
    query,
    pageSize,
    pagination,
    isPending,
    error,
    refresh,
  };
}
