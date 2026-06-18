import { useEffect, useRef, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { PageType } from '@/utils/pages';
import { getCachedData, setCachedData } from '@/store/db';

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
 * Generates a unique query key string for caching
 */
function generateQueryKey(endpoint: string, query: string, limit: number, filters: Record<string, any>): string {
  return JSON.stringify({ endpoint, query, limit, ...filters });
}

/**
 * Unified data fetching hook for table/list pages
 * Handles search, filters, and cursor-based pagination
 * Automatically normalizes filters based on page context
 * Uses IndexedDB cache with cache-first strategy
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

  // Build query key
  const queryKey = [page.apiEndpoint, 'list', { query: debouncedSearch, limit, ...normalizedFilters }];
  const queryKeyString = generateQueryKey(page.apiEndpoint, debouncedSearch, limit, normalizedFilters);

  // Fetch data using React Query infinite query with cache-first strategy
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
      const endpoint = page.apiEndpoint;

      // Check cache first (unless force refetch)
      if (!forceRefetch && !pageParam) {
        const cached = await getCachedData(endpoint, queryKeyString);
        if (cached) {
          return cached.data;
        }
      }

      // Fetch from API
      const baseUrl = import.meta.env.VITE_API_URL;
      const params = new URLSearchParams({
        ...(pageParam && { cursor: pageParam }),
        ...(debouncedSearch && { query: debouncedSearch }),
        ...(limit && { limit: String(limit) }),
        ...Object.entries(normalizedFilters).reduce((acc, [key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => acc.append(key, String(v)));
          } else {
            acc.set(key, String(value));
          }
          return acc;
        }, new URLSearchParams()),
      });

      const response = await fetch(`${baseUrl}/${endpoint}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${page.label}`);
      }
      const result = response.json();

      // Cache the result for first page
      if (!pageParam) {
        result.then((data: any) => {
          setCachedData(endpoint, queryKeyString, data, data.total, data.nextCursor);
        });
      }

      return result;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    enabled: enabled && !!page.apiEndpoint,
    staleTime: forceRefetch ? 0 : 5 * 60 * 1000, // 5 minutes cache
  });

  // Flatten data from all pages
  const flattenedData: T[] = data?.pages.flatMap((page) => page.data || []) ?? [];
  const totalItems = data?.pages[0]?.total ?? flattenedData.length;

  return {
    data: flattenedData,
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
