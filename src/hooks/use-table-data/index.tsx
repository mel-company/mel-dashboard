import { useEffect, useRef, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { PageType } from '@/utils/pages';
import axiosInstance from '@/utils/AxiosInstance';

export interface UseTableDataParams {
  page: PageType;
  search?: string;
  filters?: Record<string, any>;
  limit?: number;
  enabled?: boolean;
  forceRefetch?: boolean;
}

export interface UseTableDataReturn<T> {
  data: T[];
  imageBaseUrl: string;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  totalItems: number;
}

/**
 * Normalizes filters for API - removes empty arrays and undefined values
 */
function normalizeFilters(filters: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'string' && value.trim() === '') continue;

    normalized[key] = value;
  }

  return normalized;
}

/**
 * Unified data fetching hook for table/list pages
 * Handles search, filters, and cursor-based pagination
 * Automatically normalizes filters based on page context
 * Uses React Query cache (same as old page wrappers)
 */
export function useTableData<T = any>({
  page,
  search,
  filters = {},
  limit = 10,
  enabled = true,
  forceRefetch = false,
}: UseTableDataParams): UseTableDataReturn<T> {
  const [debouncedSearch, setDebouncedSearch] = useState(search || '');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search || '');
    }, 350);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search]);

  // Normalize filters - remove empty values automatically
  const normalizedFilters = normalizeFilters(filters);

  // Prefer the dedicated search endpoint when the page declares one (customers,
  // tickets, …). Passing `?query=` to the list cursor alone often returns an
  // empty page, which looked like “العملاء ما يظهرون” after typing in search.
  const trimmedSearch = debouncedSearch.trim();
  const endpoint =
    trimmedSearch && page.searchApiEndpoint
      ? page.searchApiEndpoint
      : page.apiEndpoint;

  // Build query key
  const queryKey = [endpoint, 'list', { query: trimmedSearch, limit, ...normalizedFilters }];

  // Fetch data using React Query infinite query (same pattern as old page wrappers)
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = {
        ...(pageParam && { cursor: pageParam }),
        ...(trimmedSearch && { query: trimmedSearch }),
        ...(limit && { limit }),
        ...normalizedFilters,
      };

      const { data: result } = await axiosInstance.get(`/${endpoint}`, { params });

      return result;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    enabled: enabled && !!endpoint,
    staleTime: forceRefetch ? 0 : 5 * 60 * 1000, // 5 minutes cache
  });

  // Flatten data from all pages. Some list payloads use a named array
  // (`customers`) instead of `data` — accept both so a filled response never
  // paints as an empty state.
  const flattenedData: T[] =
    data?.pages.flatMap((pageResult) => {
      if (Array.isArray(pageResult?.data)) return pageResult.data;
      if (Array.isArray(pageResult?.customers)) return pageResult.customers;
      return [];
    }) ?? [];
  const totalItems = data?.pages[0]?.total ?? flattenedData.length;
  const imageBaseUrl = data?.pages?.[0]?.baseUrl ?? "";

  return {
    data: flattenedData,
    imageBaseUrl,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error: error as Error | null,
    refetch,
    fetchNextPage,
    totalItems,
  };
}

/**
 * Hook for managing intersection observer to auto-load more items
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 200,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: `${threshold}px`, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore, hasNextPage, isFetchingNextPage, threshold]);

  return loadMoreRef;
}
