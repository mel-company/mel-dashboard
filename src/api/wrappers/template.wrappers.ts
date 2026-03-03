import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { templateAPI } from "../endpoints/template.endpoints";

/**
 * Query key factory for templates
 */
export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (params?: any) => [...templateKeys.lists(), params] as const,
  searchCursor: (params?: {
    query?: string | null;
    limit?: number;
  }) => [...templateKeys.all, "search-cursor", params] as const,
  details: () => [...templateKeys.all, "detail"] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

/**
 * Get all templates (legacy, page-based)
 */
export const useGetTemplates = () => {
  return useQuery<any, Error, any>({
    queryKey: templateKeys.list(),
    queryFn: () => templateAPI.getTemplates(),
  });
};

/**
 * Search templates with cursor pagination (infinite scroll).
 * Search by name or description. Query is optional.
 */
export const useSearchTemplatesCursor = (
  params?: {
    query?: string | null;
    limit?: number;
  },
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: templateKeys.searchCursor(params),
    enabled,
    queryFn: ({ pageParam }) =>
      templateAPI.searchCursor({
        ...params,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null | undefined,
  });
};
