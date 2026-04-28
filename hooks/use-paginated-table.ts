import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { usePagination } from "@/hooks/use-pagination";
import { useCallback, useState } from "react";

type PaginatedTableData<TItem> = {
  items: TItem[];
  page: number;
  pages: number;
  size: number;
  total: number;
};

type UsePaginatedTableOptions<
  TItem,
  TData extends PaginatedTableData<TItem>,
> = {
  initialData: TData;
  apiPath: string;
  entityName: string;
};

export function usePaginatedTable<
  TItem,
  TData extends PaginatedTableData<TItem>,
>({
  initialData,
  apiPath,
  entityName,
}: UsePaginatedTableOptions<TItem, TData>) {
  const [query, setQuery] = useState({ page: initialData.page });
  const [data, setData] = useState(initialData);
  const pageSize = data.size || 10;
  const pagination = usePagination(setQuery, data.pages);

  const buildUrl = useCallback(
    (refreshNonce: number) => {
      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("size", String(pageSize));
      if (refreshNonce > 0) {
        params.set("refresh", String(refreshNonce));
      }

      return `${apiPath}?${params.toString()}`;
    },
    [apiPath, pageSize, query],
  );

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

export type { PaginatedTableData };
